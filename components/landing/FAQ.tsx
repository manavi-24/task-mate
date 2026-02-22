import Section from "@/components/landing/Section";

const FAQS = [
  {
    q: "How do I post a task?",
    a: "Sign in with Google, then go to Create Task. Add title, description, price, hostel/room, and a deadline.",
  },
  {
    q: "How do payments work?",
    a: "When work is done, the creator completes the task and chooses a payment method (cash / UPI / online). The acceptor confirms payment received.",
  },
  {
    q: "What if someone doesn’t complete the task?",
    a: "Tasks follow a strict lifecycle. If something goes wrong, the creator can avoid confirming completion/payment until resolved.",
  },
  {
    q: "Is it only for hostel students?",
    a: "It’s designed for hostel workflows, but the model works anywhere students need quick help locally.",
  },
];

export default function FAQ() {
  return (
    <Section className="pt-16 sm:pt-20 pb-16">
      <div id="faq" className="scroll-mt-24">
        <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-300">
          FAQ
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-black dark:text-white">
          Common questions
        </h2>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {FAQS.map((f) => (
            <div
              key={f.q}
              className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/15 dark:bg-white/5"
            >
              <p className="font-semibold text-black dark:text-white">{f.q}</p>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                {f.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
