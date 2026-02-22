import { FieldValue } from "firebase-admin/firestore";
import { db } from "@/lib/firebaseAdmin";

type NotificationPayload = {
  toEmail: string;
  type: string;
  title: string;
  message: string;
  taskId: string;
  ctaUrl?: string | null;
};

export async function addUserNotification({
  toEmail,
  type,
  title,
  message,
  taskId,
  ctaUrl,
}: NotificationPayload) {
  const targetUrl = ctaUrl ?? `/dashboard?focus=${encodeURIComponent(taskId)}`;
  await db
    .collection("users")
    .doc(toEmail)
    .collection("notifications")
    .add({
      type,
      title,
      message,
      taskId,
      ctaUrl: targetUrl,
      createdAt: FieldValue.serverTimestamp(),
      readAt: null,
    });
}