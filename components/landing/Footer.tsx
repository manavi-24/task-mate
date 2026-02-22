import Link from "next/link";
import Section from "@/components/landing/Section";

export default function Footer() {
  return (
    <footer className="border-t border-black/5 bg-white/60 dark:border-white/10 dark:bg-black/30">
      <Section className="py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-black dark:text-white">
              TaskMate
            </p>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              Hostel micro-task marketplace.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm">
            <Link
              href="/tasks"
              className="text-zinc-600 hover:text-black dark:text-zinc-300 dark:hover:text-white transition"
            >
              Browse
            </Link>
            <Link
              href="/tasks/create"
              className="text-zinc-600 hover:text-black dark:text-zinc-300 dark:hover:text-white transition"
            >
              Create
            </Link>
            <Link
              href="/dashboard"
              className="text-zinc-600 hover:text-black dark:text-zinc-300 dark:hover:text-white transition"
            >
              Dashboard
            </Link>
          </div>
        </div>

        <p className="mt-8 text-xs text-zinc-500 dark:text-zinc-400">
          © {new Date().getFullYear()} TaskMate
          
        </p>
      </Section>
    </footer>
  );
}
