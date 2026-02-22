import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { TaskChatClient } from "@/components/chat/TaskChatClient";

export default async function TaskChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect(`/login?callbackUrl=/tasks/${id}/chat`);
  }

  return <TaskChatClient taskId={id} />;
}