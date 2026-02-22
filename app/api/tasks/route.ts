import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/firebaseAdmin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";

const ALLOWED_CATEGORIES = new Set([
  "cooking",
  "cleaning",
  "drying",
  "academics",
  "others",
]);

const MAX_TITLE_LENGTH = 80;
const MAX_DESCRIPTION_LENGTH = 1500;

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
    deadline, // ISO datetime string (optional)
  } = body;

  // 3️⃣ Server-side validation
  const normalizedTitle = String(title ?? "").trim();
  const normalizedDescription = String(description ?? "").trim();
  const normalizedCategory = String(category ?? "").trim();
  const normalizedHostel = String(hostel ?? "").trim();
  const normalizedRoomNumber = String(roomNumber ?? "").trim();

  if (!normalizedTitle || !normalizedDescription) {
    return NextResponse.json(
      { error: "Title and description are required" },
      { status: 400 }
    );
  }

  if (normalizedTitle.length < 4 || normalizedTitle.length > MAX_TITLE_LENGTH) {
    return NextResponse.json(
      {
        error: `Title must be between 4 and ${MAX_TITLE_LENGTH} characters`,
      },
      { status: 400 }
    );
  }

  if (
    normalizedDescription.length < 10 ||
    normalizedDescription.length > MAX_DESCRIPTION_LENGTH
  ) {
    return NextResponse.json(
      {
        error: `Description must be between 10 and ${MAX_DESCRIPTION_LENGTH} characters`,
      },
      { status: 400 }
    );
  }

  if (!normalizedCategory) {
    return NextResponse.json(
      { error: "Category is required" },
      { status: 400 }
    );
  }

  // We store the resolved category string directly, but we still want
  // to prevent accidental garbage values.
  // Allow the known categories OR any non-empty custom string (for "Other").
  if (ALLOWED_CATEGORIES.has(normalizedCategory) === false && normalizedCategory.length < 2) {
    return NextResponse.json(
      { error: "Invalid category" },
      { status: 400 }
    );
  }

  if (!normalizedHostel || normalizedHostel.length < 2) {
    return NextResponse.json(
      { error: "Hostel is required" },
      { status: 400 }
    );
  }

  if (!normalizedRoomNumber) {
    return NextResponse.json(
      { error: "Room number is required" },
      { status: 400 }
    );
  }

  if (typeof price !== "number" || !Number.isFinite(price) || price <= 0) {
    return NextResponse.json(
      { error: "Price must be a number greater than 0" },
      { status: 400 }
    );
  }

  // Deadline is optional
  let deadlineTimestamp: Timestamp | null = null;
  if (deadline) {
    const parsedDeadline = new Date(String(deadline));
    if (isNaN(parsedDeadline.getTime())) {
      return NextResponse.json(
        { error: "Invalid deadline format" },
        { status: 400 }
      );
    }
    if (parsedDeadline.getTime() <= Date.now()) {
      return NextResponse.json(
        { error: "Deadline must be in the future" },
        { status: 400 }
      );
    }
    deadlineTimestamp = Timestamp.fromDate(parsedDeadline);
  }

  // 4️⃣ Create task
  const docRef = await db.collection("tasks").add({
    title: normalizedTitle,
    description: normalizedDescription,
    price,
    category: normalizedCategory,

    hostel: normalizedHostel,
    roomNumber: normalizedRoomNumber,
    deadline: deadlineTimestamp,

    // Keep existing storage value for now (UI will label it as "Posted")
    status: "open",

    createdBy: {
      name: session.user.name,
      email: session.user.email,
      photoURL: session.user.image ?? null,
    },

    // Payment defaults
    paymentStatus: "pending",
    paymentMethod: null,

    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ success: true, id: docRef.id });
}
