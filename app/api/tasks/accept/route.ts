// app/api/tasks/accept/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { addUserNotification } from "@/lib/notifications";
import { createSystemMessage, getOrCreateConversation } from "@/lib/conversations";

export async function POST(req: Request) {
  try {
    console.log("🔥 ACCEPT TASK API HIT");

    const session = await getServerSession(authOptions);

    const userEmail = session?.user?.email;
    if (!userEmail) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userName = session.user?.name ?? null;

    const { taskId } = await req.json();
    if (!taskId) {
      return NextResponse.json(
        { error: "Task ID required" },
        { status: 400 }
      );
    }

    const taskRef = db.collection("tasks").doc(taskId);

    let creatorEmail: string | null = null;
    let creatorName: string | null = null;
    let taskTitle: string | null = null;

    // Use a transaction to prevent double-accept races.
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
      creatorName = taskData.createdBy?.name ?? null;
      taskTitle = taskData.title ?? null;

      // ❌ Creator cannot accept own task
      if (taskData.createdBy?.email === userEmail) {
        throw new Error("Creator cannot accept own task");
      }

      // ❌ Only open tasks
      if (taskData.status !== "open") {
        throw new Error("Task is not open");
      }

      // ✅ STEP 3 — open → accepted
      tx.update(taskRef, {
        status: "accepted",
        acceptedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        acceptorId: userEmail,
        acceptedBy: {
          email: userEmail,
          name: userName,
        },
      });
    });

    // Create notification for the task creator (server-side).
    // Uses email as user doc key (current repo convention).
    if (creatorEmail && creatorEmail !== userEmail) {
      await addUserNotification({
        toEmail: creatorEmail,
        type: "task_accepted",
        title: "Task accepted",
        message: `${userName ?? "Someone"} accepted “${taskTitle ?? "your task"}”.`,
        taskId,
      });

      const conversationId = await getOrCreateConversation(
        creatorEmail,
        userEmail
      );
      const safeTitle = taskTitle ?? "your task";
      await createSystemMessage({
        conversationId,
        text: `Hi ${creatorName ?? "there"}, I’ve accepted your task “${safeTitle}”. I’ll keep you updated here.`,
        taskId,
        taskTitle,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ ACCEPT TASK ERROR:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    const status = message === "Task not found" ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
