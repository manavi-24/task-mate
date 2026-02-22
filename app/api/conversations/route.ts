import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/firebaseAdmin";
import { getParticipantKey } from "@/lib/conversations";

type ConversationDoc = {
  participantEmails: string[];
  participantKey?: string;
  lastMessageText?: string | null;
  lastMessageAt?: FirebaseFirestore.Timestamp | null;
  lastMessageSenderEmail?: string | null;
  lastReadAtBy?: Record<string, FirebaseFirestore.Timestamp>;
};

type ConversationSummaryBase = {
  id: string;
  participantEmails: string[];
  participantKey: string;
  lastMessageText: string | null;
  lastMessageAt: string | null;
  lastMessageSenderEmail: string | null;
  lastReadAtBy: Record<string, string>;
};

type ConversationSummary = ConversationSummaryBase & {
  participantProfiles: Array<{
    email: string;
    name: string | null;
    photoURL: string | null;
    lastActive: string | null;
  }>;
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;
    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const snap = await db
      .collection("conversations")
      .where("participantEmails", "array-contains", userEmail)
      .get();

    const rawConversations = snap.docs.map((doc) => {
      const data = doc.data() as ConversationDoc;
      const lastMessageAt = data.lastMessageAt?.toDate
        ? data.lastMessageAt.toDate().toISOString()
        : null;
      const fallbackKey = getParticipantKey(
        data.participantEmails?.[0] ?? "",
        data.participantEmails?.[1] ?? ""
      ).participantKey;
      const participantKey = data.participantKey ?? fallbackKey;
      const readMap: Record<string, string> = {};
      if (data.lastReadAtBy) {
        Object.entries(data.lastReadAtBy).forEach(([email, ts]) => {
          if (ts?.toDate) {
            readMap[email] = ts.toDate().toISOString();
          }
        });
      }
      return {
        id: doc.id,
        participantEmails: data.participantEmails ?? [],
        participantKey,
        lastMessageText: data.lastMessageText ?? null,
        lastMessageAt,
        lastMessageSenderEmail: data.lastMessageSenderEmail ?? null,
        lastReadAtBy: readMap,
      };
    });

    const dedupedMap = new Map<string, ConversationSummaryBase>();
    const duplicateBuckets = new Map<string, ConversationSummaryBase[]>();

    rawConversations.forEach((convo) => {
      const existing = dedupedMap.get(convo.participantKey);
      if (!existing) {
        dedupedMap.set(convo.participantKey, convo);
        return;
      }

      const bucket = duplicateBuckets.get(convo.participantKey) ?? [existing];
      bucket.push(convo);
      duplicateBuckets.set(convo.participantKey, bucket);

      const existingTime = existing.lastMessageAt
        ? Date.parse(existing.lastMessageAt)
        : 0;
      const convoTime = convo.lastMessageAt ? Date.parse(convo.lastMessageAt) : 0;
      if (convoTime > existingTime) {
        dedupedMap.set(convo.participantKey, convo);
      }
    });

    const dedupedConversations = Array.from(dedupedMap.values());

    dedupedConversations.sort((a, b) => {
      const aTime = a.lastMessageAt ? Date.parse(a.lastMessageAt) : 0;
      const bTime = b.lastMessageAt ? Date.parse(b.lastMessageAt) : 0;
      return bTime - aTime;
    });

    const unreadByConversation = dedupedConversations.map((convo) => {
      const lastReadAt = convo.lastReadAtBy[userEmail];
      const lastReadTime = lastReadAt ? Date.parse(lastReadAt) : 0;
      const lastMessageTime = convo.lastMessageAt
        ? Date.parse(convo.lastMessageAt)
        : 0;
      const unread =
        Boolean(convo.lastMessageAt) &&
        convo.lastMessageSenderEmail !== userEmail &&
        lastMessageTime > lastReadTime;
      return { ...convo, unread };
    });

    const participantEmails = Array.from(
      new Set(unreadByConversation.flatMap((convo) => convo.participantEmails))
    );

    const userSnapshots = await Promise.all(
      participantEmails.map(async (email) => {
        const doc = await db.collection("users").doc(email).get();
        if (!doc.exists) {
          return {
            email,
            name: null,
            photoURL: null,
          };
        }
        const data = doc.data() ?? {};
        return {
          email,
          name: (data.name as string | null) ?? null,
          photoURL: (data.photoURL as string | null) ?? null,
          lastActive: data.lastActive?.toDate
            ? data.lastActive.toDate().toISOString()
            : data.lastActive
              ? new Date(data.lastActive).toISOString()
              : null,
        };
      })
    );

    const profileMap = new Map(
      userSnapshots.map((profile) => [profile.email, profile])
    );

    const enrichedConversations = unreadByConversation.map((convo) => ({
      ...convo,
      participantProfiles: convo.participantEmails.map((email) =>
        profileMap.get(email) ?? {
          email,
          name: null,
          photoURL: null,
          lastActive: null,
        }
      ),
    }));

    const totalUnreadConversationsCount = unreadByConversation.filter(
      (convo) => convo.unread
    ).length;

    const cleanupPromises = Array.from(duplicateBuckets.entries()).map(
      async ([participantKey, bucket]) => {
        const canonical = dedupedMap.get(participantKey);
        if (!canonical || canonical.id === participantKey) {
          return;
        }

        const canonicalRef = db.collection("conversations").doc(participantKey);
        const canonicalSnap = await canonicalRef.get();
        if (!canonicalSnap.exists) {
          await canonicalRef.set({
            participantKey,
            participantEmails: canonical.participantEmails,
            lastMessageText: canonical.lastMessageText,
            lastMessageAt: canonical.lastMessageAt
              ? new Date(canonical.lastMessageAt)
              : null,
            lastMessageSenderEmail: canonical.lastMessageSenderEmail ?? null,
            lastReadAtBy: canonical.lastReadAtBy ?? {},
            updatedAt: new Date(),
            createdAt: new Date(),
          });
        }

        const extras = bucket.filter((item) => item.id !== participantKey);
        if (extras.length === 0) {
          return;
        }

        await Promise.all(
          extras.map(async (extra) => {
            const messagesSnap = await db
              .collection("conversations")
              .doc(extra.id)
              .collection("messages")
              .get();

            if (messagesSnap.empty) return;

            const batch = db.batch();
            messagesSnap.docs.forEach((doc) => {
              batch.set(
                canonicalRef.collection("messages").doc(doc.id),
                doc.data(),
                { merge: true }
              );
            });
            await batch.commit();
          })
        );
      }
    );

    await Promise.all(cleanupPromises);

    console.info(
      "CONVERSATIONS_INDEX_HINT: Create a composite index on participantEmails (array-contains) + lastMessageAt (desc) for faster sorting."
    );

    return NextResponse.json({
      conversations: enrichedConversations,
      totalUnreadConversationsCount,
    });
  } catch (error) {
    console.error("CONVERSATIONS_LIST_ERROR", error);
    return NextResponse.json(
      { error: "Failed to load conversations" },
      { status: 500 }
    );
  }
}