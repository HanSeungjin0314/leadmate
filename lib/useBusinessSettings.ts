"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { normalizeSettings, type BusinessSettings } from "@/lib/business";

export function useBusinessSettings(options?: { redirectToOnboarding?: boolean }) {
  const router = useRouter();
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data: member } = await supabase.from("business_members").select("business_id").eq("user_id", user.id).limit(1).maybeSingle();
    if (!member?.business_id) {
      setSettings(null); setLoading(false);
      if (options?.redirectToOnboarding !== false) router.replace("/onboarding");
      return;
    }
    const { data } = await supabase.from("business_settings").select("*").eq("business_id", member.business_id).maybeSingle();
    const normalized = normalizeSettings(data);
    setSettings(normalized); setLoading(false);
    if ((!normalized || !normalized.onboarding_completed) && options?.redirectToOnboarding !== false) router.replace("/onboarding");
  }, [options?.redirectToOnboarding, router]);

  useEffect(() => { reload(); }, [reload]);
  return { settings, loading, reload };
}
