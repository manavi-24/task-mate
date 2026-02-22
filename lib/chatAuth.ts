import { db } from "@/lib/firebaseAdmin";

type ChatAccessResult = {
  allowed: boolean;
  creatorEmail: string | null;
  acceptorEmail: string | null;
  taskTitle: string | null;
  participantEmails: string[];
};

export async function getChatAccessForTask(
  taskId: string,
  userEmail: string
): Promise<ChatAccessResult> {
  const taskSnap = await db.collection("tasks").doc(taskId).get();
  if (!taskSnap.exists) {
    return {
      allowed: false,
      creatorEmail: null,
      acceptorEmail: null,
      taskTitle: null,
      participantEmails: [],
    };
  }

  const task = taskSnap.data();
  const creatorEmail = task?.createdBy?.email ?? null;
  const acceptorEmail = task?.acceptedBy?.email ?? null;
  const taskTitle = task?.title ?? null;
  const status = task?.status ?? null;

  const participantEmails = [creatorEmail, acceptorEmail].filter(
    (value): value is string => Boolean(value)
  );

  const allowed =
    status !== "open" &&
    participantEmails.length === 2 &&
    participantEmails.includes(userEmail);

  return {
    allowed,
    creatorEmail,
    acceptorEmail,
    taskTitle,
    participantEmails,
  };
}