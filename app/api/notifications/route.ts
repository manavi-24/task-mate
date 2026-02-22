import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/firebaseAdmin";

type NotificationDoc = {
  type?: string;
  title?: string;
  message?: string;
  taskId?: string;
  ctaUrl?: string;
  createdAt?: FirebaseFirestore.Timestamp;
  readAt?: FirebaseFirestore.Timestamp | null;
};

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const limitRaw = Number(url.searchParams.get("limit") ?? "10");
  const limit = Number.isFinite(limitRaw)
    ? Math.min(Math.max(limitRaw, 1), 20)
    : 10;

  const snap = await db
    .collection("users")
    .doc(email)
    .collection("notifications")
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();

  const notifications = snap.docs.map((doc) => {
    const data = doc.data() as NotificationDoc;
    const createdAt = data.createdAt?.toDate
      ? data.createdAt.toDate().toISOString()
      : null;
    const readAt = data.readAt?.toDate ? data.readAt.toDate().toISOString() : null;

    return {
      id: doc.id,
      type: data.type ?? "system",
      title: data.title ?? "",
      message: data.message ?? "",
      taskId: data.taskId ?? null,
      ctaUrl: data.ctaUrl ?? null,
      createdAt,
      readAt,
    };
  });

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return NextResponse.json({ notifications, unreadCount });
}
