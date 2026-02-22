"use client";

import { useState } from "react";

export default function CompleteTaskButton({ taskId }: { taskId: string }) {
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "upi">("cash");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleComplete() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/tasks/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskId,
          paymentMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      // success → refresh task list
      window.location.reload();
    } catch {
      setError("Network error");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2 mt-3">
      <select
        value={paymentMethod}
        onChange={(e) => setPaymentMethod(e.target.value as "cash" | "upi")}
        className="w-full border p-2 rounded"
      >
        <option value="cash">Cash</option>
        <option value="upi">UPI</option>
      </select>

      <button
        onClick={handleComplete}
        disabled={loading}
        className="w-full bg-green-600 text-white py-2 rounded"
      >
        {loading ? "Completing..." : "Mark as Completed"}
      </button>

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}