import { Timestamp } from "firebase-admin/firestore";

export function serializeTask(
  doc: FirebaseFirestore.QueryDocumentSnapshot
) {
  const data = doc.data();

  const serializeTimestamp = (ts?: Timestamp) =>
    ts ? ts.toDate().toISOString() : null;

  return {
    id: doc.id,

    // primitive fields
    title: data.title,
    description: data.description,
    price: data.price,
    category: data.category,
    status: data.status,

    // nested objects
    createdBy: data.createdBy,
    acceptedBy: data.acceptedBy ?? null,

    // lifecycle timestamps
    createdAt: serializeTimestamp(data.createdAt),
    acceptedAt: serializeTimestamp(data.acceptedAt),
    startedAt: serializeTimestamp(data.startedAt),
    completedAt: serializeTimestamp(data.completedAt),
    closedAt: serializeTimestamp(data.closedAt),

    // deadline
    deadline: serializeTimestamp(data.deadline),

    // 🔥 PAYMENT FIELDS (THIS FIXES YOUR ISSUE)
    paymentStatus: data.paymentStatus ?? "pending",
    paymentMethod: data.paymentMethod ?? null,
    paidAt: serializeTimestamp(data.paidAt),
    paymentConfirmedAt: serializeTimestamp(data.paymentConfirmedAt),
  };
}
