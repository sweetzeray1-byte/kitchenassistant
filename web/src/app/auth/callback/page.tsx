"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Spinner } from "@/components/ui";

/**
 * OAuth redirect target. The Supabase browser client (detectSessionInUrl) finishes
 * the PKCE code exchange automatically; we just wait for the session and route on.
 */
function CallbackInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/chat";
  const errorDescription = params.get("error_description") || params.get("error");

  useEffect(() => {
    if (errorDescription) {
      router.replace(`/login?oauth_error=${encodeURIComponent(errorDescription)}`);
      return;
    }

    let active = true;

    const finish = (hasSession: boolean) => {
      if (!active) return;
      active = false;
      router.replace(hasSession ? next : "/login?oauth_error=Sign-in%20failed");
    };

    // The session may already be set, or arrive via the auth-state change after the
    // code exchange completes.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) finish(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) finish(true);
    });

    // Safety net: don't spin forever if the exchange never produces a session.
    const timer = setTimeout(() => finish(false), 8000);

    return () => {
      active = false;
      sub.subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, [router, next, errorDescription]);

  return (
    <div className="grid flex-1 place-items-center py-24 text-brand">
      <div className="flex flex-col items-center gap-3">
        <Spinner className="h-8 w-8" />
        <p className="text-sm text-muted-foreground">Signing you in…</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="flex-1" />}>
      <CallbackInner />
    </Suspense>
  );
}
