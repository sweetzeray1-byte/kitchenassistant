"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Persistent floating "Ask AI Chef" button. Appears on every page except the chat
 * itself (where the composer is already on screen) and the auth screens.
 */
export function ChatFab() {
  const pathname = usePathname();
  if (
    pathname?.startsWith("/chat") ||
    pathname === "/login" ||
    pathname === "/signup"
  ) {
    return null;
  }

  return (
    <Link
      href="/chat"
      aria-label="Ask the AI Chef"
      className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-brand px-4 py-3.5 text-white shadow-lg shadow-brand/30 transition-transform hover:scale-105 active:scale-95"
    >
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
        <path d="M12 3C6.48 3 2 6.58 2 11c0 2.1 1.02 4 2.71 5.41-.1 1.05-.53 2.34-1.45 3.32-.22.24-.05.63.27.6 1.74-.13 3.3-.74 4.4-1.5 1.18.43 2.5.67 3.87.67 5.52 0 10-3.58 10-8s-4.48-8-10-8Z" />
        <path
          d="m12 7 .9 2.6L15.5 10.5l-2.6.9L12 14l-.9-2.6L8.5 10.5l2.6-.9L12 7Z"
          fill="#fff"
        />
      </svg>
      <span className="hidden text-sm font-semibold sm:inline">Ask AI Chef</span>
    </Link>
  );
}
