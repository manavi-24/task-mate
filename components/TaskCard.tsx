"use client";

import { useState } from "react";

type TaskCardProps = {
  // Legacy component (currently not used in main flows). Keep types minimal.
  // Using `any` here prevents build-time TS failures while keeping this legacy file around.
  task: Record<string, any>;
  currentUserEmail?: string;
};

export default function TaskCard({ task, currentUserEmail }: TaskCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<"cash" | "upi" | "">("");

  /* ------------------ ACCEPT TASK ------------------ */
  async function acceptTask() {
    setLoading(true);
    setError("");

    const res = await fetch("/api/tasks/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId: task.id }),
    });

    const data = await res.json();

    if (!res.ok) setError(data.error || "Failed to accept task");
    else location.reload();

    setLoading(false);
  }

  /* --------- ACCEPTOR MARKS WORK DONE --------- */
  async function completeTask() {
    setLoading(true);
    setError("");

    const res = await fetch("/api/tasks/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId: task.id }),
    });

    const data = await res.json();

    if (!res.ok) setError(data.error || "Failed to complete task");
    else location.reload();

    setLoading(false);
  }

  /* --------- CREATOR CONFIRMS PAYMENT --------- */
  async function payTask() {
    if (!paymentMethod) {
      setError("Select payment method");
      return;
    }

    setLoading(true);
    setError("");

    const res = await fetch("/api/tasks/pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        taskId: task.id,
        paymentMethod,
      }),
    });

    const data = await res.json();

    if (!res.ok) setError(data.error || "Payment failed");
    else location.reload();

    setLoading(false);
  }

  /* ------------------ UI ------------------ */
  return (
    <div className="border p-4 rounded space-y-3">
      <h2 className="font-semibold text-lg">{task.title}</h2>
      <p>{task.description}</p>
      <p className="font-medium">₹{task.price}</p>
      <p className="text-sm text-gray-500">{task.category}</p>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* ===================== */}
      {/* ACCEPT TASK (ANY USER EXCEPT CREATOR) */}
      {/* ===================== */}
      {task.status === "open" &&
        task.createdBy?.email !== currentUserEmail && (
          <button
            onClick={acceptTask}
            disabled={loading}
            className="bg-black text-white px-4 py-2 rounded w-full"
          >
            {loading ? "Accepting..." : "Accept Task"}
          </button>
        )}

      {/* ===================== */}
      {/* ACCEPTOR: MARK WORK DONE */}
      {/* ===================== */}
      {task.status === "accepted" &&
        task.acceptedBy?.email === currentUserEmail && (
          <button
            onClick={completeTask}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded w-full"
          >
            {loading ? "Submitting..." : "Mark Work as Done"}
          </button>
        )}

      {/* ===================== */}
      {/* CREATOR: CONFIRM PAYMENT */}
      {/* ===================== */}
      {task.status === "completed" &&
        task.createdBy?.email === currentUserEmail && (
          <div className="space-y-2">
            <select
              value={paymentMethod}
              onChange={(e) =>
                setPaymentMethod(e.target.value as "cash" | "upi" | "")
              }
              className="border p-2 w-full"
            >
              <option value="">Select payment method</option>
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
            </select>

            <button
              onClick={payTask}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded w-full"
            >
              {loading ? "Confirming..." : "Confirm Payment"}
            </button>
          </div>
        )}

      {/* ===================== */}
      {/* FINAL PAID STATE */}
      {/* ===================== */}
      {task.status === "paid" && (
        <p className="text-green-700 font-semibold">
          ✅ Task completed & paid
        </p>
      )}
    </div>
  );
}
