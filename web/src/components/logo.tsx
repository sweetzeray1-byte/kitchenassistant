import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  withText = true,
}: {
  className?: string;
  withText?: boolean;
}) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2", className)}>
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-white">
        {/* chef hat / cooking glyph */}
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
          <path d="M7 21h10a1 1 0 0 0 1-1v-3H6v3a1 1 0 0 0 1 1Zm9.5-16A4.5 4.5 0 0 0 12 6a4.5 4.5 0 0 0-8.96.86A3.5 3.5 0 0 0 6 15h12a3.5 3.5 0 0 0 .96-6.86A4.49 4.49 0 0 0 16.5 5Z" />
        </svg>
      </span>
      {withText && (
        <span className="text-lg font-extrabold tracking-tight text-foreground">
          Kitchen<span className="text-brand">Assistant</span>
        </span>
      )}
    </Link>
  );
}
