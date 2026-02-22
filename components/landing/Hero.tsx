import Link from "next/link";
import { Bolt, ShieldCheck, Sparkles } from "lucide-react";
import Section from "@/components/landing/Section";

export default function Hero({
  primaryCtaHref,
  primaryCtaLabel,
}: {
  primaryCtaHref: string;
  primaryCtaLabel: string;
}) {
  return (
    <div className="relative overflow-hidden">
      {/* background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-500/20 blur-3xl dark:bg-indigo-400/15" />
        <div className="absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl dark:bg-purple-400/15" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.06)_1px,transparent_0)] [background-size:24px_24px] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)]" />
      </div>

      <Section className="relative pt-16 sm:pt-20">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-medium text-zinc-700 shadow-sm dark:border-white/15 dark:bg-white/5 dark:text-zinc-200">
              <Sparkles className="h-3.5 w-3.5" />
              A micro-task marketplace for students
            </div>

            <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight text-black dark:text-white sm:text-5xl">
              Get hostel tasks done in minutes.
            </h1>
            <p className="mt-4 text-pretty text-lg leading-8 text-zinc-600 dark:text-zinc-300">
              Post quick tasks like ironing, notes, assignments, food pickup, and
              more. Other students accept, finish fast, and you pay via UPI,
              cash, or online.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href={primaryCtaHref}
                className="inline-flex items-center justify-center rounded-xl bg-black px-5 py-3 text-sm font-medium text-white shadow-sm hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 transition"
              >
                {primaryCtaLabel}
              </Link>
              <Link
                href="/tasks"
                className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white px-5 py-3 text-sm font-medium text-black shadow-sm hover:bg-zinc-50 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 transition"
              >
                Browse tasks
              </Link>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <MiniProof icon={<Bolt className="h-4 w-4" />} title="Fast" desc="Find help quickly" />
              <MiniProof icon={<ShieldCheck className="h-4 w-4" />} title="Safer" desc="Google login" />
              <MiniProof icon={<Sparkles className="h-4 w-4" />} title="Simple" desc="Clear lifecycle" />
            </div>
          </div>

          {/* mock preview */}
          <div className="relative">
            <div className="rounded-2xl border border-black/10 bg-white/80 p-5 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.25)] backdrop-blur dark:border-white/15 dark:bg-white/5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-black dark:text-white">
                 Grab a task ?
                </p>
                <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  Open
                </span>
              </div>
              <div className="mt-4 space-y-3">
                <TaskPreview
                  title="Iron 3 shirts"
                  meta="Hostel A • Room 204"
                  price="₹50"
                  badge="Expiring soon"
                />
                <TaskPreview title="Pick up dinner" meta="Canteen • 10 mins" price="₹30" />
                <TaskPreview title="Share class notes" meta="Academics • PDF" price="₹80" />
              </div>
              <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
               
              </p>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}

function MiniProof({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-black/10 bg-white/70 px-4 py-3 text-sm shadow-sm dark:border-white/15 dark:bg-white/5">
      <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-black/5 text-zinc-700 dark:bg-white/10 dark:text-zinc-200">
        {icon}
      </div>
      <div>
        <p className="font-medium text-black dark:text-white">{title}</p>
        <p className="text-xs text-zinc-600 dark:text-zinc-300">{desc}</p>
      </div>
    </div>
  );
}

function TaskPreview({
  title,
  meta,
  price,
  badge,
}: {
  title: string;
  meta: string;
  price: string;
  badge?: string;
}) {
  return (
    <div className="rounded-xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/15 dark:bg-black/30">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-black dark:text-white">{title}</p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{meta}</p>
        </div>
        <p className="text-sm font-semibold text-black dark:text-white">{price}</p>
      </div>
      {badge ? (
        <div className="mt-3 inline-flex rounded-full bg-amber-500/15 px-2 py-1 text-[11px] font-medium text-amber-700 dark:text-amber-300">
          {badge}
        </div>
      ) : null}
    </div>
  );
}
