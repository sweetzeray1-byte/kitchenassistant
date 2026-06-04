"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "./auth-context";

/**
 * Redirects to /login if the user is not authenticated once auth has loaded.
 * Returns the current auth state so callers can show a loading state.
 */
export function useRequireAuth() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      const next = encodeURIComponent(pathname);
      router.replace(`/login?next=${next}`);
    }
  }, [user, loading, router, pathname]);

  return { user, loading, isAuthenticated: !!user };
}
