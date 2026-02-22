// app/api/tasks/work-done/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { addUserNotification } from "@/lib/notifications";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    const userEmail = session?.user?.email;
    if (!userEmail) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { taskId } = await req.json();
    if (!taskId) {
      return NextResponse.json(
        { error: "Task ID required" },
        { status: 400 }
      );
    }

    const taskRef = db.collection("tasks").doc(taskId);

    let creatorEmail: string | null = null;
    let taskTitle: string | null = null;

    await db.runTransaction(async (tx) => {
      const snap = await tx.get(taskRef);

      if (!snap.exists) {
        throw new Error("Task not found");
      }

      const taskData = snap.data();
      if (!taskData) {
        throw new Error("Invalid task data");
      }

      creatorEmail = taskData.createdBy?.email ?? null;
      taskTitle = taskData.title ?? null;

      // ❌ Must be in_progress
      if (taskData.status !== "in_progress") {
        throw new Error("Task is not in progress");
      }

      // ❌ Only acceptor can mark work done
      if (taskData.acceptedBy?.email !== userEmail) {
        throw new Error("Only acceptor can mark work done");
      }

      // ✅ STEP 5 — in_progress → work_done
      tx.update(taskRef, {
        status: "work_done",
        workDoneAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    if (creatorEmail && creatorEmail !== userEmail) {
      await addUserNotification({
        toEmail: creatorEmail,
        type: "task_work_done",
        title: "Work marked as done",
        message: `${session.user?.name ?? "Someone"} marked “${
          taskTitle ?? "your task"
        }” as done. Please review and complete.`,
        taskId,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ WORK DONE ERROR:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 400 }
    );
  }
}
