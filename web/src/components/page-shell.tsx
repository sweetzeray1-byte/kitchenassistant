import Link from "next/link";

/**
 * Shared shell for content / legal pages (About, Terms, Privacy, Contact).
 * Renders a consistent header block; children supply the body.
 */
export function PageShell({
  eyebrow,
  title,
  intro,
  updated,
  children,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:py-16">
      <header className="border-b border-border pb-8">
        {eyebrow && (
          <p className="text-sm font-semibold uppercase tracking-wide text-brand">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
          {title}
        </h1>
        {intro && (
          <p className="mt-4 text-lg text-muted-foreground">{intro}</p>
        )}
        {updated && (
          <p className="mt-4 text-sm text-muted-foreground">Last updated: {updated}</p>
        )}
      </header>
      <div className="mt-8">{children}</div>
    </div>
  );
}

/** A titled section within a policy/content page. */
export function Section({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 py-5">
      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-foreground/80">
        {children}
      </div>
    </section>
  );
}

/** Styled bulleted list for use inside Section. */
export function List({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5">
          <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** Inline link styled with the brand accent. */
export function ProseLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const external = href.startsWith("http") || href.startsWith("mailto:");
  if (external) {
    return (
      <a href={href} className="font-medium text-brand hover:underline">
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className="font-medium text-brand hover:underline">
      {children}
    </Link>
  );
}
