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

    // 📍 NEW: location details
    hostel: data.hostel,
    roomNumber: data.roomNumber,

    // 👤 users
    createdBy: {
      name: data.createdBy?.name ?? null,
      email: data.createdBy?.email ?? null,
      photoURL: data.createdBy?.photoURL ?? null,
    },

    acceptedBy: data.acceptedBy ?? null,

    // 🕒 lifecycle timestamps
    createdAt: serializeTimestamp(data.createdAt),
    acceptedAt: serializeTimestamp(data.acceptedAt),
    startedAt: serializeTimestamp(data.startedAt),
    completedAt: serializeTimestamp(data.completedAt),
    closedAt: serializeTimestamp(data.closedAt),

    // ⏰ deadline
    deadline: serializeTimestamp(data.deadline),

    // 💰 payment
    paymentStatus: data.paymentStatus ?? "pending",
    paymentMethod: data.paymentMethod ?? null,
    paidAt: serializeTimestamp(data.paidAt),
    paymentConfirmedAt: serializeTimestamp(data.paymentConfirmedAt),
  };
}
