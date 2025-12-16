import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/firebaseAdmin";
import { serializeTask } from "@/lib/serializeTask";
import TaskRow from "@/components/TaskRow";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const snap = await db
    .collection("tasks")
    .where("status", "==", "open")
    .orderBy("createdAt", "desc")
    .get();

  const tasks = snap.docs.map(serializeTask);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Available Tasks</h1>

      {tasks.length === 0 && (
        <p className="text-gray-400">No tasks available right now.</p>
      )}

      {tasks.map(task => (
        <TaskRow key={task.id} task={task} role="acceptor" />
      ))}
    </div>
  );
}
