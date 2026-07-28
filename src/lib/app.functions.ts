import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

// Conversations
export const listConversations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("conversations")
      .select("id, title, pinned, updated_at, created_at")
      .order("pinned", { ascending: false })
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createConversation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { title?: string }) => d)
  .handler(async ({ context, data }) => {
    const { data: row, error } = await context.supabase
      .from("conversations")
      .insert({ user_id: context.userId, title: data.title ?? "New Chat" })
      .select("id, title, pinned, updated_at, created_at")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const renameConversation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; title: string }) => d)
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase
      .from("conversations")
      .update({ title: data.title })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteConversation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("conversations").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { conversationId: string }) =>
    z.object({ conversationId: z.string().uuid() }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const { data: rows, error } = await context.supabase
      .from("messages")
      .select("id, role, content, created_at")
      .eq("conversation_id", data.conversationId)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const saveMessages = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    conversationId: string;
    messages: { role: "user" | "assistant"; content: string }[];
  }) => d)
  .handler(async ({ context, data }) => {
    const rows = data.messages.map((m) => ({
      conversation_id: data.conversationId,
      user_id: context.userId,
      role: m.role,
      content: m.content,
    }));
    const { error } = await context.supabase.from("messages").insert(rows);
    if (error) throw new Error(error.message);
    await context.supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", data.conversationId);
    return { ok: true };
  });

// Profile
export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [{ data: profile }, { data: sub }, { count }] = await Promise.all([
      context.supabase.from("profiles").select("*").eq("id", context.userId).maybeSingle(),
      context.supabase.from("subscriptions").select("*").eq("user_id", context.userId).maybeSingle(),
      context.supabase.from("messages").select("*", { count: "exact", head: true }).eq("role", "user"),
    ]);
    return { profile, subscription: sub, messageCount: count ?? 0 };
  });

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { display_name?: string; avatar_url?: string }) => d)
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase
      .from("profiles")
      .update({
        ...(data.display_name !== undefined ? { display_name: data.display_name } : {}),
        ...(data.avatar_url !== undefined ? { avatar_url: data.avatar_url } : {}),
      })
      .eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const decrementFreeMessages = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: profile } = await context.supabase
      .from("profiles")
      .select("remaining_free_messages")
      .eq("id", context.userId)
      .maybeSingle();
    const { data: sub } = await context.supabase
      .from("subscriptions")
      .select("plan, status")
      .eq("user_id", context.userId)
      .maybeSingle();
    const isPro = sub?.plan === "pro" && sub.status === "active";
    if (isPro) return { remaining: Infinity, isPro: true };
    const remaining = Math.max(0, (profile?.remaining_free_messages ?? 0) - 1);
    await context.supabase
      .from("profiles")
      .update({ remaining_free_messages: remaining })
      .eq("id", context.userId);
    return { remaining, isPro: false };
  });

// Images
export const listImages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("generated_images")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(60);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const saveImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { prompt: string; style: string; size: string; image_url: string }) => d)
  .handler(async ({ context, data }) => {
    const { data: row, error } = await context.supabase
      .from("generated_images")
      .insert({ ...data, user_id: context.userId })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

// Config
export const getPublicConfig = createServerFn({ method: "GET" }).handler(async () => {
  return {
    revenueCatKey: process.env.REVENUECAT_PUBLIC_KEY ?? "",
  };
});

// RevenueCat sync — checks the customer's entitlements and updates the subscriptions row.
export const syncSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { isPro: boolean; expiresAt?: string | null; customerId?: string }) => d)
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("subscriptions").upsert(
      {
        user_id: context.userId,
        plan: data.isPro ? "pro" : "free",
        status: data.isPro ? "active" : "inactive",
        current_period_end: data.expiresAt ?? null,
        revenuecat_customer_id: data.customerId ?? null,
      },
      { onConflict: "user_id" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });
