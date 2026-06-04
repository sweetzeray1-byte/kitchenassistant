"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui";

// Favorites now live inside the profile (Favorites tab). Keep this route working for any
// old links/bookmarks by redirecting to the profile.
export default function FavoritesRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/profile");
  }, [router]);

  return (
    <div className="grid flex-1 place-items-center py-24 text-brand">
      <Spinner className="h-8 w-8" />
    </div>
  );
}
