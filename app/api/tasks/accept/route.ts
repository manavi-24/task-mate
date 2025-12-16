// app/api/tasks/accept/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: Request) {
  try {
    console.log("🔥 ACCEPT TASK API HIT");

    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
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
    const snap = await taskRef.get();

    if (!snap.exists) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    const taskData = snap.data();
    if (!taskData) {
      return NextResponse.json(
        { error: "Invalid task data" },
        { status: 500 }
      );
    }

    // ❌ Creator cannot accept own task
    if (taskData.createdBy?.email === session.user.email) {
      return NextResponse.json(
        { error: "Creator cannot accept own task" },
        { status: 403 }
      );
    }

    // ❌ Only open tasks
    if (taskData.status !== "open") {
      return NextResponse.json(
        { error: "Task is not open" },
        { status: 400 }
      );
    }

    // ✅ STEP 3 — open → accepted
    await taskRef.update({
      status: "accepted",
      acceptedAt: FieldValue.serverTimestamp(),
      acceptorId: session.user.email,
      acceptedBy: {
        email: session.user.email,
        name: session.user.name,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ ACCEPT TASK ERROR:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
