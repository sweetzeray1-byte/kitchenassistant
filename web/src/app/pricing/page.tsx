"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Card, LinkButton, Button, ErrorBanner } from "@/components/ui";
import { cn } from "@/lib/utils";

type ProPlan = "weekly" | "monthly" | "annual";

const PRO_PLANS: Record<
  ProPlan,
  { label: string; price: string; cadence: string; sub?: string; badge?: string }
> = {
  weekly: { label: "Weekly", price: "$10", cadence: "/week" },
  monthly: { label: "Monthly", price: "$20", cadence: "/month" },
  annual: {
    label: "Annual",
    price: "$179.99",
    cadence: "/year",
    sub: "≈ $15 / month",
    badge: "Best value",
  },
};

const PLAN_ORDER: ProPlan[] = ["weekly", "monthly", "annual"];

const FREE_FEATURES = [
  "1 full recipe unlock / month",
  "Up to 10 AI chef replies / period",
  "Standard step illustrations",
  "Browse the full Discover catalog",
];

const PRO_FEATURES = [
  "Unlimited recipe generations",
  "Unlimited AI chef replies",
  "HD step illustrations",
  "Full access to the recipe library",
  "Save unlimited favorites",
  "Priority generation",
];

export default function PricingPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: subscription } = useQuery({
    queryKey: ["subscription"],
    queryFn: () => api.subscriptionStatus(),
    enabled: !!user,
  });

  const isPro = subscription ? subscription.tier !== "free" : false;
  const provider = subscription?.provider;

  const [plan, setPlan] = useState<ProPlan>("monthly");
  const [pending, setPending] = useState<"checkout" | "portal" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Handle the return from Stripe Checkout (?checkout=success|cancelled). One-shot
  // sync of external (URL) state into the UI on mount.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const result = new URLSearchParams(window.location.search).get("checkout");
    if (!result) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    let message: string | null = null;
    if (result === "success") {
      message =
        "🎉 Payment received! Your Pro plan is being activated — it should appear within a few seconds.";
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      timer = setTimeout(
        () => queryClient.invalidateQueries({ queryKey: ["subscription"] }),
        3000,
      );
    } else if (result === "cancelled") {
      message = "Checkout cancelled — no charge was made.";
    }

    window.history.replaceState({}, "", "/pricing");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot sync of the checkout result from the URL
    setNotice(message);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [queryClient]);

  const startCheckout = async () => {
    setError(null);
    setPending("checkout");
    try {
      const url = await api.createCheckout(plan);
      window.location.href = url;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not start checkout. Please try again.");
      setPending(null);
    }
  };

  const openPortal = async () => {
    setError(null);
    setPending("portal");
    try {
      const url = await api.billingPortal(`${window.location.origin}/pricing`);
      window.location.href = url;
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not open the billing portal. Please try again.",
      );
      setPending(null);
    }
  };

  const selected = PRO_PLANS[plan];

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Upgrade to <span className="text-brand">Pro</span>
        </h1>
        <p className="mt-3 text-muted-foreground">
          Unlimited AI-generated recipes, unlimited chef chat, and HD illustrations.
        </p>
      </div>

      {notice && (
        <div className="mx-auto mt-8 max-w-2xl rounded-xl border border-brand/20 bg-brand-50 px-4 py-3 text-center text-sm text-brand-700">
          {notice}
        </div>
      )}
      {error && (
        <div className="mx-auto mt-8 max-w-2xl">
          <ErrorBanner message={error} />
        </div>
      )}

      <div className="mt-10 grid items-start gap-6 md:grid-cols-2">
        {/* Free */}
        <Card className={cn("flex flex-col p-6", !isPro && subscription && "ring-2 ring-brand")}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Free</h2>
            {subscription && !isPro && (
              <span className="rounded-full bg-brand px-3 py-1 text-xs font-bold text-white">
                Your plan
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Taste what AI cooking can do.</p>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="text-4xl font-extrabold">$0</span>
          </div>
          <ul className="mt-6 flex-1 space-y-3">
            {FREE_FEATURES.map((f) => (
              <Feature key={f}>{f}</Feature>
            ))}
          </ul>
          <div className="mt-6">
            {!user ? (
              <LinkButton href="/signup" variant="outline" fullWidth>
                Get started
              </LinkButton>
            ) : (
              <Button variant="outline" fullWidth disabled>
                {isPro ? "Included" : "Current plan"}
              </Button>
            )}
          </div>
        </Card>

        {/* Pro */}
        <Card className={cn("relative flex flex-col p-6 border-brand ring-2 ring-brand/20", isPro && "ring-brand")}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Pro</h2>
            {isPro ? (
              <span className="rounded-full bg-brand px-3 py-1 text-xs font-bold text-white">
                Your plan
              </span>
            ) : (
              <span className="rounded-full bg-brand px-3 py-1 text-xs font-bold text-white">
                Most popular
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Unlimited culinary creativity.</p>

          {/* Interval toggle */}
          <div className="mt-4 inline-flex rounded-xl border border-border bg-muted/40 p-1">
            {PLAN_ORDER.map((p) => (
              <button
                key={p}
                onClick={() => setPlan(p)}
                className={cn(
                  "relative rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors",
                  plan === p ? "bg-brand text-white shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {PRO_PLANS[p].label}
                {PRO_PLANS[p].badge && plan !== p && (
                  <span className="ml-1 hidden text-[10px] font-bold text-brand sm:inline">★</span>
                )}
              </button>
            ))}
          </div>

          <div className="mt-4 flex items-baseline gap-1">
            <span className="text-4xl font-extrabold">{selected.price}</span>
            <span className="text-sm text-muted-foreground">{selected.cadence}</span>
          </div>
          <div className="mt-1 h-4 text-xs text-brand">
            {selected.sub ?? ""} {selected.badge ? `· ${selected.badge}` : ""}
          </div>

          <ul className="mt-5 flex-1 space-y-3">
            {PRO_FEATURES.map((f) => (
              <Feature key={f}>{f}</Feature>
            ))}
          </ul>

          <div className="mt-6">
            <ProCta
              user={!!user}
              isPro={isPro}
              provider={provider}
              pending={pending}
              onCheckout={startCheckout}
              onPortal={openPortal}
            />
          </div>

          {isPro && subscription?.currentPeriodEnd && (
            <p className="mt-3 text-center text-xs text-muted-foreground">
              {subscription.cancelAtPeriodEnd ? "Cancels on " : "Renews on "}
              {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
            </p>
          )}
        </Card>
      </div>

      <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-muted-foreground">
        Payments are processed securely by Stripe. Plans purchased here also apply in the Kitchen
        Assistant mobile app, and subscriptions bought in the app are recognized here.
      </p>
    </div>
  );
}

function Feature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-sm">
      <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 5 5L20 7" />
      </svg>
      {children}
    </li>
  );
}

function ProCta({
  user,
  isPro,
  provider,
  pending,
  onCheckout,
  onPortal,
}: {
  user: boolean;
  isPro: boolean;
  provider?: "stripe" | "app" | null;
  pending: "checkout" | "portal" | null;
  onCheckout: () => void;
  onPortal: () => void;
}) {
  if (!user) {
    return (
      <LinkButton href="/signup" fullWidth>
        Sign up to upgrade
      </LinkButton>
    );
  }

  // Already Pro via in-app purchase — Stripe can't manage it.
  if (isPro && provider === "app") {
    return (
      <Button variant="outline" fullWidth disabled title="Manage this plan in the Kitchen Assistant app">
        Active — manage in app
      </Button>
    );
  }

  // Already Pro via Stripe — manage/cancel through the billing portal.
  if (isPro) {
    return (
      <Button variant="outline" fullWidth loading={pending === "portal"} onClick={onPortal}>
        Manage subscription
      </Button>
    );
  }

  // Free user → checkout the selected interval.
  return (
    <Button fullWidth loading={pending === "checkout"} onClick={onCheckout}>
      Upgrade to Pro
    </Button>
  );
}
