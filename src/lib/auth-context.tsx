import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { getPublicConfig, syncSubscription } from "@/lib/app.functions";
import type { CustomerInfo } from "@revenuecat/purchases-js";

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();
  const getPublicConfigFn = useServerFn(getPublicConfig);
  const syncSubscriptionFn = useServerFn(syncSubscription);
  const lastSyncedUserId = useRef<string | null>(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => {
      setSession(s);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const user = session?.user;
    if (!user) {
      lastSyncedUserId.current = null;
      return;
    }

    if (lastSyncedUserId.current === user.id) return;
    lastSyncedUserId.current = user.id;

    let cancelled = false;

    async function refreshRevenueCatSubscription(currentUser: User) {
      try {
        const config = await getPublicConfigFn();
        if (!config.revenueCatKey) return;

        const { Purchases } = await import("@revenuecat/purchases-js");
        let purchases = Purchases.isConfigured()
          ? Purchases.getSharedInstance()
          : Purchases.configure({ apiKey: config.revenueCatKey, appUserId: currentUser.id });

        let customerInfo: CustomerInfo;
        if (purchases.getAppUserId() !== currentUser.id) {
          customerInfo = await purchases.changeUser(currentUser.id);
          purchases = Purchases.getSharedInstance();
        } else {
          customerInfo = await purchases.getCustomerInfo();
        }

        if (cancelled) return;

        const activeEntitlements = Object.values(customerInfo.entitlements.active);
        const isPro = activeEntitlements.length > 0 || customerInfo.activeSubscriptions.size > 0;
        const expiresAt = activeEntitlements
          .map((entitlement) => entitlement.expirationDate)
          .filter((date): date is Date => date instanceof Date)
          .sort((a, b) => b.getTime() - a.getTime())[0]?.toISOString() ?? null;

        await syncSubscriptionFn({
          data: {
            isPro,
            expiresAt,
            customerId: purchases.getAppUserId(),
          },
        });

        if (!cancelled) {
          queryClient.invalidateQueries({ queryKey: ["profile"] });
        }
      } catch (error) {
        lastSyncedUserId.current = null;
        console.warn("RevenueCat subscription sync failed", error);
      }
    }

    refreshRevenueCatSubscription(user);

    return () => {
      cancelled = true;
    };
  }, [getPublicConfigFn, queryClient, session?.user, syncSubscriptionFn]);

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        session,
        loading,
        signOut: async () => {
          await supabase.auth.signOut();
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
