import type { Metadata } from "next";
import { LinkButton } from "@/components/ui";

export const metadata: Metadata = {
  title: "About — Kitchen Assistant",
  description:
    "Kitchen Assistant turns cravings into beautiful, illustrated recipes with AI. Learn about our mission to make great home cooking effortless for everyone.",
};

const VALUES = [
  {
    title: "Cooking for everyone",
    body: "Whether you're a first-time cook or a weeknight veteran, our AI chef meets you where you are — adjusting for your skill level, diet, and what's already in your kitchen.",
  },
  {
    title: "Beautiful by default",
    body: "Every recipe comes with clear, illustrated, step-by-step guidance so you always know what each stage should look like — not just a wall of text.",
  },
  {
    title: "Honest about food",
    body: "We're transparent that recipes are AI-generated. We surface ingredients, nutrition estimates, and reminders to use your own judgment around allergens and food safety.",
  },
  {
    title: "Built to respect you",
    body: "Your recipes, preferences, and data are yours. We keep things simple, private, and free to start — no clutter, no dark patterns.",
  },
];

const STEPS = [
  {
    n: "1",
    title: "Tell us what you're craving",
    body: "Type a dish, a craving, a dietary need, or just what's in your fridge. Chat naturally with your AI chef.",
  },
  {
    n: "2",
    title: "Get an illustrated recipe",
    body: "We generate a complete recipe — ingredients, timing, nutrition, and illustrated steps tailored to your preferences.",
  },
  {
    n: "3",
    title: "Cook, save, and come back",
    body: "Follow along hands-free, save favorites, and discover new dishes from our growing community catalog.",
  },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-b from-brand-50/70 via-white to-white">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand">
            Our story
          </p>
          <h1 className="mx-auto mt-3 max-w-2xl text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            Great home cooking, made <span className="text-brand">effortless</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
            Kitchen Assistant was born from a simple frustration: deciding what to cook
            is harder than the cooking itself. We built an AI chef that turns any craving
            into a beautiful, illustrated recipe — in seconds.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="mx-auto w-full max-w-3xl px-4 py-12">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Our mission</h2>
        <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-foreground/80">
          <p>
            We believe everyone deserves to cook food they&apos;re proud of — without spending
            hours scrolling endless blogs, dodging pop-ups, or wading through someone&apos;s
            life story to find a list of ingredients.
          </p>
          <p>
            Kitchen Assistant pairs the creativity of a personal chef with the patience of
            a teacher. Describe what you want, and our AI generates a complete recipe
            tailored to your taste, diet, skill level, and the ingredients you already
            have. Each step is illustrated so you always know exactly what to do next.
          </p>
          <p>
            We&apos;re a small team obsessed with the intersection of food and technology — and
            we&apos;re just getting started.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted/40">
        <div className="mx-auto w-full max-w-5xl px-4 py-14">
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            How it works
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand text-lg font-bold text-white">
                  {s.n}
                </span>
                <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto w-full max-w-5xl px-4 py-14">
        <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
          What we stand for
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {VALUES.map((v) => (
            <div key={v.title} className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
              <h3 className="text-lg font-bold">{v.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                {v.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand">
        <div className="mx-auto max-w-4xl px-4 py-14 text-center text-white">
          <h2 className="text-2xl font-extrabold sm:text-3xl">
            Ready to cook something great?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/90">
            Start free — no credit card required. Your next favorite meal is one message away.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <LinkButton href="/signup" variant="white" size="lg">
              Get started free
            </LinkButton>
            <LinkButton
              href="/chat"
              size="lg"
              className="border border-white/40 bg-transparent text-white hover:bg-white/10"
            >
              Try the AI Chef
            </LinkButton>
          </div>
        </div>
      </section>
    </div>
  );
}
