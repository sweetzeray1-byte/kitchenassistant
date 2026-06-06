import type { Metadata } from "next";
import { PageShell, Section, List, ProseLink } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Privacy Policy — Kitchen Assistant",
  description:
    "How Kitchen Assistant collects, uses, and protects your personal information when you use our AI recipe generation service.",
};

const SUPPORT_EMAIL = "support@kitchenassistant.app";

export default function PrivacyPage() {
  return (
    <PageShell
      eyebrow="Legal"
      title="Privacy Policy"
      intro="Your trust matters. This policy explains what we collect, why, and the choices you have."
      updated="June 6, 2026"
    >
      <Section title="1. Introduction">
        <p>
          This Privacy Policy describes how Kitchen Assistant (&quot;we,&quot; &quot;us,&quot;
          or &quot;our&quot;) collects, uses, and shares information about you when you use our
          website, mobile apps, and AI recipe generation services (the &quot;Service&quot;). By
          using the Service, you agree to the practices described here and in our{" "}
          <ProseLink href="/terms">Terms of Service</ProseLink>.
        </p>
      </Section>

      <Section title="2. Information we collect">
        <p>We collect the following categories of information:</p>
        <List
          items={[
            "Account information — your name, email address, and password (stored securely and hashed) when you sign up.",
            "Cooking preferences — dietary restrictions, allergies, cuisine preferences, and skill level you share to personalize recipes.",
            "Content you create — the prompts you send to the AI chef, recipes you generate, and dishes you save or favorite.",
            "Usage data — how you interact with the Service, such as features used, pages viewed, and generation counts.",
            "Device & technical data — IP address, browser type, device identifiers, and approximate location derived from your IP.",
            "Payment information — if you subscribe to a paid plan, billing details are processed by our payment provider; we do not store full card numbers.",
          ]}
        />
      </Section>

      <Section title="3. How we use your information">
        <List
          items={[
            "To generate personalized recipes, illustrations, and AI chef responses tailored to your preferences.",
            "To create and manage your account and provide customer support.",
            "To process subscriptions, payments, and usage limits.",
            "To maintain, secure, debug, and improve the Service.",
            "To communicate with you about updates, features, and important notices.",
            "To detect, prevent, and address fraud, abuse, and security issues.",
            "To comply with legal obligations.",
          ]}
        />
      </Section>

      <Section title="4. AI processing">
        <p>
          To generate recipes and chat responses, the prompts and preferences you provide are
          sent to third-party AI model providers that process them on our behalf. We share only
          what is needed to generate your results. We do not sell your personal information, and
          we instruct our providers to handle your data in accordance with applicable law.
        </p>
      </Section>

      <Section title="5. How we share information">
        <p>We share information only in limited circumstances:</p>
        <List
          items={[
            "Service providers — AI model providers, cloud hosting, analytics, and payment processors that help us operate the Service.",
            "Legal reasons — when required by law, regulation, legal process, or to protect the rights, safety, and property of Kitchen Assistant or others.",
            "Business transfers — in connection with a merger, acquisition, or sale of assets, with notice to you.",
            "With your consent — when you ask us to share information with a third party.",
          ]}
        />
        <p>We do not sell your personal information to advertisers or data brokers.</p>
      </Section>

      <Section title="6. Cookies & analytics">
        <p>
          We use cookies and similar technologies to keep you signed in, remember your
          preferences, and understand how the Service is used so we can improve it. You can
          control cookies through your browser settings, though some features may not work
          properly if cookies are disabled.
        </p>
      </Section>

      <Section title="7. Data retention">
        <p>
          We retain your information for as long as your account is active or as needed to
          provide the Service. We may retain certain information to comply with legal
          obligations, resolve disputes, and enforce our agreements. When you delete your
          account, we delete or anonymize your personal information within a reasonable period,
          except where retention is required by law.
        </p>
      </Section>

      <Section title="8. Your rights & choices">
        <p>
          Depending on where you live, you may have the right to access, correct, delete, or
          export your personal information, and to object to or restrict certain processing. You
          can:
        </p>
        <List
          items={[
            "Update your account and preferences directly in the app.",
            "Request a copy or deletion of your data by contacting us.",
            "Opt out of non-essential marketing emails using the unsubscribe link.",
          ]}
        />
        <p>
          To exercise any of these rights, email us at{" "}
          <ProseLink href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</ProseLink>. We will
          respond within the timeframe required by applicable law.
        </p>
      </Section>

      <Section title="9. Data security">
        <p>
          We use industry-standard safeguards — including encryption in transit and access
          controls — to protect your information. However, no method of transmission or storage
          is completely secure, and we cannot guarantee absolute security.
        </p>
      </Section>

      <Section title="10. Children's privacy">
        <p>
          The Service is not directed to children under 16, and we do not knowingly collect
          personal information from them. If you believe a child has provided us with personal
          information, please contact us and we will delete it.
        </p>
      </Section>

      <Section title="11. International users">
        <p>
          We may process and store your information in countries other than your own. Where we
          transfer data internationally, we take steps to ensure it receives an adequate level
          of protection consistent with this policy and applicable law.
        </p>
      </Section>

      <Section title="12. Changes to this policy">
        <p>
          We may update this Privacy Policy from time to time. If we make material changes, we
          will notify you through the Service or by email and update the &quot;Last updated&quot;
          date above.
        </p>
      </Section>

      <Section title="13. Contact us">
        <p>
          If you have questions about this policy or how we handle your data, contact us at{" "}
          <ProseLink href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</ProseLink> or visit our{" "}
          <ProseLink href="/contact">Contact</ProseLink> page.
        </p>
      </Section>
    </PageShell>
  );
}
