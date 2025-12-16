// app/api/tasks/complete/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

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

    await db.runTransaction(async (tx) => {
      const snap = await tx.get(taskRef);

      if (!snap.exists) {
        throw new Error("Task not found");
      }

      const taskData = snap.data();
      if (!taskData) {
        throw new Error("Invalid task data");
      }

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
      });
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ COMPLETE TASK ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 400 }
    );
  }
}
