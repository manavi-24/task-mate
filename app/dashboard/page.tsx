export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/firebaseAdmin";
import TaskRow from "@/components/TaskRow";
import { serializeTask } from "@/lib/serializeTask";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const email = session.user.email;

  /* ---------- MY POSTED TASKS ---------- */
  const postedSnap = await db
    .collection("tasks")
    .where("createdBy.email", "==", email)
    .orderBy("createdAt", "desc")
    .get();

  const postedTasks = postedSnap.docs.map(serializeTask);

  /* ---------- MY ACCEPTED TASKS ---------- */
  const acceptedSnap = await db
    .collection("tasks")
    .where("acceptedBy.email", "==", email)
    .get();

  const acceptedTasks = acceptedSnap.docs.map(serializeTask);

  /* ---------- EARNINGS (ONLY CLOSED TASKS) ---------- */
  const earnings = acceptedTasks
    .filter(task => task.status === "closed")
    .reduce((sum, task) => sum + (task.price || 0), 0);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-12">
      <section>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-lg mt-1">Total Earnings: ₹{earnings}</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">My Posted Tasks</h2>

        {postedTasks.length === 0 && (
          <p className="text-gray-500">No tasks posted yet.</p>
        )}

        {postedTasks.map(task => (
          <TaskRow key={task.id} task={task} role="creator" />
        ))}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">My Accepted Tasks</h2>

        {acceptedTasks.length === 0 && (
          <p className="text-gray-500">No tasks accepted yet.</p>
        )}

        {acceptedTasks.map(task => (
          <TaskRow key={task.id} task={task} role="acceptor" />
        ))}
      </section>
    </div>
  );
}
