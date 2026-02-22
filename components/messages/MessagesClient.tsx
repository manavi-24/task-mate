"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { initNotificationSound, playNotificationSound } from "@/lib/notificationSound";

type ConversationSummary = {
  id: string;
  participantEmails: string[];
  participantKey?: string;
  participantProfiles?: Array<{
    email: string;
    name: string | null;
    photoURL: string | null;
    lastActive?: string | null;
  }>;
  lastMessageText: string | null;
  lastMessageAt: string | null;
  lastMessageSenderEmail: string | null;
  unread?: boolean;
};

type MessageItem = {
  id: string;
  senderEmail: string;
  type: "text" | "system" | "image";
  text: string | null;
  taskId: string | null;
  taskTitle: string | null;
  createdAt: string | null;
  status?: "sending" | "failed" | "sent";
};

export function MessagesClient({
  withEmail,
  taskId,
}: {
  withEmail: string;
  taskId: string;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const me = session?.user?.email ?? "";
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [now, setNow] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const pollRef = useRef<number | null>(null);
  const lastMessageAtRef = useRef<string | null>(null);
  const initialLoadRef = useRef(true);
  const userScrolledUpRef = useRef(false);
  const prevScrollHeightRef = useRef(0);
  const prevScrollTopRef = useRef(0);

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.id === selectedId) ?? null,
    [conversations, selectedId]
  );

  const otherParticipant = useMemo(() => {
    if (!selectedConversation) return "";
    return (
      selectedConversation.participantEmails.find((email) => email !== me) ?? ""
    );
  }, [selectedConversation, me]);

  const otherParticipantProfile = useMemo(() => {
    if (!selectedConversation) return null;
    return (
      selectedConversation.participantProfiles?.find(
        (profile) => profile.email !== me
      ) ?? null
    );
  }, [selectedConversation, me]);

  const otherDisplayName =
    otherParticipantProfile?.name ?? otherParticipant.split("@")[0] ?? "";

  const otherInitial = otherDisplayName
    ? otherDisplayName.slice(0, 1).toUpperCase()
    : "U";

  function getStatusMeta(lastActive: string | null | undefined) {
    if (now === null) {
      return { label: "Offline", color: "bg-white/35" };
    }
    if (!lastActive) {
      return { label: "Offline", color: "bg-white/35" };
    }
    const last = Date.parse(lastActive);
    if (Number.isNaN(last)) {
      return { label: "Offline", color: "bg-white/35" };
    }
    const diffMs = now - last;
    const diffMinutes = diffMs / 60000;
    if (diffMinutes <= 2) {
      return { label: "Online", color: "bg-emerald-400" };
    }
    if (diffMinutes <= 15) {
      return { label: "Away", color: "bg-amber-300" };
    }
    return { label: "Offline", color: "bg-white/35" };
  }

  async function loadConversations() {
    try {
      const res = await fetch("/api/conversations");
      const raw = await res.text();
      const data = raw ? JSON.parse(raw) : { conversations: [] };
      if (!res.ok) throw new Error(data.error || "Failed to load conversations");
      setConversations(data.conversations ?? []);
      setLoadingConvos(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load conversations");
      setLoadingConvos(false);
    }
  }

  async function loadMessages(
    conversationId: string,
    { silent = false }: { silent?: boolean } = {}
  ) {
    try {
      if (!silent) {
        setLoadingMessages(true);
      }
      const res = await fetch(`/api/conversations/${conversationId}/messages`);
      const raw = await res.text();
      const data = raw ? JSON.parse(raw) : { messages: [] };
      if (!res.ok) throw new Error(data.error || "Failed to load messages");
      setMessages((prev) => {
        const incoming = data.messages ?? [];
        if (prev.length === 0) return incoming;
        const map = new Map(prev.map((msg) => [msg.id, msg]));
        incoming.forEach((msg: MessageItem) => {
          map.set(msg.id, { ...map.get(msg.id), ...msg, status: "sent" });
        });
        return Array.from(map.values()).sort((a, b) => {
          const aTime = a.createdAt ? Date.parse(a.createdAt) : 0;
          const bTime = b.createdAt ? Date.parse(b.createdAt) : 0;
          return aTime - bTime;
        });
      });
      if (!silent) {
        setLoadingMessages(false);
      }
      if (data.messages && data.messages.length > 0) {
        const latest = data.messages[data.messages.length - 1];
        const latestTime = latest?.createdAt ?? null;
        const isFromOther = latest?.senderEmail && latest.senderEmail !== me;
        if (!initialLoadRef.current && latestTime && latestTime !== lastMessageAtRef.current && isFromOther) {
          playNotificationSound();
        }
        lastMessageAtRef.current = latestTime;
        if (latestTime) initialLoadRef.current = false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load messages");
      if (!silent) {
        setLoadingMessages(false);
      }
    }
  }

  async function ensureConversationForEmail() {
    if (!withEmail || !me) return;
    try {
      const res = await fetch("/api/conversations/get-or-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otherEmail: withEmail }),
      });
      const raw = await res.text();
      const data = raw ? JSON.parse(raw) : {};
      if (!res.ok) throw new Error(data.error || "Failed to open conversation");
      setSelectedId(data.conversationId);
      router.replace(withEmail ? `/messages?with=${encodeURIComponent(withEmail)}` : "/messages");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to open conversation");
    }
  }

  useEffect(() => {
    initNotificationSound();
    loadConversations();
  }, []);

  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 60000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(loadConversations, 60000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let active = true;
    async function ping() {
      try {
        await fetch("/api/users/last-active", { method: "POST" });
      } catch {
        // ignore
      }
    }
    if (active) {
      ping();
      const timer = window.setInterval(ping, 60000);
      return () => {
        active = false;
        window.clearInterval(timer);
      };
    }
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!withEmail) return;
    ensureConversationForEmail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [withEmail]);

  useEffect(() => {
    if (!selectedId) return;
    initialLoadRef.current = true;
    userScrolledUpRef.current = false;
    loadMessages(selectedId);
    if (pollRef.current) window.clearInterval(pollRef.current);
    pollRef.current = window.setInterval(() => {
      loadMessages(selectedId, { silent: true });
    }, 2500);
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
  }, [selectedId]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const threshold = 80;
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    const isNearBottom = distanceFromBottom < threshold;

    if (isNearBottom) {
      userScrolledUpRef.current = false;
    }

    if (initialLoadRef.current || (!userScrolledUpRef.current && isNearBottom)) {
      container.scrollTop = container.scrollHeight;
    } else {
      const prevHeight = prevScrollHeightRef.current;
      const prevTop = prevScrollTopRef.current;
      const nextHeight = container.scrollHeight;
      if (prevHeight && nextHeight > prevHeight) {
        container.scrollTop = prevTop + (nextHeight - prevHeight);
      }
    }

    prevScrollHeightRef.current = container.scrollHeight;
  }, [messages]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const threshold = 80;
    const onScroll = () => {
      const distanceFromBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight;
      userScrolledUpRef.current = distanceFromBottom > threshold;
      prevScrollTopRef.current = container.scrollTop;
      prevScrollHeightRef.current = container.scrollHeight;
    };
    container.addEventListener("scroll", onScroll);
    onScroll();
    return () => container.removeEventListener("scroll", onScroll);
  }, []);

  async function sendMessage() {
    if (!selectedId) return;
    const messageText = text.trim();
    if (!messageText) return;
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: MessageItem = {
      id: tempId,
      senderEmail: me,
      type: "text",
      text: messageText,
      taskId: taskId || null,
      taskTitle: null,
      createdAt: new Date().toISOString(),
      status: "sending",
    };
    userScrolledUpRef.current = false;
    setMessages((prev) => [...prev, optimisticMessage]);
    setSending(true);
    try {
      const res = await fetch(`/api/conversations/${selectedId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "text",
          text: messageText,
          taskId: taskId || null,
        }),
      });
      const raw = await res.text();
      const data = raw ? JSON.parse(raw) : {};
      if (!res.ok) throw new Error(data.error || "Failed to send");
      setText("");
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      loadMessages(selectedId);
      loadConversations();
    } catch (err) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId ? { ...msg, status: "failed" } : msg
        )
      );
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  }

  async function retryMessage(message: MessageItem) {
    if (!selectedId) return;
    if (!message.text) return;
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === message.id ? { ...msg, status: "sending" } : msg
      )
    );
    try {
      const res = await fetch(`/api/conversations/${selectedId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "text",
          text: message.text,
          taskId: message.taskId ?? null,
        }),
      });
      const raw = await res.text();
      const data = raw ? JSON.parse(raw) : {};
      if (!res.ok) throw new Error(data.error || "Failed to send");
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === message.id ? { ...msg, status: "sent" } : msg
        )
      );
      loadMessages(selectedId);
      loadConversations();
    } catch (err) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === message.id ? { ...msg, status: "failed" } : msg
        )
      );
      setError(err instanceof Error ? err.message : "Failed to send message");
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Card className="h-[75vh] overflow-hidden">
          <div className="border-b border-white/10 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-white/40">Messages</p>
            <h2 className="text-lg font-semibold text-white">Inbox</h2>
          </div>
          <div className="h-full overflow-y-auto px-2 py-3">
            {loadingConvos ? (
              <div className="px-3 text-sm text-white/50">Loading…</div>
            ) : conversations.length === 0 ? (
              <div className="px-3 text-sm text-white/50">
                No conversations yet.
              </div>
            ) : (
              conversations.map((convo) => {
                const other =
                  convo.participantProfiles?.find((profile) => profile.email !== me) ??
                  null;
                const otherName = other?.name ??
                  (convo.participantEmails.find((e) => e !== me) ?? "Unknown").split("@")[0];
                const otherInitial = otherName.slice(0, 1).toUpperCase();
                const active = convo.id === selectedId;
                const status = getStatusMeta(other?.lastActive ?? null);
                const timeLabel = convo.lastMessageAt
                  ? new Date(convo.lastMessageAt).toLocaleTimeString("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "";
                return (
                  <button
                    key={convo.id}
                    type="button"
                    onClick={() => setSelectedId(convo.id)}
                    className={
                      "w-full rounded-2xl px-3 py-3 text-left transition " +
                      (active
                        ? "bg-white/10 text-white"
                        : "text-white/70 hover:bg-white/5")
                    }
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/5 text-xs font-semibold text-white/70">
                          {other?.photoURL ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={other.photoURL}
                              alt={otherName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            otherInitial
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-white">
                              {otherName}
                            </p>
                            <span
                              className={`h-2 w-2 rounded-full ${status.color}`}
                              aria-hidden="true"
                            />
                            <span className="text-[10px] uppercase tracking-wide text-white/40">
                              {status.label}
                            </span>
                          </div>
                          <p className="mt-1 line-clamp-1 text-xs text-white/50">
                            {convo.lastMessageText ?? "Start chatting"}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-shrink-0 items-center gap-2 text-[10px] text-white/40">
                        {convo.unread ? (
                          <span className="h-2 w-2 rounded-full bg-rose-400" />
                        ) : null}
                        {timeLabel}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </Card>

        <Card className="flex h-[75vh] flex-col overflow-hidden">
          <div className="border-b border-white/10 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-white/40">
              Conversation
            </p>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/5 text-sm font-semibold text-white/70">
                {otherParticipantProfile?.photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={otherParticipantProfile.photoURL}
                    alt={otherDisplayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  otherInitial
                )}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {otherDisplayName || "Select a chat"}
                </h2>
                {otherParticipantProfile ? (
                  <div className="mt-1 flex items-center gap-2 text-xs text-white/50">
                    <span
                      className={`h-2 w-2 rounded-full ${getStatusMeta(otherParticipantProfile.lastActive).color}`}
                      aria-hidden="true"
                    />
                    <span>{getStatusMeta(otherParticipantProfile.lastActive).label}</span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {loadingMessages ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={`skeleton-${index}`}
                    className="h-4 w-2/3 rounded-full bg-white/5"
                  />
                ))}
              </div>
            ) : messages.length === 0 ? (
              <div className="text-sm text-white/50">
                No messages yet. Start the conversation.
              </div>
            ) : (
              messages.map((msg) => {
                if (msg.type === "system") {
                  return (
                    <div key={msg.id} className="text-center text-xs text-white/45">
                      {msg.text}
                    </div>
                  );
                }
                const mine = msg.senderEmail === me;
                const statusLabel =
                  msg.status === "sending"
                    ? "Sending…"
                    : msg.status === "failed"
                      ? "Failed"
                      : null;
                return (
                  <div key={msg.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={
                        "max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm " +
                        (mine
                          ? "bg-indigo-500/80 text-white"
                          : "bg-white/10 text-white/90")
                      }
                    >
                      <p>{msg.text}</p>
                      {msg.taskTitle ? (
                        <p className="mt-1 text-[10px] text-white/60">
                          Regarding: {msg.taskTitle}
                        </p>
                      ) : null}
                      {msg.createdAt ? (
                        <p className="mt-1 text-[10px] text-white/50">
                          {new Date(msg.createdAt).toLocaleTimeString("en-GB", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      ) : null}
                      {statusLabel ? (
                        <div className="mt-1 flex items-center gap-2 text-[10px] text-white/60">
                          <span>{statusLabel}</span>
                          {msg.status === "failed" ? (
                            <button
                              type="button"
                              onClick={() => retryMessage(msg)}
                              className="text-[10px] font-semibold text-rose-200 hover:text-rose-100"
                            >
                              Retry
                            </button>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {error ? (
            <div className="border-t border-white/10 px-4 py-2 text-xs text-rose-200">
              {error}
            </div>
          ) : null}

          <div className="border-t border-white/10 bg-white/5 px-4 py-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Input
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="Type a message…"
                className="flex-1"
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <Button loading={sending} onClick={sendMessage}>
                Send
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}