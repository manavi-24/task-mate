// app/api/tasks/complete/route.ts
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

    const { taskId, paymentMethod } = await req.json();

    if (!taskId || !paymentMethod) {
      return NextResponse.json(
        { error: "Task ID and payment method required" },
        { status: 400 }
      );
    }

    const taskRef = db.collection("tasks").doc(taskId);

    let acceptorEmail: string | null = null;
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

      acceptorEmail = taskData.acceptedBy?.email ?? null;
      taskTitle = taskData.title ?? null;

      // ❌ Must be work_done
      if (taskData.status !== "work_done") {
        throw new Error("Task is not ready to be completed");
      }

      // ❌ Only creator can complete task
      if (taskData.createdBy?.email !== userEmail) {
        throw new Error("Only creator can complete task");
      }

      // ✅ STEP 6 — work_done → payment_pending
      tx.update(taskRef, {
        status: "payment_pending",
        completedAt: FieldValue.serverTimestamp(),
        paymentMethod,
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    if (acceptorEmail && acceptorEmail !== userEmail) {
      await addUserNotification({
        toEmail: acceptorEmail,
        type: "task_completed",
        title: "Task completed",
        message: `${session.user?.name ?? "Someone"} completed “${
          taskTitle ?? "your task"
        }”. Awaiting payment confirmation.`,
        taskId,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ COMPLETE TASK ERROR:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 400 }
    );
  }
}
