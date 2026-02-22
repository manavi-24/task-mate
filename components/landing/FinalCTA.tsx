"use client";

import Link from "next/link";
import { ArrowRight, LayoutDashboard } from "lucide-react";
import { useSession } from "next-auth/react";
import Section from "@/components/landing/Section";

export default function FinalCTA() {
  const { data: session } = useSession();
  const isAuthed = Boolean(session?.user?.email);
  const primaryHref = isAuthed ? "/dashboard" : "/get-started";
  const primaryLabel = isAuthed ? "Go to Dashboard" : "Get Started";

  return (
    <Section className="pt-16 sm:pt-20">
      <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-8 text-white shadow-[0_20px_70px_-40px_rgba(0,0,0,0.6)] dark:border-white/15 dark:from-white dark:via-zinc-50 dark:to-white dark:text-black sm:p-10">
        {/* background glows */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-indigo-500/25 blur-3xl dark:bg-indigo-500/15" />
          <div className="absolute -bottom-28 right-0 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl dark:bg-fuchsia-500/10" />
        </div>

        <div className="relative grid gap-10 md:grid-cols-[1.2fr_0.8fr] md:items-center">
          <div>
            <p className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/80 dark:border-black/10 dark:bg-black/5 dark:text-black/70">
              Launch your hostel’s micro-task marketplace
            </p>

            <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Ready to get tasks done (or earn by helping)?
            </h2>
            <p className="mt-3 max-w-prose text-pretty text-white/75 dark:text-black/70">
              Clear deadlines, fair pricing, and simple payments. Post in
              seconds, get matched fast.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <BenefitChip>Fast payouts</BenefitChip>
              <BenefitChip>UPI-ready</BenefitChip>
              <BenefitChip>Clear lifecycle</BenefitChip>
            </div>
          </div>

          <div className="flex flex-col gap-3 md:items-end">
            <div className="grid w-full gap-3 sm:grid-cols-2 md:max-w-xs md:grid-cols-1">
              <Link
                href={primaryHref}
                className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-medium text-black shadow-sm transition hover:bg-white/90 dark:bg-black dark:text-white dark:hover:bg-black/90"
              >
                {isAuthed ? (
                  <LayoutDashboard className="h-4 w-4" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
                {primaryLabel}
                <ArrowRight className="h-4 w-4 opacity-0 transition group-hover:opacity-100" />
              </Link>
              <Link
                href="/tasks"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 px-5 text-sm font-medium text-white transition hover:bg-white/15 dark:border-black/15 dark:bg-black/5 dark:text-black dark:hover:bg-black/10"
              >
                Browse tasks
              </Link>
            </div>
            <p className="text-xs text-white/60 dark:text-black/60">
              No spam. Sign in with Google.
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}

function BenefitChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/80 dark:border-black/10 dark:bg-black/5 dark:text-black/70">
      {children}
    </span>
  );
}
