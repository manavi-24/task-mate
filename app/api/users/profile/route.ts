import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const email = url.searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const doc = await db.collection("users").doc(email).get();
  if (!doc.exists) {
    return NextResponse.json({
      email,
      name: null,
      photoURL: null,
      lastActive: null,
    });
  }

  const data = doc.data() ?? {};
  const lastActive = data.lastActive?.toDate
    ? data.lastActive.toDate().toISOString()
    : data.lastActive
      ? new Date(data.lastActive).toISOString()
      : null;

  return NextResponse.json({
    email,
    name: (data.name as string | null) ?? null,
    photoURL: (data.photoURL as string | null) ?? null,
    lastActive,
  });
}