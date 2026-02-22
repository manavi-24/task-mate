// app/api/tasks/start/route.ts
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

      // ❌ Must be accepted
      if (taskData.status !== "accepted") {
        throw new Error("Task is not accepted yet");
      }

      // ❌ Only acceptor can start task
      if (taskData.acceptedBy?.email !== userEmail) {
        throw new Error("Only acceptor can start task");
      }

      // ✅ STEP 4 — accepted → in_progress
      tx.update(taskRef, {
        status: "in_progress",
        startedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    if (creatorEmail && creatorEmail !== userEmail) {
      await addUserNotification({
        toEmail: creatorEmail,
        type: "task_started",
        title: "Task started",
        message: `${session.user?.name ?? "Someone"} started working on “${
          taskTitle ?? "your task"
        }”.`,
        taskId,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ START TASK ERROR:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 400 }
    );
  }
}
