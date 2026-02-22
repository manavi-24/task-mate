import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { FieldValue } from "firebase-admin/firestore";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/firebaseAdmin";

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userRef = db.collection("users").doc(session.user.email);

  await userRef.set(
    {
      lastActive: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  return NextResponse.json({ success: true });
}