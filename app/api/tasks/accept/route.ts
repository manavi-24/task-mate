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

      if (task?.status !== "open") {
        throw new Error("Task is not open");
      }

      if (task.createdBy?.email === userEmail) {
        throw new Error("Cannot accept your own task");
      }

      if (task.acceptedBy) {
        throw new Error("Task already accepted");
      }

      tx.update(taskRef, {
        status: "accepted",
        acceptedBy: {
          email: userEmail,
          name: session.user?.name ?? "",
        },
        acceptedAt: new Date(),
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
