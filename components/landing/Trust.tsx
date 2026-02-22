import { Handshake, ShieldCheck, Zap } from "lucide-react";
import Section from "@/components/landing/Section";

const ITEMS = [
  {
    icon: Handshake,
    title: "Student-to-student",
    desc: "Built for hostels: quick, local, and familiar.",
  },
  {
    icon: Zap,
    title: "Faster than texting",
    desc: "Clear status changes remove the need for long chats.",
  },
  {
    icon: ShieldCheck,
    title: "Safer by design",
    desc: "Google login and role-based actions help keep it controlled.",
  },
];

export default function Trust() {
  return (
    <Section className="pt-16 sm:pt-20">
      <div className="rounded-3xl border border-black/10 bg-gradient-to-br from-white to-indigo-50 p-8 shadow-sm dark:border-white/15 dark:from-white/5 dark:to-indigo-500/10 sm:p-10">
        <h2 className="text-3xl font-semibold tracking-tight text-black dark:text-white">
          Built for speed, clarity, and hostel trust
        </h2>
        <p className="mt-3 max-w-2xl text-zinc-600 dark:text-zinc-300">
          Whether you’re posting a quick errand or earning a little extra,
          TaskMate keeps the process simple.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {ITEMS.map((i) => (
            <div
              key={i.title}
              className="rounded-2xl border border-black/10 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-white/15 dark:bg-white/5"
            >
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-black/5 text-black dark:bg-white/10 dark:text-white">
                <i.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-black dark:text-white">
                {i.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                {i.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
