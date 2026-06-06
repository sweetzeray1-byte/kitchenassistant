"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { useRequireAuth } from "@/lib/use-require-auth";
import type { UserPreferences } from "@/lib/types";
import { RecipeCard, RecipeCardSkeleton } from "@/components/recipe-card";
import { Button, Card, Input, Spinner, ErrorBanner, LinkButton, Badge } from "@/components/ui";
import { titleCase, cn } from "@/lib/utils";

const SKILLS: UserPreferences["cookingSkill"][] = ["beginner", "intermediate", "advanced"];

function toList(s: string): string[] {
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

export default function ProfilePage() {
  const { isAuthenticated, loading } = useRequireAuth();
  const { profile, user, refreshProfile, signOut } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<"generated" | "favorites">("generated");

  if (loading || !isAuthenticated) {
    return (
      <div className="grid flex-1 place-items-center py-24 text-brand">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const displayName = profile?.name || "Your profile";
  const initial = (profile?.name || user?.email || "?").charAt(0).toUpperCase();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      {/* Header banner */}
      <div className="overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-brand-50 via-white to-white">
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-brand text-2xl font-bold text-white shadow-sm">
              {initial}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold">{displayName}</h1>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <LinkButton href="/chat" size="sm">
            ✨ New recipe
          </LinkButton>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <SubscriptionSummary />
          <PreferencesEditor initial={profile?.preferences} onSaved={refreshProfile} />
          <AccountActions
            onSignOut={async () => {
              await signOut();
              router.push("/");
            }}
          />
        </div>

        <div className="lg:col-span-2">
          {/* Tabs: generated recipes + favorites (folded in from the old Favorites page) */}
          <div className="mb-5 inline-flex rounded-xl border border-border bg-white p-1">
            <TabButton active={tab === "generated"} onClick={() => setTab("generated")}>
              Generated
            </TabButton>
            <TabButton active={tab === "favorites"} onClick={() => setTab("favorites")}>
              Favorites
            </TabButton>
          </div>

          {tab === "generated" ? <UserRecipes /> : <FavoriteRecipes />}
        </div>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
        active ? "bg-brand text-white shadow-sm" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function FavoriteRecipes() {
  const { data, isLoading } = useQuery({
    queryKey: ["favorites"],
    queryFn: () => api.favorites(),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <RecipeCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const recipes = data?.recipes ?? [];
  if (recipes.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border py-16 text-center">
        <p className="text-muted-foreground">You haven&apos;t saved any favorites yet.</p>
        <LinkButton href="/discover" className="mt-4">
          Browse recipes
        </LinkButton>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {recipes.map((r, i) => (
        <RecipeCard key={r.id ?? i} recipe={r} />
      ))}
    </div>
  );
}

function SubscriptionSummary() {
  const { data, isLoading } = useQuery({
    queryKey: ["subscription"],
    queryFn: () => api.subscriptionStatus(),
  });

  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);

  const openPortal = async () => {
    setPortalError(null);
    setPortalLoading(true);
    try {
      const url = await api.billingPortal(`${window.location.origin}/profile`);
      window.location.href = url;
    } catch (err) {
      setPortalError(
        err instanceof ApiError ? err.message : "Could not open the billing portal.",
      );
      setPortalLoading(false);
    }
  };

  const isPaid = data ? data.tier !== "free" : false;
  const isStripe = data?.provider === "stripe";
  const isApp = data?.provider === "app";

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Plan</h2>
        {data && <Badge>{titleCase(data.tier)}</Badge>}
      </div>
      {isLoading ? (
        <div className="mt-3 h-5 w-24 rounded bg-muted" />
      ) : data ? (
        <div className="mt-3 space-y-3">
          <UsageRow
            label="Recipe generations"
            used={data.recipeGenerationsUsed}
            remaining={data.recipeGenerationsRemaining}
            limit={data.recipeGenerationsLimit}
          />
          <UsageRow
            label="AI chat replies"
            used={data.aiChatRepliesUsed}
            remaining={data.aiChatRepliesRemaining}
            limit={data.aiChatRepliesLimit}
          />

          {isPaid && data.currentPeriodEnd && (
            <p className="text-xs text-muted-foreground">
              {data.cancelAtPeriodEnd ? "Cancels on " : "Renews on "}
              {new Date(data.currentPeriodEnd).toLocaleDateString()}
            </p>
          )}

          {portalError && <ErrorBanner message={portalError} />}

          {/* Contextual action: manage via the same channel the plan was bought on. */}
          {!isPaid ? (
            <LinkButton href="/pricing" fullWidth>
              Upgrade plan
            </LinkButton>
          ) : isStripe ? (
            <Button
              variant="outline"
              fullWidth
              loading={portalLoading}
              onClick={openPortal}
            >
              Manage subscription
            </Button>
          ) : isApp ? (
            <p className="rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-center text-xs text-muted-foreground">
              Subscribed via the mobile app — manage or cancel in the Kitchen Assistant app.
            </p>
          ) : (
            <LinkButton href="/pricing" variant="outline" fullWidth>
              View plans
            </LinkButton>
          )}
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">Unable to load plan.</p>
      )}
    </Card>
  );
}

function UsageRow({
  label,
  used,
  limit,
}: {
  label: string;
  used: number;
  remaining: number;
  limit: number;
}) {
  const unlimited = limit === -1;
  const pct = unlimited ? 0 : limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span>{unlimited ? "Unlimited" : `${used} / ${limit}`}</span>
      </div>
      {!unlimited && (
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  );
}

function PreferencesEditor({
  initial,
  onSaved,
}: {
  initial?: UserPreferences;
  onSaved: () => Promise<void>;
}) {
  const [dietary, setDietary] = useState("");
  const [allergies, setAllergies] = useState("");
  const [cuisines, setCuisines] = useState("");
  const [skill, setSkill] = useState<UserPreferences["cookingSkill"]>("beginner");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (initial) {
      // Seed the form once the user's saved preferences load in.
      /* eslint-disable react-hooks/set-state-in-effect -- syncing async-loaded initial values into editable form state */
      setDietary((initial.dietaryRestrictions ?? []).join(", "));
      setAllergies((initial.allergies ?? []).join(", "));
      setCuisines((initial.favoriteCuisines ?? []).join(", "));
      setSkill(initial.cookingSkill ?? "beginner");
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [initial]);

  const save = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await api.updatePreferences({
        dietaryRestrictions: toList(dietary),
        allergies: toList(allergies),
        favoriteCuisines: toList(cuisines),
        cookingSkill: skill,
        likedFoodCategoryIds: initial?.likedFoodCategoryIds ?? [],
      });
      await onSaved();
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save preferences.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-5">
      <h2 className="text-lg font-bold">Cooking preferences</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        These tailor the recipes AI generates for you.
      </p>
      <div className="mt-4 space-y-3">
        {error && <ErrorBanner message={error} />}
        <Field label="Dietary restrictions">
          <Input value={dietary} onChange={(e) => setDietary(e.target.value)} placeholder="vegetarian, keto…" />
        </Field>
        <Field label="Allergies">
          <Input value={allergies} onChange={(e) => setAllergies(e.target.value)} placeholder="peanuts, shellfish…" />
        </Field>
        <Field label="Favorite cuisines">
          <Input value={cuisines} onChange={(e) => setCuisines(e.target.value)} placeholder="italian, thai…" />
        </Field>
        <Field label="Cooking skill">
          <select
            value={skill}
            onChange={(e) => setSkill(e.target.value as UserPreferences["cookingSkill"])}
            className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          >
            {SKILLS.map((s) => (
              <option key={s} value={s}>
                {titleCase(s)}
              </option>
            ))}
          </select>
        </Field>
        <Button onClick={save} loading={saving} fullWidth>
          {saved ? "Saved ✓" : "Save preferences"}
        </Button>
      </div>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

function UserRecipes() {
  const { data, isLoading } = useQuery({
    queryKey: ["user-recipes"],
    queryFn: () => api.userRecipes(),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <RecipeCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const recipes = data?.recipes ?? [];
  if (recipes.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border py-16 text-center">
        <p className="text-muted-foreground">No recipes yet.</p>
        <LinkButton href="/chat" className="mt-4">
          Generate your first recipe
        </LinkButton>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {recipes.map((r, i) => (
        <RecipeCard key={r.id ?? i} recipe={r} />
      ))}
    </div>
  );
}

function AccountActions({ onSignOut }: { onSignOut: () => Promise<void> }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!confirm("Delete your account permanently? This cannot be undone.")) return;
    setDeleting(true);
    setError(null);
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/me/delete`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok && res.status !== 204) throw new Error("Failed to delete account.");
      await supabase.auth.signOut();
      window.location.href = "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete account.");
      setDeleting(false);
    }
  };

  return (
    <Card className="p-5">
      <h2 className="text-lg font-bold">Account</h2>
      <div className="mt-4 space-y-2">
        {error && <ErrorBanner message={error} />}
        <Button variant="outline" fullWidth onClick={onSignOut}>
          Sign out
        </Button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="w-full rounded-xl px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          {deleting ? "Deleting…" : "Delete account"}
        </button>
      </div>
    </Card>
  );
}
