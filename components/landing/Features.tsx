import {
  BadgeCheck,
  Filter,
  Lock,
  Shield,
  Timer,
  Wallet,
} from "lucide-react";
import Section from "@/components/landing/Section";

const FEATURES = [
  {
    icon: Timer,
    title: "Deadlines that matter",
    desc: "Set a clear date + time. Tasks nearing deadline stand out automatically.",
  },
  {
    icon: BadgeCheck,
    title: "Strict task lifecycle",
    desc: "Open → accepted → in progress → work done → payment pending → received → closed.",
  },
  {
    icon: Filter,
    title: "Browse with filters",
    desc: "Filter by category/hostel and sort by nearest deadline.",
  },
  {
    icon: Wallet,
    title: "Flexible payments",
    desc: "UPI, cash, or online. Manual confirmation keeps it simple in hostels.",
  },
  {
    icon: Lock,
    title: "Secure login",
    desc: "Google sign-in via NextAuth—no password headaches.",
  },
  {
    icon: Shield,
    title: "Role-safe actions",
    desc: "Creators and acceptors can only do what makes sense for their role.",
  },
];

export default function Features() {
  return (
    <Section className="pt-16 sm:pt-20">
      <div id="features" className="scroll-mt-24">
        <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-300">
          Built for hostel life
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-black dark:text-white">
          Everything you need to post, accept, and finish tasks
        </h2>
        <p className="mt-3 max-w-2xl text-zinc-600 dark:text-zinc-300">
          TaskMate keeps the workflow simple and predictable so both sides know
          what’s next.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/15 dark:bg-white/5"
            >
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-black/5 text-black dark:bg-white/10 dark:text-white">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-black dark:text-white">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
