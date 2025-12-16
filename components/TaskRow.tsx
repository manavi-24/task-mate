"use client";

import CompleteTaskButton from "@/components/CompleteTaskButton";

type TaskRowProps = {
  task: any;
  role: "creator" | "acceptor";
};

export default function TaskRow({ task, role }: TaskRowProps) {
  async function callApi(endpoint: string) {
    await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId: task.id }),
    });

    window.location.reload();
  }

  const paymentStatus = task.paymentStatus ?? "pending";

  return (
    <div className="border border-gray-700 rounded p-4 space-y-3">
      {/* Task Info */}
      <div>
        <h3 className="font-semibold">{task.title}</h3>
        <p className="text-sm text-gray-400">{task.description}</p>
      </div>

      {/* Status */}
      <div className="text-sm space-x-2">
        <span>Status:</span>
        <span className="font-medium capitalize">{task.status}</span>
        {task.status !== "open" && (
          <span className="text-xs text-gray-400">
            (payment: {paymentStatus})
          </span>
        )}
      </div>

      {/* STEP 3 — ACCEPT */}
      {task.status === "open" && role !== "creator" && (
        <button
          onClick={() => callApi("/api/tasks/accept")}
          className="px-3 py-1 bg-emerald-600 text-white rounded"
        >
          Accept Task
        </button>
      )}

      {/* STEP 4 — START */}
      {role === "acceptor" && task.status === "accepted" && (
        <button
          onClick={() => callApi("/api/tasks/start")}
          className="px-3 py-1 bg-blue-600 text-white rounded"
        >
          Start Task
        </button>
      )}

      {/* STEP 4 — COMPLETE */}
      {role === "acceptor" && task.status === "in_progress" && (
        <CompleteTaskButton taskId={task.id} />
      )}

      {/* STEP 5 — MARK PAYMENT DONE */}
      {role === "acceptor" &&
        task.status === "completed" &&
        paymentStatus === "pending" && (
          <button
            onClick={() => callApi("/api/tasks/pay")}
            className="px-3 py-1 bg-yellow-500 text-black rounded"
          >
            Mark Payment Done
          </button>
        )}

      {/* STEP 5 — CONFIRM PAYMENT */}
      {role === "creator" &&
        task.status === "completed" &&
        paymentStatus === "paid" && (
          <button
            onClick={() => callApi("/api/tasks/confirm")}
            className="px-3 py-1 bg-purple-600 text-white rounded"
          >
            Confirm Payment
          </button>
        )}

      {/* STEP 6 — CLOSE TASK (FINAL) */}
      {role === "creator" &&
        task.status === "completed" &&
        paymentStatus === "confirmed" && (
          <button
            onClick={() => callApi("/api/tasks/close")}
            className="px-3 py-1 bg-red-600 text-white rounded"
          >
            Close Task
          </button>
        )}
    </div>
  );
}
