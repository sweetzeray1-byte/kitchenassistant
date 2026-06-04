"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { RecipeView } from "./recipe-view";
import { Button, Spinner, ErrorBanner } from "./ui";

export function RecipeDetail({ id }: { id: string }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isFavorite, setIsFavorite] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["recipe", id],
    queryFn: () => api.getRecipe(id),
  });

  // Subscription gates the recipe content: only Pro users see ingredients + steps.
  const { data: subscription } = useQuery({
    queryKey: ["subscription"],
    queryFn: () => api.subscriptionStatus(),
    enabled: !!user,
  });
  const isPro = !!subscription && subscription.tier !== "free";

  useEffect(() => {
    if (data) setIsFavorite(data.isFavorite);
  }, [data]);

  const favMutation = useMutation({
    mutationFn: async (next: boolean) => {
      if (next) await api.addFavorite(id);
      else await api.removeFavorite(id);
      return next;
    },
    onMutate: (next) => setIsFavorite(next),
    onError: (_err, next) => setIsFavorite(!next), // rollback
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });

  if (isLoading) {
    return (
      <div className="grid place-items-center py-24 text-brand">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (error || !data) {
    const message =
      error instanceof ApiError && error.status === 404
        ? "This recipe could not be found."
        : "Failed to load this recipe.";
    return (
      <div className="mx-auto max-w-md py-24">
        <ErrorBanner message={message} />
      </div>
    );
  }

  const recipe = data.recipe;

  const shareRecipe = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: recipe.title, url });
      } else {
        await navigator.clipboard.writeText(url);
      }
    } catch {
      // user cancelled or unsupported
    }
  };

  const headerActions = (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={shareRecipe}>
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7M16 6l-4-4-4 4M12 2v13" />
        </svg>
        Share
      </Button>
      {user && (
        <Button
          variant={isFavorite ? "primary" : "outline"}
          size="sm"
          onClick={() => favMutation.mutate(!isFavorite)}
          disabled={favMutation.isPending}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-7.5-4.6-10-9.3C.6 8.4 2.2 5 5.5 5c2 0 3.3 1.1 4.5 2.6C11.2 6.1 12.5 5 14.5 5 17.8 5 19.4 8.4 18 11.7 15.5 16.4 12 21 12 21Z" />
          </svg>
          {isFavorite ? "Saved" : "Save"}
        </Button>
      )}
    </div>
  );

  // Lock for non-Pro users (covers both their own locked generations and public recipes).
  const locked = !!recipe.isLocked || !isPro;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <RecipeView recipe={recipe} headerActions={headerActions} locked={locked} />
    </div>
  );
}
