import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/firebaseAdmin";
import { serializeTask } from "@/lib/serializeTask";
import TaskRow from "@/components/TaskRow";

export const dynamic = "force-dynamic";

export default async function TasksPage(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  /* ================= AWAIT searchParams ================= */
  const rawSearchParams = (await props.searchParams) || {};

  const category =
    typeof rawSearchParams.category === "string"
      ? rawSearchParams.category
      : "all";

  const hostel =
    typeof rawSearchParams.hostel === "string"
      ? rawSearchParams.hostel
      : "";

  const sort =
    typeof rawSearchParams.sort === "string"
      ? rawSearchParams.sort
      : "";

  /* ================= FETCH TASKS ================= */
  const snap = await db
    .collection("tasks")
    .where("status", "==", "open")
    .get();

  let tasks = snap.docs.map(serializeTask);

  const now = Date.now();

  /* ================= HIDE EXPIRED ================= */
  tasks = tasks.filter(task => {
    if (!task.deadline) return true;
    return new Date(task.deadline).getTime() > now;
  });

  /* ================= FILTER: CATEGORY ================= */
  if (category !== "all") {
    tasks = tasks.filter(task => task.category === category);
  }

  /* ================= FILTER: HOSTEL ================= */
  if (hostel.trim() !== "") {
    tasks = tasks.filter(task =>
      task.hostel
        ?.toLowerCase()
        .includes(hostel.toLowerCase())
    );
  }

  /* ================= SORT: DEADLINE ================= */
  if (sort === "deadline") {
    tasks.sort((a, b) => {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return (
        new Date(a.deadline).getTime() -
        new Date(b.deadline).getTime()
      );
    });
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Available Tasks</h1>

      {/* ================= FILTER BAR ================= */}
      <form method="GET" className="flex flex-wrap gap-3">
        <select
          name="category"
          defaultValue={category}
          className="border p-2 rounded"
        >
          <option value="all">All Categories</option>
          <option value="cooking">Cooking</option>
          <option value="cleaning">Cleaning</option>
          <option value="drying">Drying</option>
          <option value="academics">Academics</option>
          <option value="others">Others</option>
        </select>

        <input
          name="hostel"
          placeholder="Filter by hostel"
          defaultValue={hostel}
          className="border p-2 rounded"
        />

        <select
          name="sort"
          defaultValue={sort}
          className="border p-2 rounded"
        >
          <option value="">Default order</option>
          <option value="deadline">Nearest deadline</option>
        </select>

        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded"
        >
          Apply
        </button>
      </form>

      {/* ================= TASK LIST ================= */}
      {tasks.length === 0 && (
        <p className="text-gray-400">No tasks available right now.</p>
      )}

      {tasks.map(task => (
        <TaskRow key={task.id} task={task} role="acceptor" />
      ))}
    </div>
  );
}
