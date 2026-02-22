import Image from "next/image";
import { CreditCard, IndianRupee, Smartphone } from "lucide-react";
import Section from "@/components/landing/Section";

export default function Payments() {
  return (
    <Section className="pt-16 sm:pt-20">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-300">
            Payments
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-black dark:text-white">
            Pay your way: UPI, cash, or online
          </h2>
          <p className="mt-3 text-zinc-600 dark:text-zinc-300">
            Choose a payment method when you complete the task. For online
            payments, TaskMate supports Razorpay checkout.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <PaymentCard icon={<Smartphone className="h-5 w-5" />} title="UPI" />
            <PaymentCard icon={<IndianRupee className="h-5 w-5" />} title="Cash" />
            <PaymentCard icon={<CreditCard className="h-5 w-5" />} title="Online" />
          </div>

          <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
            Note: Payment confirmation is currently manual (ideal for hostel
            workflows).
          </p>
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/15 dark:bg-white/5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-black dark:text-white">
              Razorpay supported
            </p>
            <Image src="/razorpay-logo.svg" alt="Razorpay" width={92} height={24} />
          </div>
          <div className="mt-6 space-y-3">
            <Bullet>
              Creator selects “Online” and pays via Razorpay checkout.
            </Bullet>
            <Bullet>
              Task continues with the same lifecycle, with explicit payment
              confirmation.
            </Bullet>
            <Bullet>
              Clean UI for hostel-friendly, lightweight coordination.
            </Bullet>
          </div>
        </div>
      </div>
    </Section>
  );
}

function PaymentCard({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/15 dark:bg-black/30">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 text-black dark:bg-white/10 dark:text-white">
        {icon}
      </div>
      <p className="mt-3 text-sm font-semibold text-black dark:text-white">
        {title}
      </p>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 text-sm text-zinc-600 dark:text-zinc-300">
      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-indigo-500" />
      <p className="leading-6">{children}</p>
    </div>
  );
}
