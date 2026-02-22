import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

type NotificationDoc = {
  readAt?: FirebaseFirestore.Timestamp | null;
};

export async function POST() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Mark the most recent notifications as read.
  // We keep it bounded to avoid huge batches.
  const snap = await db
    .collection("users")
    .doc(email)
    .collection("notifications")
    .orderBy("createdAt", "desc")
    .limit(50)
    .get();

  const batch = db.batch();
  let updated = 0;

  for (const doc of snap.docs) {
    const data = doc.data() as NotificationDoc;
    if (data.readAt) continue;
    batch.update(doc.ref, {
      readAt: FieldValue.serverTimestamp(),
    });
    updated += 1;
  }

  if (updated > 0) {
    await batch.commit();
  }

  return NextResponse.json({ success: true, updated });
}
