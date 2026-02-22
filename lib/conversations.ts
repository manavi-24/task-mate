import { FieldValue } from "firebase-admin/firestore";
import { db } from "@/lib/firebaseAdmin";

export type ConversationRecord = {
  participantEmails: string[];
  participantKey: string;
  createdAt?: FirebaseFirestore.Timestamp;
  updatedAt?: FirebaseFirestore.Timestamp;
  lastMessageText?: string | null;
  lastMessageAt?: FirebaseFirestore.Timestamp | null;
  lastMessageSenderEmail?: string | null;
  lastReadAtBy?: Record<string, FirebaseFirestore.Timestamp>;
};

export function getParticipantKey(emailA: string, emailB: string) {
  const sorted = [emailA, emailB].map((e) => e.toLowerCase()).sort();
  return {
    participantKey: `${sorted[0]}__${sorted[1]}`,
    participantEmails: sorted,
  };
}

export async function getOrCreateConversation(emailA: string, emailB: string) {
  const { participantKey, participantEmails } = getParticipantKey(emailA, emailB);
  const convoRef = db.collection("conversations").doc(participantKey);

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(convoRef);
    if (snap.exists) {
      return;
    }

    tx.set(convoRef, {
      participantEmails,
      participantKey,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      lastMessageText: null,
      lastMessageAt: null,
      lastMessageSenderEmail: null,
      lastReadAtBy: {},
    });
  });

  return convoRef.id;
}

export async function assertConversationAccess(
  conversationId: string,
  userEmail: string
) {
  const convoSnap = await db.collection("conversations").doc(conversationId).get();
  if (!convoSnap.exists) {
    return { allowed: false, convo: null };
  }

  const convo = convoSnap.data() as ConversationRecord;
  const allowed = convo.participantEmails?.includes(userEmail);
  return { allowed, convo };
}

export async function createSystemMessage({
  conversationId,
  text,
  taskId,
  taskTitle,
}: {
  conversationId: string;
  text: string;
  taskId?: string | null;
  taskTitle?: string | null;
}) {
  const convoRef = db.collection("conversations").doc(conversationId);
  const messageRef = convoRef.collection("messages").doc();

  await db.runTransaction(async (tx) => {
    tx.update(convoRef, {
      updatedAt: FieldValue.serverTimestamp(),
      lastMessageText: text,
      lastMessageAt: FieldValue.serverTimestamp(),
      lastMessageSenderEmail: "system",
    });

    tx.set(messageRef, {
      senderEmail: "system",
      type: "system",
      text,
      taskId: taskId ?? null,
      taskTitle: taskTitle ?? null,
      createdAt: FieldValue.serverTimestamp(),
    });
  });
}