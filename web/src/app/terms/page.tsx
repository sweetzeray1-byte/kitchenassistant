//web\src\app\terms\page.tsx

import type { Metadata } from "next";
import { PageShell, Section, List, ProseLink } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Terms of Service — Kitchen Assistant",
  description:
    "The terms and conditions that govern your use of Kitchen Assistant, our AI recipe generation service, website, and mobile app.",
};

const SUPPORT_EMAIL = "support@kitchen-assistant.co";

export default function TermsPage() {
  return (
    <PageShell
      eyebrow="Legal"
      title="Terms of Service"
      intro="Please read these terms carefully. By using Kitchen Assistant, you agree to them."
      updated="June 6, 2026"
    >
      <Section title="1. Agreement to terms">
        <p>
          These Terms of Service (&quot;Terms&quot;) form a binding agreement between you and
          Kitchen Assistant, a service operated by RoseXLab (&quot;Kitchen Assistant,&quot;
          &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) and govern your access to and use
          of our website, mobile applications, AI recipe generation tools, and related services
          (collectively, the &quot;Service&quot;). By creating an account or using the Service,
          you agree to be bound by these Terms and our{" "}
          <ProseLink href="/privacy">Privacy Policy</ProseLink>. If you do not agree, please
          do not use the Service.
        </p>
      </Section>

      <Section title="2. Eligibility">
        <p>
          You must be at least 16 years old (or the age of digital consent in your country)
          to use the Service. By using Kitchen Assistant, you represent that you meet this
          requirement and that the information you provide is accurate and complete.
        </p>
      </Section>

      <Section title="3. Your account">
        <List
          items={[
            "You are responsible for safeguarding your login credentials and for all activity under your account.",
            "You agree to provide accurate account information and to keep it up to date.",
            "Notify us promptly at our support email if you suspect unauthorized use of your account.",
            "You may not share, sell, or transfer your account to anyone else.",
          ]}
        />
      </Section>

      <Section title="4. AI-generated content & food safety">
        <p>
          Kitchen Assistant uses artificial intelligence to generate recipes, ingredient
          lists, cooking steps, illustrations, and nutritional estimates. This content is
          provided for general informational and inspirational purposes only.
        </p>
        <List
          items={[
            "AI-generated recipes may contain errors, omissions, or inaccuracies. Always use your own judgment and common cooking sense.",
            "We do not guarantee that any recipe is safe, accurate, complete, or suitable for your dietary needs.",
            "You are solely responsible for verifying ingredients, allergens, cooking temperatures, and food-handling practices before preparing or consuming any dish.",
            "Nutritional information is an estimate and should not be relied upon for medical, dietary, or health decisions. It is not a substitute for professional advice.",
            "If you have allergies, intolerances, or medical conditions, consult a qualified professional before following any recipe.",
          ]}
        />
      </Section>

      <Section title="5. Acceptable use">
        <p>You agree not to:</p>
        <List
          items={[
            "Use the Service for any unlawful, harmful, or fraudulent purpose.",
            "Attempt to reverse engineer, scrape, or build a competing product using our outputs or data.",
            "Submit prompts intended to generate dangerous, illegal, hateful, or harmful content.",
            "Overload, disrupt, or attempt to gain unauthorized access to our systems or other users' accounts.",
            "Misrepresent AI-generated content as professionally reviewed or medically endorsed.",
          ]}
        />
      </Section>

      <Section title="6. Subscriptions & billing">
        <p>
          Kitchen Assistant offers a free tier and a paid Pro subscription with the usage
          limits and features described on our{" "}
          <ProseLink href="/pricing">Pricing</ProseLink> page.
        </p>
        <List
          items={[
            "Paid plans are billed in advance on a recurring basis until cancelled.",
            "You can cancel at any time; access continues until the end of your current billing period.",
            "Fees are non-refundable except where required by law. Prices may change with reasonable notice.",
            "Usage limits (such as recipe generations and AI chef replies) reset each billing cycle and do not roll over.",
          ]}
        />
      </Section>

      <Section title="7. User content">
        <p>
          You retain ownership of the prompts, preferences, and any content you submit
          (&quot;User Content&quot;). By submitting User Content, you grant us a worldwide,
          non-exclusive, royalty-free license to use, process, and store it as needed to
          operate and improve the Service. You are responsible for ensuring you have the
          rights to any content you submit.
        </p>
      </Section>

      <Section title="8. Intellectual property">
        <p>
          The Service, including its software, branding, design, and original content, is
          owned by Kitchen Assistant and protected by intellectual property laws. Subject to
          these Terms, we grant you a limited, non-transferable, revocable license to use the
          Service for your personal, non-commercial use. Recipes you generate are yours to
          cook, share, and enjoy.
        </p>
      </Section>

      <Section title="9. Third-party services">
        <p>
          The Service relies on third-party providers (including AI model providers, cloud
          hosting, and payment processors). Your use of the Service may also be subject to
          their terms. We are not responsible for the availability or content of third-party
          services.
        </p>
      </Section>

      <Section title="10. Disclaimers">
        <p>
          THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE,&quot; WITHOUT
          WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF
          MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. We do not
          warrant that the Service will be uninterrupted, error-free, or that AI-generated
          content will be accurate or reliable.
        </p>
      </Section>

      <Section title="11. Limitation of liability">
        <p>
          To the maximum extent permitted by law, Kitchen Assistant and its affiliates will
          not be liable for any indirect, incidental, special, consequential, or punitive
          damages, or any loss arising from your reliance on AI-generated content, including
          but not limited to food spoilage, allergic reactions, illness, or injury. Our total
          liability for any claim relating to the Service will not exceed the amount you paid
          us in the twelve months preceding the claim.
        </p>
      </Section>

      <Section title="12. Termination">
        <p>
          We may suspend or terminate your access to the Service at any time if you violate
          these Terms or use the Service in a way that could cause harm. You may stop using
          the Service and delete your account at any time.
        </p>
      </Section>

      <Section title="13. Changes to these terms">
        <p>
          We may update these Terms from time to time. If we make material changes, we will
          notify you through the Service or by email. Continued use of the Service after
          changes take effect constitutes acceptance of the revised Terms.
        </p>
      </Section>

      <Section title="14. Contact us">
        <p>
          Questions about these Terms? Reach us at{" "}
          <ProseLink href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</ProseLink> or through
          our <ProseLink href="/contact">Contact</ProseLink> page.
        </p>
      </Section>
    </PageShell>
  );
}