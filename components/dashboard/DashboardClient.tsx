"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TaskCompactRow } from "@/components/dashboard/TaskCompactRow";
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
  createdAt?: string | null;
  updatedAt?: string | null;
  createdBy?: {
    name?: string | null;
    email?: string | null;
    photoURL?: string | null;
  };
};

type TabKey = "posted" | "accepted" | "active";

export function DashboardClient({
  postedTasks,
  acceptedTasks,
}: {
  postedTasks: Task[];
  acceptedTasks: Task[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const created = searchParams.get("created") === "1";
  const focus = searchParams.get("focus") ?? "";

  // After creating a task, or when focusing a task, default to the Active tab.
  const [tab, setTab] = useState<TabKey>(
    created || focus ? "active" : "posted"
  );

  const activePosted = useMemo(
    () => postedTasks.filter((t) => t.status !== "closed"),
    [postedTasks]
  );
  const activeAccepted = useMemo(
    () => acceptedTasks.filter((t) => t.status !== "closed"),
    [acceptedTasks]
  );

  const activeAll = useMemo(() => {
    // Combine active posted + accepted (avoid duplicates by id)
    // If a task appears in both sets (edge case), keep creator role.
    const merged = new Map<string, { task: Task; role: "creator" | "acceptor" }>();
    for (const t of activePosted) merged.set(t.id, { task: t, role: "creator" });
    for (const t of activeAccepted) {
      if (!merged.has(t.id)) merged.set(t.id, { task: t, role: "acceptor" });
    }

    const asArray = Array.from(merged.values());
    // Sort by updatedAt, fallback to createdAt.
    // ISO strings compare lexicographically.
    asArray.sort((a, b) => {
      const aKey = a.task.updatedAt ?? a.task.createdAt ?? "";
      const bKey = b.task.updatedAt ?? b.task.createdAt ?? "";
      return bKey.localeCompare(aKey);
    });

    return asArray;
  }, [activePosted, activeAccepted]);

  const filtered = useMemo(() => {
    if (tab === "active") return activeAll;
    if (tab === "posted") {
      return postedTasks.map((t) => ({ task: t, role: "creator" as const }));
    }
    return acceptedTasks.map((t) => ({ task: t, role: "acceptor" as const }));
  }, [tab, postedTasks, acceptedTasks, activeAll]);

  const emptyFiltered = filtered.length === 0;

  function setTabAndClearFocus(nextTab: TabKey) {
    if (focus) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("focus");
      const next = params.toString();
      router.replace(next ? `?${next}` : "?");
    }
    setTab(nextTab);
  }

  function dismissCreatedToast() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("created");
    const next = params.toString();
    router.replace(next ? `?${next}` : "?");
  }

  return (
    <section className="space-y-4">
      {created && (
        <InlineAlert
          variant="success"
          title="Task posted"
          className="flex items-start justify-between gap-4"
        >
          <div className="flex-1">
            Your task is live — check the “Active” tab to see it right away.
          </div>
          <button
            type="button"
            onClick={dismissCreatedToast}
            className="text-xs font-semibold text-emerald-200 hover:text-emerald-100"
          >
            Dismiss
          </button>
        </InlineAlert>
      )}

      {/* Tabs */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-1 sm:w-auto">
          <SegmentButton active={tab === "posted"} onClick={() => setTab("posted")}>
            Posted by me
          </SegmentButton>
          <SegmentButton
            active={tab === "accepted"}
            onClick={() => setTabAndClearFocus("accepted")}
          >
            Accepted by me
          </SegmentButton>
          <SegmentButton
            active={tab === "active"}
            onClick={() => setTabAndClearFocus("active")}
          >
            Active
          </SegmentButton>
        </div>

        <div className="flex gap-2">
          <Link href="/tasks/create">
            <Button>Create task</Button>
          </Link>
          <Link href="/tasks">
            <Button variant="secondary">Browse Tasks</Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      {emptyFiltered ? (
        <Card className="p-8">
          <div className="mx-auto max-w-md text-center">
            <p className="text-base font-semibold text-white">
              {tab === "posted"
                ? "No tasks posted yet"
                : tab === "accepted"
                  ? "No accepted tasks yet"
                  : "No active tasks right now"}
            </p>
            <p className="mt-2 text-sm text-white/60">
              {tab === "posted"
                ? "Post a task to get help from hostelmates."
                : tab === "accepted"
                  ? "Browse tasks and accept one to start earning."
                  : "Active shows tasks you posted or accepted that aren’t closed."}
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href={tab === "accepted" ? "/tasks" : "/tasks/create"}>
                <Button className="w-full sm:w-auto">
                  {tab === "accepted" ? "Browse tasks" : "Create task"}
                </Button>
              </Link>
              <Link href={tab === "accepted" ? "/tasks/create" : "/tasks"}>
                <Button variant="secondary" className="w-full sm:w-auto">
                  {tab === "accepted" ? "Create task" : "Browse tasks"}
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(({ task, role }) => (
            <TaskCompactRow
              key={`${role}_${task.id}`}
              task={task}
              role={role}
              highlight={Boolean(focus) && focus === task.id}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function SegmentButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "flex-1 rounded-xl px-4 py-2 text-sm font-medium transition sm:flex-initial " +
        (active
          ? "bg-white text-black shadow-sm"
          : "text-white/70 hover:text-white")
      }
    >
      {children}
    </button>
  );
}
