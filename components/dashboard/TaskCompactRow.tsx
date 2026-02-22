"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { InlineAlert } from "@/components/ui/InlineAlert";

type Task = {
  id: string;
  title: string;
  description: string;
  price: number;
  category?: string | null;
  hostel?: string | null;
  roomNumber?: string | null;
  deadline?: string | null;
  status: string;
  createdBy?: {
    name?: string | null;
    email?: string | null;
    photoURL?: string | null;
  };
};

function statusMeta(status: string): {
  label: string;
  variant: Parameters<typeof Badge>[0]["variant"];
} {
  switch (status) {
    case "open":
      return { label: "Posted", variant: "emerald" };
    case "accepted":
      return { label: "Accepted", variant: "blue" };
    case "in_progress":
      return { label: "In progress", variant: "blue" };
    case "work_done":
      return { label: "Work done", variant: "purple" };
    case "payment_pending":
      return { label: "Payment pending", variant: "amber" };
    case "payment_received":
      return { label: "Payment received", variant: "amber" };
    case "closed":
      return { label: "Closed", variant: "gray" };
    default:
      return { label: status.replace(/_/g, " "), variant: "gray" };
  }
}

export function TaskCompactRow({
  task,
  role,
  highlight,
}: {
  task: Task;
  role: "creator" | "acceptor";
  highlight?: boolean;
}) {
  const { data: session } = useSession();
  const isAuthed = Boolean(session?.user?.email);
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<
    "cash" | "upi" | "online" | ""
  >("");

  const [authToast, setAuthToast] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const toastTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!highlight) return;
    // Scroll into view and keep highlight briefly.
    rootRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    // This class triggers a CSS keyframe animation and then removes itself.
    // (No Date.now() in render, satisfies purity lint rule.)
    const el = rootRef.current;
    if (!el) return;
    el.classList.remove("tm-task-highlight");
    // Force reflow so the animation can retrigger.
    void el.offsetWidth;
    el.classList.add("tm-task-highlight");

    const t = window.setTimeout(() => {
      el.classList.remove("tm-task-highlight");
    }, 3600);

    return () => window.clearTimeout(t);
  }, [highlight]);

  useEffect(() => {
    return () => {
      if (toastTimer.current) {
        window.clearTimeout(toastTimer.current);
      }
    };
  }, []);

  const deadlineLabel = useMemo(() => {
    if (!task.deadline) return "—";
    return new Date(task.deadline).toLocaleString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }, [task.deadline]);

  const meta = statusMeta(task.status);

  async function callApi(endpoint: string, body: Record<string, unknown> = {}) {
    try {
      setLoading(true);
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: task.id, ...body }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Something went wrong");
        setLoading(false);
        return;
      }
      window.location.reload();
    } catch {
      alert("Network error");
      setLoading(false);
    }
  }

  function requireAuthForAccept() {
    setAuthToast(true);
    // Give the user a moment to see the toast, then route to get-started.
    const callback = `/tasks?accept=${encodeURIComponent(task.id)}`;
    toastTimer.current = window.setTimeout(() => {
      router.push(`/get-started?callback=${encodeURIComponent(callback)}`);
    }, 700);
  }

  async function handleRazorpayPayment() {
    setLoading(true);
    try {
      const res = await fetch("/api/payment/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: task.price,
          currency: "INR",
          receipt: `taskmate_${task.id}`,
          notes: { taskId: task.id },
        }),
      });
      const { orderId, order, error } = await res.json();
      if (!orderId || error) {
        alert(error || "Failed to create payment order");
        setLoading(false);
        return;
      }

      // @ts-expect-error Razorpay is loaded via external script
      const Razorpay = window.Razorpay;
      if (!Razorpay) {
        alert("Razorpay SDK not loaded");
        setLoading(false);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "TaskMate Payment",
        description: `Payment for task: ${task.title}`,
        image: "/favicon.ico",
        order_id: orderId,
        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          await callApi("/api/tasks/complete", {
            paymentMethod: "online",
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          });
        },
        prefill: {
          name: task.createdBy?.name,
          email: task.createdBy?.email,
        },
        notes: { taskId: task.id },
        theme: { color: "#6366f1" },
        modal: { ondismiss: () => setLoading(false) },
      };

      const rzp = new Razorpay(options);
      rzp.open();
      setLoading(false);
    } catch {
      alert("Payment initiation failed");
      setLoading(false);
    }
  }

  return (
    <div ref={rootRef} data-task-id={task.id}>
      {authToast ? (
        <div className="mb-3">
          <InlineAlert variant="info" title="Please sign in">
            Please sign in to accept tasks.
          </InlineAlert>
        </div>
      ) : null}

      <Card
        hoverable
        className="p-4 sm:p-5"
      >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-base font-semibold text-white truncate">
              {task.title}
            </p>
            <Badge variant={meta.variant}>{meta.label}</Badge>
          </div>

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/55">
            <span>₹{task.price}</span>
            <span>
              {task.hostel ?? "—"}
              {task.roomNumber ? ` • Room ${task.roomNumber}` : ""}
            </span>
            <span>{task.category ?? "—"}</span>
            <span>Deadline: {deadlineLabel}</span>
          </div>

          {task.createdBy?.email ? (
            <div className="mt-3 flex items-center gap-2 text-xs text-white/55">
              <div className="h-7 w-7 overflow-hidden rounded-full border border-white/10 bg-white/5">
                {task.createdBy.photoURL ? (
                  <Image
                    src={task.createdBy.photoURL}
                    alt={task.createdBy.name ?? "User"}
                    width={28}
                    height={28}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[11px] font-semibold text-white/70">
                    {(task.createdBy.name ?? "U").slice(0, 1).toUpperCase()}
                  </div>
                )}
              </div>
              <span className="truncate">
                {task.createdBy.name ?? "User"}
              </span>
            </div>
          ) : null}
        </div>

        {/* Actions */}
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[220px]">
          {task.status === "open" && role === "acceptor" && (
            <Button
              loading={loading}
              onClick={() =>
                isAuthed
                  ? callApi("/api/tasks/accept")
                  : requireAuthForAccept()
              }
              className="w-full"
            >
              Accept
            </Button>
          )}

          {task.status === "accepted" && role === "acceptor" && (
            <Button
              loading={loading}
              onClick={() => callApi("/api/tasks/start")}
              className="w-full"
              variant="secondary"
            >
              Start
            </Button>
          )}

          {task.status === "in_progress" && role === "acceptor" && (
            <Button
              loading={loading}
              onClick={() => callApi("/api/tasks/work-done")}
              className="w-full"
              variant="secondary"
            >
              Mark work done
            </Button>
          )}

          {task.status === "work_done" && role === "creator" && (
            <div className="space-y-2">
              <select
                value={paymentMethod}
                onChange={(e) =>
                  setPaymentMethod(
                    e.target.value as "cash" | "upi" | "online" | ""
                  )
                }
                disabled={loading}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-white/20"
              >
                <option value="">Select payment</option>
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="online">Online (Razorpay)</option>
              </select>

              {paymentMethod === "online" ? (
                <Button
                  loading={loading}
                  onClick={handleRazorpayPayment}
                  className="w-full"
                >
                  Pay & complete
                </Button>
              ) : (
                <Button
                  loading={loading}
                  disabled={!paymentMethod}
                  onClick={() =>
                    callApi("/api/tasks/complete", {
                      paymentMethod,
                    })
                  }
                  className="w-full"
                  variant="secondary"
                >
                  Complete
                </Button>
              )}
            </div>
          )}

          {task.status === "payment_pending" && role === "acceptor" && (
            <Button
              loading={loading}
              onClick={() => callApi("/api/tasks/payment-received")}
              className="w-full"
              variant="secondary"
            >
              Payment received
            </Button>
          )}

          {task.status === "payment_received" && role === "creator" && (
            <Button
              loading={loading}
              onClick={() => callApi("/api/tasks/close")}
              className="w-full"
              variant="secondary"
            >
              Close task
            </Button>
          )}

          {task.status === "closed" && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
              ✅ Completed and closed
            </div>
          )}
        </div>
      </div>
      </Card>
    </div>
  );
}
