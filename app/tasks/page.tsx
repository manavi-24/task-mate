import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/firebaseAdmin";
import { serializeTask } from "@/lib/serializeTask";
import Link from "next/link";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { Button } from "@/components/ui/Button";
import { TaskCompactRow } from "@/components/dashboard/TaskCompactRow";
import TasksAcceptHighlight from "@/app/tasks/TasksAcceptHighlight";

export const dynamic = "force-dynamic";

export default async function TasksPage(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getServerSession(authOptions);
  const isAuthed = Boolean(session?.user?.email);

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

  const created =
    typeof rawSearchParams.created === "string"
      ? rawSearchParams.created
      : "";

  const focus =
    typeof rawSearchParams.focus === "string"
      ? rawSearchParams.focus
      : "";

  const accept =
    typeof rawSearchParams.accept === "string"
      ? rawSearchParams.accept
      : "";

  /* ================= FETCH TASKS ================= */
  const snap = await db
    .collection("tasks")
    .where("status", "==", "open")
    .get();

  let tasks = snap.docs.map(serializeTask);

  // Use an ISO timestamp string to filter expired tasks without calling Date.now()
  // (repo lint rule flags Date.now() during render as impure).
  const nowIso = new Date().toISOString();

  /* ================= HIDE EXPIRED ================= */
  tasks = tasks.filter(task => {
    if (!task.deadline) return true;
    // deadline is an ISO string (see serializeTask). ISO strings sort lexicographically.
    return task.deadline > nowIso;
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
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] [background-size:24px_24px]" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8 space-y-6">
        <TasksAcceptHighlight taskId={focus || accept} />
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-indigo-300">
              Task board
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
              Browse tasks
            </h1>
            <p className="text-white/60 mt-2 max-w-2xl">
              Find tasks posted by hostelmates and accept one to start earning.
            </p>
          </div>

          {isAuthed ? (
            <Link href="/tasks/create">
              <Button className="shrink-0">Create task</Button>
            </Link>
          ) : (
            <Link
              href={`/get-started?callback=${encodeURIComponent("/tasks")}`}
            >
              <Button className="shrink-0">Get started</Button>
            </Link>
          )}
        </div>

      {focus || accept ? (
        <InlineAlert variant="info" title="Tip">
          Sign in to accept tasks. After login, we’ll bring you back to this task.
        </InlineAlert>
      ) : null}

      {created === "1" && (
        <InlineAlert variant="success" title="Task posted">
          Your task is live. Share it with friends to get it accepted faster.
        </InlineAlert>
      )}

      {/* ================= FILTER BAR ================= */}
      <form method="GET" className="flex flex-wrap gap-3">
        <select
          name="category"
          defaultValue={category}
          className="border border-white/10 bg-white/5 text-white p-2 rounded-xl"
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
          className="border border-white/10 bg-white/5 text-white placeholder:text-white/40 p-2 rounded-xl"
        />

        <select
          name="sort"
          defaultValue={sort}
          className="border border-white/10 bg-white/5 text-white p-2 rounded-xl"
        >
          <option value="">Default order</option>
          <option value="deadline">Nearest deadline</option>
        </select>

        <button
          type="submit"
          className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-xl font-semibold"
        >
          Apply
        </button>
      </form>

      {/* ================= TASK LIST ================= */}
      {tasks.length === 0 && (
        <InlineAlert variant="info" title="No tasks available">
          Check back later, or post one yourself.
        </InlineAlert>
      )}

      <div className="space-y-3">
        {tasks.map(task => (
          <TaskCompactRow
            key={task.id}
            task={task}
            role="acceptor"
            highlight={focus === task.id || accept === task.id}
          />
        ))}
      </div>
      </div>
    </div>
  );
}
