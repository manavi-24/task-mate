import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email;

  if (!userEmail) {
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

      if (!snap.exists) {
        throw new Error("Task not found");
      }

      const task = snap.data();
      if (!task) {
        throw new Error("Invalid task data");
      }

      if (task.createdBy?.email !== userEmail) {
        throw new Error("Only creator can close task");
      }

      if (task.paymentStatus !== "confirmed") {
        throw new Error("Payment not confirmed yet");
      }

      if (task.status === "closed") {
        throw new Error("Task already closed");
      }

      tx.update(taskRef, {
        status: "closed",
        closedAt: new Date(),
      });
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 400 }
    );
  }
}
