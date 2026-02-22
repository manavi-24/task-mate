import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOrCreateConversation } from "@/lib/conversations";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;
    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const otherEmail = String(body?.otherEmail ?? "").trim();
    if (!otherEmail) {
      return NextResponse.json({ error: "Other user required" }, { status: 400 });
    }

    const conversationId = await getOrCreateConversation(userEmail, otherEmail);
    return NextResponse.json({ conversationId });
  } catch (error) {
    console.error("CONVERSATION_GET_OR_CREATE_ERROR", error);
    return NextResponse.json(
      { error: "Failed to get conversation" },
      { status: 500 }
    );
  }
}