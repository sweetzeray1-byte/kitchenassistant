export const metadata = {
  title: "Privacy Policy — Kitchen Assistant AI",
  description:
    "How Kitchen Assistant AI, operated by RoseXLab, collects, uses, shares, and protects your information.",
};

const SUPPORT_EMAIL = "support@kitchenassistant.com";

const providers: { name: string; role: string }[] = [
  { name: "OpenAI", role: "Processes text you enter to generate recipes and chat responses." },
  { name: "Supabase", role: "Authentication, account data, and backend database." },
  {
    name: "RevenueCat & Apple App Store",
    role: "Subscription processing and management.",
  },
  { name: "Sentry", role: "Crash reporting and diagnostics." },
  { name: "Apple & Google", role: "Sign-in, when you choose those methods." },
];

const rights: { title: string; body: string }[] = [
  {
    title: "Access and correction",
    body: "View and update your profile in the App.",
  },
  {
    title: "Account deletion",
    body: "Permanently delete your account and associated personal data from within the App (Profile → Delete Account).",
  },
  {
    title: "Consent withdrawal",
    body: "You can decline AI processing; declining means the AI features will not be available.",
  },
];

export default function PrivacyPolicy() {
  return (
    <main className="pp">
      <style>{css}</style>

      <div className="pp-inner">
        <header className="pp-head">
          <p className="pp-eyebrow">Kitchen Assistant AI · RoseXLab</p>
          <h1>Privacy Policy</h1>
          <p className="pp-meta">Last updated June 26, 2026</p>
          <p className="pp-lead">
            This Privacy Policy explains how Kitchen Assistant AI (&ldquo;we&rdquo;,
            &ldquo;us&rdquo;, &ldquo;our&rdquo;, or the &ldquo;App&rdquo;), operated by
            RoseXLab, collects, uses, shares, and protects your information when you use
            our mobile application and related services. By using the App, you agree to
            the practices described here. If you have questions, contact us at{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
          </p>
        </header>

        <Section n="01" title="Information We Collect">
          <p>
            <strong>Account information.</strong> When you create an account or sign in
            (with email, Apple, or Google), we collect your email address, your name
            (where provided), and a unique account identifier. Authentication is handled
            through our backend provider, Supabase.
          </p>
          <p>
            <strong>Content you provide.</strong> When you use the App&rsquo;s AI
            features, we collect the text you enter — for example, ingredients, dish
            names, dietary preferences, and messages you send to the in-app chat
            assistant. This content is used to generate recipes and responses for you
            (see Section 3).
          </p>
          <p>
            <strong>Subscription and purchase information.</strong> Purchases are
            processed by Apple&rsquo;s App Store, and subscription status is managed
            through our provider, RevenueCat. We do not receive or store your full
            payment card details.
          </p>
          <p>
            <strong>Diagnostics and usage data.</strong> To keep the App stable, we
            collect crash reports and basic diagnostic and performance data through our
            error-monitoring provider, Sentry (e.g., device type, OS version, app
            version, technical event logs).
          </p>
          <p className="pp-callout">
            We do <strong>not</strong> use advertising trackers, and we do{" "}
            <strong>not</strong> collect your precise location, contacts, photos, or
            microphone input.
          </p>
        </Section>

        <Section n="02" title="How We Use Your Information">
          <ul className="pp-list">
            <li>Create and manage your account and authenticate you;</li>
            <li>Generate recipes and answer your cooking questions using AI;</li>
            <li>Provide, maintain, and improve the App&rsquo;s features;</li>
            <li>Process and manage subscriptions and entitlements;</li>
            <li>Diagnose crashes, fix bugs, and improve reliability;</li>
            <li>Respond to support requests and communicate about the service;</li>
            <li>Comply with legal obligations.</li>
          </ul>
        </Section>

        <Section n="03" title="AI Features and Third-Party AI Processing">
          <p>
            A core feature of the App is AI-generated recipes and an AI chat assistant.{" "}
            <strong>
              To provide these features, the text you enter (such as ingredients,
              preferences, and chat messages) is transmitted to our third-party AI
              provider, OpenAI
            </strong>
            , which processes your request and returns a response. This processing is
            necessary to deliver the recipe or answer you ask for.
          </p>
          <p>
            Before any of your input is sent to the AI provider for the first time, the
            App presents a clear disclosure and asks for your consent. You may decline, in
            which case the AI features will not be used and your input will not be sent. We
            ask that you do not enter sensitive personal information into AI features.
            OpenAI processes this data as a service provider on our behalf, under its own
            terms and privacy commitments, which provide protections comparable to those
            described in this policy. We do not sell your data.
          </p>
        </Section>

        <Section n="04" title="How We Share Your Information">
          <p>
            We share your information only with the service providers that operate the
            App, and only as needed to run the service. We do <strong>not</strong> sell
            your personal data. Our providers include:
          </p>
          <dl className="pp-defs">
            {providers.map((p) => (
              <div className="pp-def" key={p.name}>
                <dt>{p.name}</dt>
                <dd>{p.role}</dd>
              </div>
            ))}
          </dl>
          <p>
            We may also disclose information if required by law, to protect rights or
            safety, or in connection with a business transfer.
          </p>
        </Section>

        <Section n="05" title="Data Retention">
          <p>
            We retain your account information and content for as long as your account is
            active or as needed to provide the service. When you delete your account, we
            delete or anonymize your personal data, except where we are required to retain
            it for legal or legitimate business reasons.
          </p>
        </Section>

        <Section n="06" title="Your Rights and Choices">
          <dl className="pp-defs">
            {rights.map((r) => (
              <div className="pp-def" key={r.title}>
                <dt>{r.title}</dt>
                <dd>{r.body}</dd>
              </div>
            ))}
          </dl>
          <p>
            Depending on your location, you may have additional rights under laws such as
            the GDPR or CCPA. To exercise these rights, contact us at the email above.
          </p>
        </Section>

        <Section n="07" title="Security">
          <p>
            We use industry-standard measures, including encryption in transit
            (HTTPS/TLS), to protect your information. No method of transmission or storage
            is completely secure, but we work to protect your data and limit access to it.
          </p>
        </Section>

        <Section n="08" title="Children&rsquo;s Privacy">
          <p>
            The App is not directed to children under 13 (or the minimum age in your
            jurisdiction), and we do not knowingly collect personal data from children. If
            you believe a child has provided us personal data, contact us and we will
            delete it.
          </p>
        </Section>

        <Section n="09" title="International Data Transfers">
          <p>
            Your information may be processed on servers located outside your country of
            residence, including by the service providers listed above. Where required, we
            rely on appropriate safeguards for such transfers.
          </p>
        </Section>

        <Section n="10" title="Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. We will revise the
            &ldquo;Last updated&rdquo; date above and, where appropriate, notify you within
            the App.
          </p>
        </Section>

        <Section n="11" title="Contact Us" last>
          <address className="pp-contact">
            <span className="pp-contact-name">RoseXLab</span>
            <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
          </address>
        </Section>
      </div>
    </main>
  );
}

function Section({
  n,
  title,
  last,
  children,
}: {
  n: string;
  title: string;
  last?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className={`pp-section${last ? " pp-section--last" : ""}`}>
      <div className="pp-section-head">
        <span className="pp-num" aria-hidden="true">
          {n}
        </span>
        <h2 dangerouslySetInnerHTML={{ __html: title }} />
      </div>
      <div className="pp-body">{children}</div>
    </section>
  );
}

const css = `
.pp {
  --paper: #fbfaf7;
  --ink: #20231d;
  --ink-soft: #565a4f;
  --herb: #5e6b3b;
  --herb-soft: #eef1e6;
  --line: #e7e4da;

  background: var(--paper);
  color: var(--ink);
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
}
.pp *,
.pp *::before,
.pp *::after { box-sizing: border-box; }

.pp-inner {
  max-width: 720px;
  margin: 0 auto;
  padding: clamp(40px, 8vw, 88px) 22px 96px;
}

/* Header */
.pp-head { margin-bottom: 56px; }
.pp-eyebrow {
  margin: 0 0 18px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--herb);
}
.pp h1 {
  margin: 0;
  font-family: Georgia, "Times New Roman", serif;
  font-weight: 600;
  font-size: clamp(34px, 6vw, 48px);
  line-height: 1.08;
  letter-spacing: -0.01em;
}
.pp-meta {
  margin: 14px 0 0;
  font-size: 14px;
  color: var(--ink-soft);
}
.pp-lead {
  margin: 26px 0 0;
  font-size: 17px;
  color: var(--ink-soft);
  border-top: 1px solid var(--line);
  padding-top: 26px;
}

/* Sections */
.pp-section {
  padding: 36px 0;
  border-top: 1px solid var(--line);
}
.pp-section--last { padding-bottom: 0; }
.pp-section-head {
  display: flex;
  align-items: baseline;
  gap: 16px;
  margin-bottom: 18px;
}
.pp-num {
  flex: 0 0 auto;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 14px;
  font-weight: 600;
  color: var(--herb);
  font-variant-numeric: tabular-nums;
  padding-top: 4px;
}
.pp h2 {
  margin: 0;
  font-family: Georgia, "Times New Roman", serif;
  font-weight: 600;
  font-size: clamp(20px, 3.4vw, 25px);
  line-height: 1.2;
  letter-spacing: -0.005em;
}

/* Body text */
.pp-body { padding-left: 36px; }
.pp-body > :first-child { margin-top: 0; }
.pp-body > :last-child { margin-bottom: 0; }
.pp p {
  margin: 0 0 16px;
  font-size: 16px;
}
.pp strong { font-weight: 650; color: var(--ink); }

/* Reassurance callout */
.pp-callout {
  background: var(--herb-soft);
  border-left: 3px solid var(--herb);
  border-radius: 4px;
  padding: 14px 18px;
  font-size: 15px !important;
  color: var(--ink);
}

/* Plain list */
.pp-list {
  margin: 0;
  padding-left: 20px;
}
.pp-list li {
  margin: 0 0 9px;
  font-size: 16px;
}
.pp-list li::marker { color: var(--herb); }

/* Definition lists (providers, rights) */
.pp-defs {
  margin: 4px 0 16px;
  display: grid;
  gap: 1px;
  background: var(--line);
  border: 1px solid var(--line);
  border-radius: 8px;
  overflow: hidden;
}
.pp-def {
  background: var(--paper);
  padding: 14px 18px;
}
.pp-def dt {
  font-weight: 650;
  font-size: 15px;
  margin-bottom: 3px;
}
.pp-def dd {
  margin: 0;
  font-size: 15px;
  color: var(--ink-soft);
}

/* Contact */
.pp-contact {
  font-style: normal;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.pp-contact-name { font-weight: 650; }

/* Links */
.pp a {
  color: var(--herb);
  text-decoration: underline;
  text-underline-offset: 2px;
  text-decoration-thickness: 1px;
}
.pp a:hover { text-decoration-thickness: 2px; }
.pp a:focus-visible {
  outline: 2px solid var(--herb);
  outline-offset: 2px;
  border-radius: 2px;
}

@media (max-width: 520px) {
  .pp-body { padding-left: 0; }
  .pp-section-head { gap: 10px; }
}
`;
