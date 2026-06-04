"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Card, LinkButton, Button } from "@/components/ui";
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
    tier: "basic",
    name: "Basic",
    price: "$4.99",
    tagline: "For the regular home cook.",
    features: [
      "10 recipe generations / month",
      "100 AI chef replies / month",
      "HD step illustrations",
      "Unlock every recipe you generate",
    ],
    highlighted: true,
  },
  {
    tier: "premium",
    name: "Premium",
    price: "$9.99",
    tagline: "Unlimited culinary creativity.",
    features: [
      "Unlimited recipe generations",
      "Unlimited AI chef replies",
      "Large HD illustrations",
      "Priority generation",
    ],
  },
];

export default function PricingPage() {
  const { user } = useAuth();

  const { data: subscription } = useQuery({
    queryKey: ["subscription"],
    queryFn: () => api.subscriptionStatus(),
    enabled: !!user,
  });

  const currentTier = subscription?.tier;

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

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {PLANS.map((plan) => {
          const isCurrent = currentTier === plan.tier;
          return (
            <Card
              key={plan.tier}
              className={cn(
                "relative flex flex-col p-6",
                plan.highlighted && "border-brand ring-2 ring-brand/20",
              )}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand px-3 py-1 text-xs font-bold text-white">
                  Most popular
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
                {isCurrent ? (
                  <Button variant="outline" fullWidth disabled>
                    Current plan
                  </Button>
                ) : plan.tier === "free" ? (
                  user ? (
                    <Button variant="outline" fullWidth disabled>
                      Included
                    </Button>
                  ) : (
                    <LinkButton href="/signup" variant="outline" fullWidth>
                      Get started
                    </LinkButton>
                  )
                ) : user ? (
                  <Button fullWidth disabled title="Web checkout coming soon">
                    Upgrade (coming soon)
                  </Button>
                ) : (
                  <LinkButton href="/signup" fullWidth>
                    Sign up to upgrade
                  </LinkButton>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-muted-foreground">
        Web checkout is coming soon. In the meantime you can manage your subscription
        through the Kitchen Assistant mobile app.
      </p>
    </div>
  );
}
