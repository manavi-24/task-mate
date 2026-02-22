import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { MessagesClient } from "@/components/messages/MessagesClient";

export default async function MessagesPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/get-started?callback=%2Fmessages");
  }

  const resolved = (await searchParams) ?? {};
  const withEmail = typeof resolved.with === "string" ? resolved.with : "";
  const taskId = typeof resolved.taskId === "string" ? resolved.taskId : "";

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] [background-size:24px_24px]" />
      </div>

      <div className="relative">
        <MessagesClient withEmail={withEmail} taskId={taskId} />
      </div>
    </div>
  );
}