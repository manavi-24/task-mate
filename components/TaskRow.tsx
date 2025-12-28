"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

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
    } catch {
      alert("Network error");
      setLoading(false);
    }
  }

  // Razorpay payment handler
  async function handleRazorpayPayment() {
    setLoading(true);
    try {
      // Create order on backend
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

      // @ts-ignore
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
        handler: async function (response: any) {
          // Optionally, verify payment on backend here
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
        notes: {
          taskId: task.id,
        },
        theme: {
          color: "#6366f1",
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      };
      const rzp = new Razorpay(options);
      rzp.open();
      setLoading(false);
    } catch (err) {
      alert("Payment initiation failed");
      setLoading(false);
    }
  }

  /* ========================= */
  /* AUTO CLOSE TASK */
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

  // Use a fixed locale and options for consistent SSR/CSR rendering
  const formattedDeadline = task.deadline
    ? new Date(task.deadline).toLocaleString('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })
    : "—";

  /* ========================= */
  /* EXPIRING SOON (< 6 HOURS) */
  /* ========================= */
  const isExpiringSoon =
    task.deadline &&
    new Date(task.deadline).getTime() - Date.now() <
      6 * 60 * 60 * 1000;

  return (
    <div className="border border-gray-700 rounded p-4 space-y-4">
      {/* ================= TASK INFO ================= */}
      <div>
        <h3 className="font-semibold text-lg">{task.title}</h3>
        <p className="text-sm text-gray-400">{task.description}</p>
      </div>

      {/* ================= META ================= */}
      <div className="text-sm text-gray-300 space-y-1">
        <p>💰 Price: ₹{task.price}</p>
        <p>📍 Location: {task.hostel}, Room {task.roomNumber}</p>
        <p>⏰ Deadline: {formattedDeadline}</p>
        <p>📂 Category: {task.category}</p>

        {isExpiringSoon && (
          <p className="text-red-400 font-semibold">
            ⚠️ Expiring Soon
          </p>
        )}
      </div>

      {/* ================= CREATOR INFO ================= */}
      <div className="flex items-center gap-3 text-sm">
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden">
          {task.createdBy?.photoURL ? (
            <img
              src={task.createdBy.photoURL}
              alt={task.createdBy.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="text-white font-semibold">
              {task.createdBy?.name?.[0]?.toUpperCase() ?? "U"}
            </span>
          )}
        </div>

        {/* Name + Email */}
        <div>
          <p className="font-medium">{task.createdBy?.name}</p>
          <p className="text-gray-400 text-xs">
            {task.createdBy?.email}
          </p>
        </div>
      </div>

      {/* ================= STATUS ================= */}
      <div className="text-sm">
        <span>Status: </span>
        <span className="font-medium capitalize">{task.status}</span>
      </div>

      {/* ================= ACTIONS ================= */}

      {/* STEP 3 — ACCEPT TASK */}
      {task.status === "open" && role === "acceptor" && (
        <button
          disabled={loading}
          onClick={() => callApi("/api/tasks/accept")}
          className="px-3 py-1 bg-emerald-600 text-white rounded"
        >
          Accept Task
        </button>
      )}

      {/* STEP 4 — START TASK */}
      {task.status === "accepted" && role === "acceptor" && (
        <button
          disabled={loading}
          onClick={() => callApi("/api/tasks/start")}
          className="px-3 py-1 bg-blue-600 text-white rounded"
        >
          Start Task
        </button>
      )}

      {/* STEP 5 — WORK DONE */}
      {task.status === "in_progress" && role === "acceptor" && (
        <button
          disabled={loading}
          onClick={() => callApi("/api/tasks/work-done")}
          className="px-3 py-1 bg-indigo-600 text-white rounded"
        >
          Mark Work Done
        </button>
      )}

      {/* STEP 6 — CREATOR COMPLETES */}
      {task.status === "work_done" && role === "creator" && (
        <div className="space-y-2">
          <select
            value={paymentMethod}
            onChange={(e) =>
              setPaymentMethod(e.target.value as "cash" | "upi" | "online")
            }
            className="border p-2 rounded w-full"
            disabled={loading}
          >
            <option value="">Select payment method</option>
            <option value="cash">Cash</option>
            <option value="online">Online (Card/UPI/Wallets)</option>
          </select>

          {/* Show payment button for online, else fallback to old flow */}
          {paymentMethod === "online" ? (
            <button
              disabled={loading}
              onClick={handleRazorpayPayment}
              className="px-3 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded w-full font-semibold flex items-center justify-center gap-2 shadow-lg hover:from-indigo-600 hover:to-purple-600 transition"
            >
              <Image src="/razorpay-logo.svg" alt="Razorpay" width={24} height={24} />
              Pay & Complete Task
            </button>
          ) : (
            <button
              disabled={loading || !paymentMethod}
              onClick={() => callApi("/api/tasks/complete", { paymentMethod })}
              className="px-3 py-2 bg-yellow-500 text-black rounded w-full font-semibold hover:bg-yellow-400 transition"
            >
              Complete Task
            </button>
          )}
        </div>
      )}

      {/* STEP 7 — PAYMENT RECEIVED */}
      {task.status === "payment_pending" && role === "acceptor" && (
        <button
          disabled={loading}
          onClick={() => callApi("/api/tasks/payment-received")}
          className="px-3 py-1 bg-green-600 text-white rounded"
        >
          Payment Received
        </button>
      )}

      {/* FINAL STATE */}
      {task.status === "closed" && (
        <p className="text-green-600 font-semibold">
          ✅ Task completed and closed successfully
        </p>
      )}
    </div>
  );
}
