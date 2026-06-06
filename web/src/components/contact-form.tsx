"use client";

import { useState } from "react";
import { Button, Input } from "@/components/ui";

const SUPPORT_EMAIL = "support@kitchenassistant.app";

const TOPICS = [
  "General question",
  "Account & billing",
  "Report a problem",
  "Feedback & ideas",
  "Press & partnerships",
];

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState(TOPICS[0]);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // No public contact endpoint yet — hand off to the user's mail client with a
    // prefilled message so nothing is lost.
    const subject = `[${topic}] Message from ${name || "Kitchen Assistant user"}`;
    const body = `Name: ${name}\nEmail: ${email}\nTopic: ${topic}\n\n${message}`;
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
            Name
          </label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="topic" className="mb-1.5 block text-sm font-medium">
          Topic
        </label>
        <select
          id="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
        >
          {TOPICS.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium">
          Message
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="How can we help?"
          required
          rows={6}
          className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
      </div>

      <Button type="submit" size="lg">
        Send message
      </Button>

      {sent && (
        <p className="text-sm text-muted-foreground">
          Your email app should have opened with your message ready to send. If it didn&apos;t,
          email us directly at{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-brand hover:underline">
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
      )}
    </form>
  );
}
