import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/firebaseAdmin";

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userRef = db.collection("users").doc(session.user.email);
  const userSnap = await userRef.get();
  const createdAt = userSnap.exists
    ? userSnap.get("createdAt") ?? new Date()
    : new Date();

  await userRef.set(
    {
      name: session.user.name ?? null,
      email: session.user.email,
      photoURL: session.user.image ?? null,
      createdAt,
      updatedAt: new Date(),
      lastActive: new Date(),
    },
    { merge: true }
  );

  return NextResponse.json({ success: true });
}
