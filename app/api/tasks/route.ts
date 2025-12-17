import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  // 1️⃣ Auth check
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // 2️⃣ Read body
  const body = await req.json();
  const {
    title,
    description,
    price,
    category,
    hostel,
    roomNumber,
    deadline, // ISO datetime string (mandatory)
  } = body;

  // 3️⃣ Server-side validation
  if (
    !title ||
    !description ||
    !category ||
    !hostel ||
    !roomNumber ||
    !deadline ||
    typeof price !== "number" ||
    price <= 0
  ) {
    return NextResponse.json(
      { error: "Invalid input" },
      { status: 400 }
    );
  }

  const parsedDeadline = new Date(deadline);

  if (isNaN(parsedDeadline.getTime())) {
    return NextResponse.json(
      { error: "Invalid deadline format" },
      { status: 400 }
    );
  }

  // 4️⃣ Create task
  await db.collection("tasks").add({
    title,
    description,
    price,
    category,

    hostel,
    roomNumber,
    deadline: parsedDeadline,

    status: "open",

    createdBy: {
      name: session.user.name,
      email: session.user.email,
      photoURL: session.user.image ?? null,
    },

    createdAt: new Date(),
  });

  return NextResponse.json({ success: true });
}
