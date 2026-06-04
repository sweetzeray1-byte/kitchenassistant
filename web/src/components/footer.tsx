import Link from "next/link";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-muted/40">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <Logo />
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Link href="/discover" className="hover:text-brand">Discover</Link>
          <Link href="/chat" className="hover:text-brand">AI Chef</Link>
          <Link href="/pricing" className="hover:text-brand">Pricing</Link>
        </nav>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Kitchen Assistant
        </p>
      </div>
    </footer>
  );
}
