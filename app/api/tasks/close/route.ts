// app/api/tasks/close/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: Request) {
  try {
    console.log("🔥 CLOSE TASK API HIT");

    const { taskId } = await req.json();
    if (!taskId) {
      return NextResponse.json({ error: "Task ID required" }, { status: 400 });
    }

    const taskRef = db.collection("tasks").doc(taskId);
    const snap = await taskRef.get();

    if (!snap.exists) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const task = snap.data();

    // ❌ Can only close after payment received
    if (task?.status !== "payment_received") {
      return NextResponse.json(
        { error: "Task is not ready to be closed" },
        { status: 400 }
      );
    }

    await taskRef.update({
      status: "closed",
      closedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ CLOSE TASK ERROR:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
