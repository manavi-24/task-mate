"use client";

import { useState, useEffect } from "react";

type TaskRowProps = {
  task: any;
  role: "creator" | "acceptor";
};

export default function TaskRow({ task, role }: TaskRowProps) {
  const [paymentMethod, setPaymentMethod] = useState<
    "cash" | "upi" | "online" | ""
  >("");
  const [loading, setLoading] = useState(false);

  async function callApi(endpoint: string, body: any = {}) {
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
    } catch (err) {
      alert("Network error");
      setLoading(false);
    }
  }

  /* ========================= */
  /* STEP 8 — AUTO CLOSE TASK */
  /* payment_received → closed */
  /* ========================= */
  useEffect(() => {
    if (task.status === "payment_received") {
      fetch("/api/tasks/close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: task.id }),
      });
    }
  }, [task.status, task.id]);

  return (
    <div className="border border-gray-700 rounded p-4 space-y-3">
      {/* TASK INFO */}
      <div>
        <h3 className="font-semibold text-lg">{task.title}</h3>
        <p className="text-sm text-gray-400">{task.description}</p>
        <p className="text-sm text-gray-400">₹{task.price}</p>
      </div>

      {/* STATUS */}
      <div className="text-sm">
        <span>Status: </span>
        <span className="font-medium capitalize">{task.status}</span>
      </div>

      {/* ========================= */}
      {/* STEP 3 — ACCEPT TASK */}
      {/* open → accepted */}
      {/* ========================= */}
      {task.status === "open" && role === "acceptor" && (
        <button
          disabled={loading}
          onClick={() => callApi("/api/tasks/accept")}
          className="px-3 py-1 bg-emerald-600 text-white rounded"
        >
          Accept Task
        </button>
      )}

      {/* ========================= */}
      {/* STEP 4 — START TASK */}
      {/* accepted → in_progress */}
      {/* ========================= */}
      {task.status === "accepted" && role === "acceptor" && (
        <button
          disabled={loading}
          onClick={() => callApi("/api/tasks/start")}
          className="px-3 py-1 bg-blue-600 text-white rounded"
        >
          Start Task
        </button>
      )}

      {/* ========================= */}
      {/* STEP 5 — WORK DONE */}
      {/* in_progress → work_done */}
      {/* ========================= */}
      {task.status === "in_progress" && role === "acceptor" && (
        <button
          disabled={loading}
          onClick={() => callApi("/api/tasks/work-done")}
          className="px-3 py-1 bg-indigo-600 text-white rounded"
        >
          Mark Work Done
        </button>
      )}

      {/* ========================= */}
      {/* STEP 6 — CREATOR COMPLETES */}
      {/* work_done → payment_pending */}
      {/* ========================= */}
      {task.status === "work_done" && role === "creator" && (
        <div className="space-y-2">
          <select
            value={paymentMethod}
            onChange={(e) =>
              setPaymentMethod(e.target.value as "cash" | "upi" | "online")
            }
            className="border p-2 rounded w-full"
          >
            <option value="">Select payment method</option>
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
            <option value="online">Online</option>
          </select>

          <button
            disabled={loading || !paymentMethod}
            onClick={() =>
              callApi("/api/tasks/complete", { paymentMethod })
            }
            className="px-3 py-1 bg-yellow-500 text-black rounded w-full"
          >
            Complete Task
          </button>
        </div>
      )}

      {/* ========================= */}
      {/* STEP 7 — PAYMENT RECEIVED */}
      {/* payment_pending → payment_received */}
      {/* ========================= */}
      {task.status === "payment_pending" && role === "acceptor" && (
        <button
          disabled={loading}
          onClick={() => callApi("/api/tasks/payment-received")}
          className="px-3 py-1 bg-green-600 text-white rounded"
        >
          Payment Received
        </button>
      )}

      {/* ========================= */}
      {/* FINAL STATE */}
      {/* closed */}
      {/* ========================= */}
      {task.status === "closed" && (
        <p className="text-green-600 font-semibold">
          ✅ Task completed and closed successfully
        </p>
      )}
    </div>
  );
}
