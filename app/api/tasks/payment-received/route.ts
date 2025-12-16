// app/api/tasks/payment-received/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: Request) {
  try {
    console.log("🔥 PAYMENT RECEIVED API HIT");

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

    await db.runTransaction(async (tx) => {
      const snap = await tx.get(taskRef);

      if (!snap.exists) {
        throw new Error("Task not found");
      }

      const taskData = snap.data();
      if (!taskData) {
        throw new Error("Invalid task data");
      }

      // ❌ Only acceptor can confirm payment
      if (taskData.acceptorId !== userEmail) {
        throw new Error("Only acceptor can confirm payment");
      }

      // ❌ Must be payment_pending
      if (taskData.status !== "payment_pending") {
        throw new Error("Task is not awaiting payment confirmation");
      }

      // ✅ STEP 7 — payment_pending → payment_received
      tx.update(taskRef, {
        status: "payment_received",
        paymentReceivedAt: FieldValue.serverTimestamp(),
      });
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ PAYMENT RECEIVED ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 400 }
    );
  }
}
