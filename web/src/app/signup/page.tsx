"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth-shell";
import { Button, Input, ErrorBanner } from "@/components/ui";
import { GoogleButton } from "@/components/google-button";
import { useAuth } from "@/lib/auth-context";

export default function SignupPage() {
  const { signUp } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const { needsConfirmation } = await signUp(email, password, name);
      if (needsConfirmation) {
        setConfirmEmail(true);
      } else {
        router.push("/chat");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign up.");
    } finally {
      setLoading(false);
    }
  };

  if (confirmEmail) {
    return (
      <AuthShell
        title="Check your email"
        subtitle="We sent you a confirmation link to finish creating your account."
      >
        <div className="space-y-4 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-50 text-brand">
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l9 6 9-6M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
            </svg>
          </div>
          <p className="text-sm text-muted-foreground">
            Once confirmed, come back and log in to start generating recipes.
          </p>
          <Link href="/login" className="block">
            <Button fullWidth variant="outline">Go to login</Button>
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Create your account" subtitle="Start generating AI recipes for free">
      <GoogleButton next="/chat" />
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        {error && <ErrorBanner message={error} />}
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="name">Name</label>
          <Input
            id="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="email">Email</label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="password">Password</label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
          />
        </div>
        <Button type="submit" fullWidth loading={loading}>
          Create account
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand hover:underline">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}
