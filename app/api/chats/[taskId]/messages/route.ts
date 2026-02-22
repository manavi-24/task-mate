import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/firebaseAdmin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getChatAccessForTask } from "@/lib/chatAuth";

const MESSAGE_LIMIT = 50;

type ChatMessageDoc = {
  senderEmail: string;
  type: "text" | "image";
  text?: string;
  imageUrl?: string;
  imagePath?: string;
  createdAt?: FirebaseFirestore.Timestamp;
};

export async function GET(
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

    const url = new URL(req.url);
    const afterRaw = url.searchParams.get("after");
    const after = afterRaw ? new Date(afterRaw) : null;

    let query = db
      .collection("chats")
      .doc(taskId)
      .collection("messages")
      .orderBy("createdAt", "desc")
      .limit(MESSAGE_LIMIT);

    if (after && !isNaN(after.getTime())) {
      query = query.where("createdAt", ">", Timestamp.fromDate(after));
    }

    const snap = await query.get();
    const messages = snap.docs
      .map((doc) => {
        const data = doc.data() as ChatMessageDoc;
        const createdAt = data.createdAt?.toDate
          ? data.createdAt.toDate().toISOString()
          : null;
        return {
          id: doc.id,
          senderEmail: data.senderEmail,
          type: data.type,
          text: data.text ?? null,
          imageUrl: data.imageUrl ?? null,
          imagePath: data.imagePath ?? null,
          createdAt,
        };
      })
      .reverse();

    return NextResponse.json({
      messages,
      taskTitle: access.taskTitle,
      creatorEmail: access.creatorEmail,
      acceptorEmail: access.acceptorEmail,
    });
  } catch (error) {
    console.error("CHAT_MESSAGES_GET_ERROR", error);
    return NextResponse.json(
      { error: "Failed to load chat messages" },
      { status: 500 }
    );
  }
}

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
    const type = body?.type === "image" ? "image" : "text";

    const chatRef = db.collection("chats").doc(taskId);
    const messageId = typeof body?.messageId === "string" ? body.messageId : null;
    const messageRef = messageId
      ? chatRef.collection("messages").doc(messageId)
      : chatRef.collection("messages").doc();

    if (type === "text") {
      const text = String(body?.text ?? "").trim();
      if (!text) {
        return NextResponse.json(
          { error: "Message cannot be empty" },
          { status: 400 }
        );
      }

      await db.runTransaction(async (tx) => {
        const chatSnap = await tx.get(chatRef);
        if (!chatSnap.exists) {
          tx.set(chatRef, {
            taskId,
            creatorEmail: access.creatorEmail,
            acceptorEmail: access.acceptorEmail,
            participantEmails: access.participantEmails,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
            lastMessageText: text,
            lastMessageAt: FieldValue.serverTimestamp(),
          });
        } else {
          tx.update(chatRef, {
            updatedAt: FieldValue.serverTimestamp(),
            lastMessageText: text,
            lastMessageAt: FieldValue.serverTimestamp(),
          });
        }

        tx.set(messageRef, {
          senderEmail: userEmail,
          type: "text",
          text,
          createdAt: FieldValue.serverTimestamp(),
        });
      });

      return NextResponse.json({ success: true });
    }

    if (type === "image") {
      const imageUrl = String(body?.imageUrl ?? "").trim();
      const imagePath = String(body?.imagePath ?? "").trim();
      if (!imageUrl || !imagePath) {
        return NextResponse.json(
          { error: "Image data required" },
          { status: 400 }
        );
      }

      await db.runTransaction(async (tx) => {
        const chatSnap = await tx.get(chatRef);
        if (!chatSnap.exists) {
          tx.set(chatRef, {
            taskId,
            creatorEmail: access.creatorEmail,
            acceptorEmail: access.acceptorEmail,
            participantEmails: access.participantEmails,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
            lastMessageText: "📷 Image",
            lastMessageAt: FieldValue.serverTimestamp(),
          });
        } else {
          tx.update(chatRef, {
            updatedAt: FieldValue.serverTimestamp(),
            lastMessageText: "📷 Image",
            lastMessageAt: FieldValue.serverTimestamp(),
          });
        }

        tx.set(messageRef, {
          senderEmail: userEmail,
          type: "image",
          imageUrl,
          imagePath,
          createdAt: FieldValue.serverTimestamp(),
        });
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Unsupported message type" },
      { status: 400 }
    );
  } catch (error) {
    console.error("CHAT_MESSAGES_POST_ERROR", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}