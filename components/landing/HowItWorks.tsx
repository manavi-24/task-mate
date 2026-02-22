import Section from "@/components/landing/Section";

const STEPS = [
  {
    title: "Post",
    desc: "Create a task with price, hostel/room, and deadline.",
  },
  {
    title: "Accepted",
    desc: "Another student accepts it—no back-and-forth needed.",
  },
  {
    title: "In progress",
    desc: "The acceptor starts working and updates status.",
  },
  {
    title: "Work done",
    desc: "Acceptor marks it done. Creator reviews and completes.",
  },
  {
    title: "Payment",
    desc: "Pay via cash / UPI / online (Razorpay supported).",
  },
  {
    title: "Closed",
    desc: "Acceptor confirms payment received and task closes.",
  },
];

export default function HowItWorks() {
  return (
    <Section className="pt-16 sm:pt-20">
      <div id="how" className="scroll-mt-24">
        <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-300">
          How it works
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-black dark:text-white">
          A clear lifecycle from start to finish
        </h2>
        <p className="mt-3 max-w-2xl text-zinc-600 dark:text-zinc-300">
          No step skipping. Everyone knows exactly what to do next.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {STEPS.map((s, idx) => (
            <div
              key={s.title}
              className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/15 dark:bg-white/5"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-sm font-semibold text-white">
                  {idx + 1}
                </span>
                <h3 className="text-base font-semibold text-black dark:text-white">
                  {s.title}
                </h3>
              </div>
              <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
