import type { Metadata } from "next";
import { PageShell, Section, List, ProseLink } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Support — Kitchen Assistant",
  description:
    "Get help with Kitchen Assistant: contact support, browse common questions, manage your subscription, and learn how to delete your account.",
  alternates: { canonical: "/support" },
};

const SUPPORT_EMAIL = "support@kitchenassistant.app";

export default function SupportPage() {
  return (
    <PageShell
      eyebrow="Help Center"
      title="Support"
      intro="Need a hand? Reach our team directly or find answers to the most common questions below. We typically reply within 1–2 business days."
    >
      <Section title="Contact us">
        <p>
          The fastest way to reach us is by email. Tell us what device you&apos;re on and
          what you were doing, and we&apos;ll get back to you as soon as we can.
        </p>
        <List
          items={[
            <>
              Email:{" "}
              <ProseLink href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</ProseLink>
            </>,
            <>
              Contact form: <ProseLink href="/contact">visit our Contact page</ProseLink>
            </>,
          ]}
        />
      </Section>

      <Section title="Account & subscriptions">
        <List
          items={[
            "Manage your plan — open the app, go to your profile, and tap Subscription to upgrade, downgrade, or cancel.",
            "Apple subscriptions — if you subscribed through the App Store, you can also manage or cancel anytime in Settings → your name → Subscriptions on your iPhone or iPad.",
            "Billing questions — email us and include the email address on your account so we can look into it quickly.",
          ]}
        />
      </Section>

      <Section title="Deleting your account">
        <p>
          You can permanently delete your account and associated data at any time from
          within the app: open your profile, then choose <strong>Delete account</strong>.
          You can also email us at{" "}
          <ProseLink href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</ProseLink> to request
          deletion and we will remove your personal information in accordance with our{" "}
          <ProseLink href="/privacy">Privacy Policy</ProseLink>.
        </p>
      </Section>

      <Section title="Common questions">
        <List
          items={[
            "How do recipes work? — Describe a craving or list ingredients you have, and Kitchen Assistant generates an illustrated, step-by-step recipe with your personal AI chef.",
            "Are the recipes safe? — Recipes are AI-generated. Always use your own judgment around allergens, food safety, and dietary needs.",
            "Why is a feature locked? — Some features and higher generation limits are part of a paid plan. See our pricing for details.",
            "I found a bug — Please email us with a description and a screenshot if possible. Bug reports genuinely help us improve.",
          ]}
        />
        <p>
          For plans and pricing, see <ProseLink href="/pricing">Pricing</ProseLink>. To learn
          more about how the app works, visit <ProseLink href="/about">About</ProseLink>.
        </p>
      </Section>

      <Section title="Privacy & terms">
        <p>
          Read how we handle your data in our{" "}
          <ProseLink href="/privacy">Privacy Policy</ProseLink>, and review the rules for using
          the Service in our <ProseLink href="/terms">Terms of Service</ProseLink>.
        </p>
      </Section>
    </PageShell>
  );
}
