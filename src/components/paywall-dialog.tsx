import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Loader2, Sparkles } from "lucide-react";
import { getPublicConfig, syncSubscription } from "@/lib/app.functions";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Purchases } from "@revenuecat/purchases-js";

type Offering = {
  identifier: string;
  serverDescription?: string;
  availablePackages: Array<{
    identifier: string;
    rcBillingProduct?: {
      currentPrice?: { formattedPrice?: string };
      title?: string;
      normalPeriodDuration?: string;
    };
  }>;
};

export function PaywallDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (b: boolean) => void }) {
  const { user } = useAuth();
  const getCfg = useServerFn(getPublicConfig);
  const syncFn = useServerFn(syncSubscription);
  const [ready, setReady] = useState(false);
  const [offering, setOffering] = useState<Offering | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !user || ready) return;
    (async () => {
      try {
        const cfg = await getCfg();
        if (!cfg.revenueCatKey) {
          toast.error("Billing isn't configured yet.");
          return;
        }
        Purchases.configure(cfg.revenueCatKey, user.id);
        const offerings = await Purchases.getSharedInstance().getOfferings();
        setOffering((offerings.current as unknown as Offering) ?? null);
        setReady(true);
      } catch (err) {
        console.error(err);
        toast.error("Couldn't load subscription plans.");
      }
    })();
  }, [open, user, ready, getCfg]);

  async function purchase(packageId: string) {
    if (!offering) return;
    const pkg = offering.availablePackages.find((p) => p.identifier === packageId);
    if (!pkg) return;
    setBusy(packageId);
    try {
      const result = await Purchases.getSharedInstance().purchase({ rcPackage: pkg as never });
      const entitlement = Object.values(result.customerInfo.entitlements.active)[0] as
        | { expiresDate?: string | Date | null }
        | undefined;
      const isPro = Boolean(entitlement);
      const expires = entitlement?.expiresDate;
      await syncFn({
        data: {
          isPro,
          expiresAt: expires ? new Date(expires).toISOString() : null,
          customerId: result.customerInfo.originalAppUserId,
        },
      });
      toast.success("Welcome to Pro!");
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Purchase failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Upgrade to DashBot Pro</DialogTitle>
          <DialogDescription>Unlock unlimited AI chat, images, and priority responses.</DialogDescription>
        </DialogHeader>

        {!ready ? (
          <div className="grid place-items-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : !offering ? (
          <div className="rounded-xl bg-muted/40 p-6 text-sm text-muted-foreground">
            No offerings found. Please set up Pro Monthly and Pro Yearly products in RevenueCat.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {offering.availablePackages.map((pkg) => (
              <div key={pkg.identifier} className="glass rounded-2xl p-5">
                <div className="text-sm font-medium">{pkg.rcBillingProduct?.title ?? pkg.identifier}</div>
                <div className="mt-1 text-2xl font-bold">{pkg.rcBillingProduct?.currentPrice?.formattedPrice ?? "—"}</div>
                <ul className="mt-4 space-y-2 text-sm">
                  {["Unlimited chat", "Unlimited images", "Priority responses"].map((f) => (
                    <li key={f} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-primary" /> {f}</li>
                  ))}
                </ul>
                <Button
                  className="mt-5 w-full gradient-primary text-primary-foreground shadow-glow"
                  onClick={() => purchase(pkg.identifier)}
                  disabled={!!busy}
                >
                  {busy === pkg.identifier ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Subscribe
                </Button>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
