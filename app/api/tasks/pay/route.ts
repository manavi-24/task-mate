import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { taskId } = await req.json();

  if (!taskId) {
    return NextResponse.json({ error: "Task ID required" }, { status: 400 });
  }

  const taskRef = db.collection("tasks").doc(taskId);

  try {
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(taskRef);
      if (!snap.exists) throw new Error("Task not found");

      const task = snap.data();

      if (task.status !== "completed") {
        throw new Error("Task not completed yet");
      }

      if ((task.paymentStatus ?? "pending") !== "pending") {
        throw new Error("Payment already handled");
      }

      if (task.acceptedBy?.email !== session.user.email) {
        throw new Error("Only acceptor can mark payment");
      }

      tx.update(taskRef, {
        paymentStatus: "paid",
        paidAt: new Date(),
      });
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
