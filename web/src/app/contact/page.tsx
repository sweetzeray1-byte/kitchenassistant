import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Contact — Kitchen Assistant",
  description:
    "Get in touch with the Kitchen Assistant team. Questions, feedback, billing help, or partnerships — we'd love to hear from you.",
};

const SUPPORT_EMAIL = "support@kitchenassistant.app";

const QUICK_LINKS = [
  {
    title: "Billing & plans",
    body: "Compare tiers or manage your subscription.",
    href: "/pricing",
    cta: "View pricing",
  },
  {
    title: "Common questions",
    body: "Learn how the AI chef and recipe generation work.",
    href: "/about",
    cta: "About us",
  },
  {
    title: "Your privacy",
    body: "See how we handle and protect your data.",
    href: "/privacy",
    cta: "Privacy policy",
  },
];

export default function ContactPage() {
  return (
    <PageShell
      eyebrow="We're here to help"
      title="Get in touch"
      intro="Have a question, found a bug, or just want to share what you cooked? Drop us a note and we'll get back to you."
    >
      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        {/* Form */}
        <div>
          <ContactForm />
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="rounded-2xl border border-border bg-muted/40 p-6">
            <h2 className="text-base font-bold">Email us directly</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Prefer your own email app?
            </p>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="mt-2 inline-block font-medium text-brand hover:underline"
            >
              {SUPPORT_EMAIL}
            </a>
            <p className="mt-4 text-sm text-muted-foreground">
              We typically reply within 1–2 business days.
            </p>
          </div>

          <div className="space-y-3">
            {QUICK_LINKS.map((q) => (
              <Link
                key={q.href}
                href={q.href}
                className="block rounded-2xl border border-border bg-surface p-5 shadow-sm transition-colors hover:border-brand"
              >
                <h3 className="text-sm font-bold">{q.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{q.body}</p>
                <span className="mt-2 inline-block text-sm font-medium text-brand">
                  {q.cta} →
                </span>
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
