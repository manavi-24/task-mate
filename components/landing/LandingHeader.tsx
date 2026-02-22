"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowRight, Menu } from "lucide-react";
import { useMemo, useState } from "react";

const navItems = [
  { href: "#features", label: "Features" },
  { href: "#how", label: "How it works" },
  { href: "#faq", label: "FAQ" },
];

export default function LandingHeader() {
  const { data: session } = useSession();
  const isAuthed = Boolean(session?.user?.email);
  const [mobileOpen, setMobileOpen] = useState(false);

  const primary = useMemo(
    () =>
      isAuthed
        ? { href: "/dashboard", label: "Go to Dashboard" }
        : { href: "/get-started", label: "Get Started" },
    [isAuthed]
  );

  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-white/70 backdrop-blur dark:border-white/10 dark:bg-black/50">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold">
            T
          </span>
          <span className="text-sm font-semibold tracking-tight text-black dark:text-white">
            TaskMate
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-zinc-600 dark:text-zinc-300 md:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="hover:text-black dark:hover:text-white transition"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/tasks"
            className="hidden sm:inline-flex rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-black shadow-sm hover:bg-zinc-50 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 transition"
          >
            Browse tasks
          </Link>

          <Link
            href={primary.href}
            className="hidden sm:inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 transition"
          >
            {primary.label}
            <ArrowRight className="h-4 w-4" />
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white p-2 text-black shadow-sm hover:bg-zinc-50 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 transition md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-t border-black/5 bg-white/70 px-4 py-4 backdrop-blur dark:border-white/10 dark:bg-black/50 md:hidden">
          <div className="flex flex-col gap-3 text-sm">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-zinc-700 hover:text-black dark:text-zinc-200 dark:hover:text-white"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </a>
            ))}

            <div className="mt-2 flex flex-col gap-2">
              <Link
                href="/tasks"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-medium text-black shadow-sm dark:border-white/15 dark:bg-white/5 dark:text-white"
              >
                Browse tasks
              </Link>
              <Link
                href={primary.href}
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-4 py-2 text-sm font-medium text-white shadow-sm dark:bg-white dark:text-black"
              >
                {primary.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
