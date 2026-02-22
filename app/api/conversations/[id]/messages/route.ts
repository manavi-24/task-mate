import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/firebaseAdmin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { assertConversationAccess } from "@/lib/conversations";

const MESSAGE_LIMIT = 50;

type ConversationMessageDoc = {
  senderEmail: string;
  type: "text" | "system" | "image";
  text?: string;
  taskId?: string;
  taskTitle?: string;
  createdAt?: FirebaseFirestore.Timestamp;
};

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;
    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { allowed, convo } = await assertConversationAccess(id, userEmail);
    if (!allowed || !convo) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const url = new URL(req.url);
    const beforeRaw = url.searchParams.get("before");
    const before = beforeRaw ? new Date(beforeRaw) : null;

    let query = db
      .collection("conversations")
      .doc(id)
      .collection("messages")
      .orderBy("createdAt", "desc")
      .limit(MESSAGE_LIMIT);

    if (before && !isNaN(before.getTime())) {
      query = query.where("createdAt", "<", Timestamp.fromDate(before));
    }

    const snap = await query.get();
    const messages = snap.docs
      .map((doc) => {
        const data = doc.data() as ConversationMessageDoc;
        const createdAt = data.createdAt?.toDate
          ? data.createdAt.toDate().toISOString()
          : null;
        return {
          id: doc.id,
          senderEmail: data.senderEmail,
          type: data.type,
          text: data.text ?? null,
          taskId: data.taskId ?? null,
          taskTitle: data.taskTitle ?? null,
          createdAt,
        };
      })
      .reverse();

    await db
      .collection("conversations")
      .doc(id)
      .set(
        {
          lastReadAtBy: {
            [userEmail]: FieldValue.serverTimestamp(),
          },
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

    return NextResponse.json({
      messages,
      participantEmails: convo.participantEmails ?? [],
    });
  } catch (error) {
    console.error("CONVERSATION_MESSAGES_GET_ERROR", error);
    return NextResponse.json(
      { error: "Failed to load messages" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;
    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { allowed, convo } = await assertConversationAccess(id, userEmail);
    if (!allowed || !convo) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const type = body?.type === "system" ? "system" : "text";
    const text = String(body?.text ?? "").trim();
    if (!text) {
      return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
    }

    const convoRef = db.collection("conversations").doc(id);
    const messageRef = convoRef.collection("messages").doc();

    await db.runTransaction(async (tx) => {
      tx.update(convoRef, {
        updatedAt: FieldValue.serverTimestamp(),
        lastMessageText: text,
        lastMessageAt: FieldValue.serverTimestamp(),
        lastMessageSenderEmail: type === "system" ? "system" : userEmail,
      });

      tx.set(messageRef, {
        senderEmail: type === "system" ? "system" : userEmail,
        type,
        text,
        taskId: body?.taskId ?? null,
        taskTitle: body?.taskTitle ?? null,
        createdAt: FieldValue.serverTimestamp(),
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("CONVERSATION_MESSAGES_POST_ERROR", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}