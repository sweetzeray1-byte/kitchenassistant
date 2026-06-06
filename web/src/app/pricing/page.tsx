"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Card, LinkButton, Button, ErrorBanner } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { SubscriptionTier } from "@/lib/types";

interface Plan {
  tier: SubscriptionTier;
  name: string;
  price: string;
  tagline: string;
  features: string[];
  highlighted?: boolean;
}

// The mobile app sells a single paid plan ("Pro"). The web mirrors it: "Pro" maps to
// the backend `premium` tier, which is also where the RevenueCat 'Pro' entitlement lands —
// so a plan bought on either platform is recognized on both.
const PLANS: Plan[] = [
  {
    tier: "free",
    name: "Free",
    price: "$0",
    tagline: "Taste what AI cooking can do.",
    features: [
      "1 recipe generation / month",
      "10 AI chef replies / month",
      "Standard step illustrations",
      "Browse the full Discover catalog",
    ],
  },
  {
    tier: "premium",
    name: "Pro",
    price: "$9.99",
    tagline: "Unlimited culinary creativity.",
    features: [
      "Unlimited recipe generations",
      "Unlimited AI chef replies",
      "Large HD step illustrations",
      "Priority generation",
      "Unlock every recipe you generate",
    ],
    highlighted: true,
  },
];

const TIER_RANK: Record<SubscriptionTier, number> = { free: 0, basic: 1, premium: 2 };

export default function PricingPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: subscription } = useQuery({
    queryKey: ["subscription"],
    queryFn: () => api.subscriptionStatus(),
    enabled: !!user,
  });

  const currentTier = subscription?.tier;
  const hasPaidPlan = currentTier === "basic" || currentTier === "premium";

  // Per-action loading + error feedback.
  const [pending, setPending] = useState<SubscriptionTier | "portal" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Handle the return from Stripe Checkout (?checkout=success|cancelled). This is a
  // one-shot sync of external (URL) state into the UI on mount.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const result = new URLSearchParams(window.location.search).get("checkout");
    if (!result) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    let message: string | null = null;
    if (result === "success") {
      message =
        "🎉 Payment received! Your new plan is being activated — it should appear within a few seconds.";
      // The webhook updates our DB; refetch a couple of times to catch it.
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      timer = setTimeout(
        () => queryClient.invalidateQueries({ queryKey: ["subscription"] }),
        3000,
      );
    } else if (result === "cancelled") {
      message = "Checkout cancelled — no charge was made.";
    }

    // Clean the query string so refreshes don't re-trigger the banner.
    window.history.replaceState({}, "", "/pricing");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot sync of the checkout result from the URL
    setNotice(message);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [queryClient]);

  const startCheckout = async (tier: "basic" | "premium") => {
    setError(null);
    setPending(tier);
    try {
      const url = await api.createCheckout(tier);
      window.location.href = url;
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Could not start checkout. Please try again.";
      setError(message);
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
      const message =
        err instanceof ApiError
          ? err.message
          : "Could not open the billing portal. Please try again.";
      setError(message);
      setPending(null);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Choose your plan
        </h1>
        <p className="mt-3 text-muted-foreground">
          Start free. Upgrade anytime to unlock unlimited AI-generated recipes.
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

      <div className="mx-auto mt-10 grid max-w-3xl gap-6 sm:grid-cols-2">
        {PLANS.map((plan) => {
          const isCurrent = currentTier === plan.tier;
          return (
            <Card
              key={plan.tier}
              className={cn(
                "relative flex flex-col p-6",
                plan.highlighted && "border-brand ring-2 ring-brand/20",
                isCurrent && "ring-2 ring-brand",
              )}
            >
              {plan.highlighted && !isCurrent && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand px-3 py-1 text-xs font-bold text-white">
                  Most popular
                </span>
              )}
              {isCurrent && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand px-3 py-1 text-xs font-bold text-white">
                  Your plan
                </span>
              )}
              <h2 className="text-xl font-bold">{plan.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold">{plan.price}</span>
                {plan.tier !== "free" && (
                  <span className="text-sm text-muted-foreground">/ month</span>
                )}
              </div>

              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 5 5L20 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                <PlanCta
                  plan={plan}
                  user={!!user}
                  isCurrent={isCurrent}
                  hasPaidPlan={hasPaidPlan}
                  currentTier={currentTier}
                  provider={subscription?.provider}
                  pending={pending}
                  onCheckout={startCheckout}
                  onPortal={openPortal}
                />
              </div>

              {isCurrent && subscription?.cancelAtPeriodEnd && subscription.currentPeriodEnd && (
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Cancels on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              )}
            </Card>
          );
        })}
      </div>

      <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-muted-foreground">
        Payments are processed securely by Stripe. Plans purchased here also apply in the
        Kitchen Assistant mobile app, and subscriptions bought in the app are recognized here.
      </p>
    </div>
  );
}

function PlanCta({
  plan,
  user,
  isCurrent,
  hasPaidPlan,
  currentTier,
  provider,
  pending,
  onCheckout,
  onPortal,
}: {
  plan: Plan;
  user: boolean;
  isCurrent: boolean;
  hasPaidPlan: boolean;
  currentTier?: SubscriptionTier;
  provider?: "stripe" | "app" | null;
  pending: SubscriptionTier | "portal" | null;
  onCheckout: (tier: "basic" | "premium") => void;
  onPortal: () => void;
}) {
  // Logged-out visitors are routed to sign up first.
  if (!user) {
    return (
      <LinkButton
        href="/signup"
        variant={plan.tier === "free" ? "outline" : "primary"}
        fullWidth
      >
        {plan.tier === "free" ? "Get started" : "Sign up to upgrade"}
      </LinkButton>
    );
  }

  // The free plan is always included for signed-in users.
  if (plan.tier === "free") {
    return (
      <Button variant="outline" fullWidth disabled>
        {isCurrent ? "Current plan" : "Included"}
      </Button>
    );
  }

  // Plan was purchased through an in-app purchase (RevenueCat). Stripe can't manage
  // it, and a web checkout would double-bill — direct the user to the app instead.
  if (hasPaidPlan && provider === "app") {
    return (
      <Button variant="outline" fullWidth disabled title="Manage this plan in the Kitchen Assistant app">
        {isCurrent ? "Active — manage in app" : "Manage in app"}
      </Button>
    );
  }

  // Paid plan, and it's the user's active Stripe plan → manage/cancel via the portal.
  if (isCurrent) {
    return (
      <Button
        variant="outline"
        fullWidth
        loading={pending === "portal"}
        onClick={onPortal}
      >
        Manage subscription
      </Button>
    );
  }

  // User already has a paid Stripe plan but is viewing a different one → change via the
  // portal (a fresh checkout would create a second subscription).
  if (hasPaidPlan) {
    const upgrading = currentTier ? TIER_RANK[plan.tier] > TIER_RANK[currentTier] : false;
    return (
      <Button
        variant={upgrading ? "primary" : "outline"}
        fullWidth
        loading={pending === "portal"}
        onClick={onPortal}
      >
        {upgrading ? "Upgrade plan" : "Change plan"}
      </Button>
    );
  }

  // Free user upgrading to a paid plan → Stripe Checkout.
  return (
    <Button
      fullWidth
      loading={pending === plan.tier}
      onClick={() => onCheckout(plan.tier as "basic" | "premium")}
    >
      Upgrade
    </Button>
  );
}
