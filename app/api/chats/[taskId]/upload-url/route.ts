import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db, storage } from "@/lib/firebaseAdmin";
import { getChatAccessForTask } from "@/lib/chatAuth";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];

export async function POST(
  req: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;
    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId } = await params;
    const access = await getChatAccessForTask(taskId, userEmail);
    if (!access.allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const fileName = String(body?.fileName ?? "").trim();
    const fileType = String(body?.fileType ?? "").trim();
    const fileSize = Number(body?.fileSize ?? 0);

    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: "File metadata required" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(fileType)) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    if (!Number.isFinite(fileSize) || fileSize <= 0 || fileSize > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large" }, { status: 400 });
    }

    const messageId = db
      .collection("chats")
      .doc(taskId)
      .collection("messages")
      .doc().id;

    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const imagePath = `chat-images/${taskId}/${messageId}/${safeName}`;
    const bucketName = process.env.FIREBASE_STORAGE_BUCKET;
    if (!bucketName) {
      return NextResponse.json(
        { error: "Storage bucket not configured" },
        { status: 500 }
      );
    }
    const file = storage.bucket(bucketName).file(imagePath);

    const [uploadUrl] = await file.getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 10 * 60 * 1000,
      contentType: fileType,
    });

    const [publicUrl] = await file.getSignedUrl({
      version: "v4",
      action: "read",
      expires: Date.now() + 1000 * 60 * 60 * 24 * 365,
    });

    return NextResponse.json({
      uploadUrl,
      imageUrl: publicUrl,
      imagePath,
      messageId,
    });
  } catch (error) {
    console.error("CHAT_UPLOAD_URL_ERROR", error);
    return NextResponse.json(
      { error: "Failed to prepare upload" },
      { status: 500 }
    );
  }
}