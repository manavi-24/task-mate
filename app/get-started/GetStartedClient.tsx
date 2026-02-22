"use client";

import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Bolt,
  Github,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { InlineAlert } from "@/components/ui/InlineAlert";

type ProviderKey = "google" | "github";

export default function GetStartedClient({
  githubEnabled,
}: {
  githubEnabled: boolean;
}) {
  const { data: session } = useSession();
  const isAuthed = Boolean(session?.user?.email);
  const searchParams = useSearchParams();
  const oauthError = searchParams.get("error");
  const callback = searchParams.get("callback");

  const callbackUrl = useMemo(() => {
    // Only allow same-site relative callbacks.
    // Fall back to /dashboard if anything unexpected.
    if (!callback) return "/dashboard";
    if (!callback.startsWith("/")) return "/dashboard";
    if (callback.startsWith("//")) return "/dashboard";
    return callback;
  }, [callback]);

  const [loading, setLoading] = useState<ProviderKey | null>(null);
  const [error, setError] = useState<string | null>(null);

  const derivedError = useMemo(() => {
    if (!oauthError) return null;
    // Common NextAuth error codes: OAuthSignin, OAuthCallback, AccessDenied, Configuration
    // Keep user-facing messages clean.
    if (oauthError === "AccessDenied") return "Sign-in was cancelled.";
    if (oauthError === "Configuration") return "Auth is not configured correctly.";
    return "Sign-in failed. Please try again.";
  }, [oauthError]);

  const secondaryLinks = useMemo(
    () =>
      isAuthed
        ? [{ href: "/dashboard", label: "Go to dashboard" }]
        : [],
    [isAuthed]
  );

  async function handleSignIn(provider: ProviderKey) {
    setError(null);
    setLoading(provider);
    try {
      const res = await signIn(provider, {
        callbackUrl,
        redirect: true,
      });

      // When redirect=true, NextAuth will navigate away on success.
      // If user cancels, res may contain an error.
      if (res?.error) {
        setError("Sign-in was cancelled or failed. Please try again.");
      }
    } catch {
      setError("Sign-in failed. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="relative overflow-hidden">
      {/* background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-500/20 blur-3xl dark:bg-indigo-400/15" />
        <div className="absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl dark:bg-purple-400/15" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] [background-size:24px_24px]" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto w-full">
          <div className="mx-auto grid w-full max-w-4xl gap-6 lg:grid-cols-2">
            {/* Left: Why TaskMate */}
            <div className="hidden lg:block">
              <div className="h-full rounded-2xl border border-white/10 bg-white/5 p-8 shadow-[0_40px_120px_-80px_rgba(99,102,241,0.6)]">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/70">
                  <Sparkles className="h-3.5 w-3.5" />
                  Why TaskMate
                </div>
                <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white">
                  A cleaner way to get hostel work done.
                </h2>
                <p className="mt-3 text-sm leading-6 text-white/60">
                  Post micro-tasks, accept work, and track progress with a clear
                  lifecycle.
                </p>

                <div className="mt-6 space-y-3">
                  <Bullet
                    icon={<Bolt className="h-4 w-4" />}
                    title="Fast"
                    desc="Get help quickly"
                  />
                  <Bullet
                    icon={<ShieldCheck className="h-4 w-4" />}
                    title="Safer"
                    desc="Google/GitHub login"
                  />
                  <Bullet
                    icon={<ArrowRight className="h-4 w-4" />}
                    title="Simple"
                    desc="Clear task lifecycle"
                  />
                </div>
              </div>
            </div>

            {/* Right: Auth card */}
            <div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-[0_40px_120px_-80px_rgba(0,0,0,0.8)] backdrop-blur">
                <p className="text-sm font-semibold text-indigo-300">
                  Get started
                </p>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                  Get started with TaskMate
                </h1>
                <p className="mt-2 text-sm text-white/60">
                  Sign in to post tasks, accept work, and track progress.
                </p>

                {callbackUrl !== "/dashboard" ? (
                  <p className="mt-3 text-xs text-white/45">
                    You’ll be returned to <span className="font-semibold text-white/70">{callbackUrl}</span> after sign-in.
                  </p>
                ) : null}

                {error || derivedError ? (
                  <div className="mt-5">
                    <InlineAlert variant="error" title="Sign-in failed">
                      {error || derivedError}
                    </InlineAlert>
                  </div>
                ) : null}

                <div className="mt-6 space-y-3">
                  <button
                    type="button"
                    onClick={() => handleSignIn("google")}
                    disabled={loading !== null}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black shadow-sm hover:bg-white/90 transition disabled:opacity-70"
                  >
                    <GoogleMark />
                    {loading === "google" ? "Signing in…" : "Continue with Google"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSignIn("github")}
                    disabled={loading !== null || !githubEnabled}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-white/10 transition disabled:opacity-50"
                  >
                    <Github className="h-4 w-4" />
                    {loading === "github" ? "Signing in…" : "Continue with GitHub"}
                  </button>

                  {!githubEnabled ? (
                    <p className="text-xs text-white/45">
                      Configure <span className="font-semibold">GITHUB_CLIENT_ID</span> and{" "}
                      <span className="font-semibold">GITHUB_CLIENT_SECRET</span> to enable GitHub login.
                    </p>
                  ) : null}
                </div>

                <div className="my-6 flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/10" />
                  <p className="text-xs font-medium text-white/45">or</p>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                <div className="flex flex-col gap-2">
                  <Link
                    href="/tasks"
                    className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white transition"
                  >
                    Browse tasks
                  </Link>
                  {secondaryLinks.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white transition"
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>

              <p className="mt-5 text-center text-xs text-white/45">
                By continuing you agree to basic fair-use rules inside the hostel.
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="text-xs font-semibold text-white/55 hover:text-white transition"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Bullet({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3">
      <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white/80">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="text-xs text-white/55">{desc}</p>
      </div>
    </div>
  );
}

function GoogleMark() {
  // Minimal inline Google icon (no extra deps)
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
    >
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.8-5.5 3.8-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C17 6.1 14.8 5 12 5 8.1 5 5 8.1 5 12s3.1 7 7 7c4.1 0 6.8-2.9 6.8-6.9 0-.5-.1-.9-.1-1H12z"
      />
      <path
        fill="#34A853"
        d="M6.2 14.3l-3 2.3C4.6 19.1 8.1 21 12 21c2.8 0 5-1 6.7-2.6l-3.2-2.5c-.9.6-2.1 1-3.5 1-2.7 0-5-1.8-5.8-4.3z"
        opacity=".9"
      />
      <path
        fill="#FBBC05"
        d="M3.2 7.4l3 2.3C7 7.3 9.3 5.6 12 5.6c1.6 0 3 .6 4.1 1.6l2.7-2.6C17 3.1 14.8 2 12 2 8.1 2 4.6 3.9 3.2 7.4z"
        opacity=".9"
      />
      <path
        fill="#4285F4"
        d="M21.8 12c0-.6-.1-1.1-.2-1.6H12v3.9h5.5c-.3 1.1-1.2 2.6-2.8 3.4l3.2 2.5c1.9-1.7 2.9-4.2 2.9-7.2z"
      />
    </svg>
  );
}
