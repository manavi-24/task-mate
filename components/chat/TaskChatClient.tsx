"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { initNotificationSound, playNotificationSound } from "@/lib/notificationSound";

type ChatMessage = {
  id: string;
  senderEmail: string;
  type: "text" | "image";
  text: string | null;
  imageUrl: string | null;
  createdAt: string | null;
};

type ChatPayload = {
  messages: ChatMessage[];
  taskTitle: string | null;
  creatorEmail: string | null;
  acceptorEmail: string | null;
};

type UserProfile = {
  email: string;
  name: string | null;
  photoURL: string | null;
  lastActive: string | null;
};

export function TaskChatClient({ taskId }: { taskId?: string }) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [taskTitle, setTaskTitle] = useState<string | null>(null);
  const [creatorEmail, setCreatorEmail] = useState<string | null>(null);
  const [acceptorEmail, setAcceptorEmail] = useState<string | null>(null);
  const [otherProfile, setOtherProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [now, setNow] = useState<number | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageModal, setImageModal] = useState<string | null>(null);
  const [lastSeen, setLastSeen] = useState<string | null>(null);
  const lastSeenRef = useRef<string | null>(null);
  const initialLoadRef = useRef(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const isAtBottomRef = useRef(true);
  const userScrolledUpRef = useRef(false);
  const prevScrollHeightRef = useRef(0);
  const prevScrollTopRef = useRef(0);

  const me = session?.user?.email ?? null;

  const participantsLabel = useMemo(() => {
    if (!creatorEmail || !acceptorEmail || !me) return "";
    const other = me === creatorEmail ? acceptorEmail : creatorEmail;
    return `Chat with ${other.split("@")[0]}`;
  }, [creatorEmail, acceptorEmail, me]);

  const otherEmail = useMemo(() => {
    if (!creatorEmail || !acceptorEmail || !me) return null;
    return me === creatorEmail ? acceptorEmail : creatorEmail;
  }, [creatorEmail, acceptorEmail, me]);

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

  useEffect(() => {
    async function ping() {
      try {
        await fetch("/api/users/last-active", { method: "POST" });
      } catch {
        // ignore
      }
    }
    ping();
    const timer = window.setInterval(ping, 60000);
    return () => {
      if (timer) window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 60000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!otherEmail) return;
    let mounted = true;
    async function loadProfile() {
      try {
        const res = await fetch(
          `/api/users/profile?email=${encodeURIComponent(otherEmail ?? "")}`
        );
        const data = await res.json();
        if (!mounted) return;
        setOtherProfile({
          email: data.email ?? otherEmail,
          name: data.name ?? null,
          photoURL: data.photoURL ?? null,
          lastActive: data.lastActive ?? null,
        });
      } catch {
        if (!mounted) return;
        setOtherProfile(null);
      }
    }
    loadProfile();
    const timer = window.setInterval(loadProfile, 60000);
    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, [otherEmail]);

  async function fetchMessages(nextAfter?: string | null) {
    if (!taskId) {
      setError("Missing task id for chat.");
      setLoading(false);
      return;
    }
    try {
      const url = new URL(`/api/chats/${taskId}/messages`, window.location.origin);
      if (nextAfter) url.searchParams.set("after", nextAfter);
      const res = await fetch(url.toString());
      const raw = await res.text();
      const data = (raw ? JSON.parse(raw) : {}) as ChatPayload;
      if (!res.ok) {
        throw new Error((data as { error?: string }).error ?? "Failed to load chat");
      }

      setTaskTitle(data.taskTitle ?? null);
      setCreatorEmail(data.creatorEmail ?? null);
      setAcceptorEmail(data.acceptorEmail ?? null);

      setMessages((prev) => {
        if (!nextAfter) return data.messages;
        if (!data.messages.length) return prev;
        const ids = new Set(prev.map((m) => m.id));
        const merged = [...prev];
        let added = false;
        for (const msg of data.messages) {
          if (!ids.has(msg.id)) {
            merged.push(msg);
            added = true;
          }
        }
        return added ? merged : prev;
      });

      const latest = data.messages.at(-1) ?? null;
      const latestTime = latest?.createdAt ?? null;
      if (latestTime) {
        if (!initialLoadRef.current && latestTime !== lastSeenRef.current && latest?.senderEmail !== me) {
          playNotificationSound();
        }
        setLastSeen(latestTime);
        lastSeenRef.current = latestTime;
        initialLoadRef.current = false;
      }
      setLoading(false);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load chat";
      setError(message);
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!taskId) return;
    initNotificationSound();
    fetchMessages();
    const poll = window.setInterval(() => {
      fetchMessages(lastSeenRef.current);
    }, 2500);
    return () => window.clearInterval(poll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const threshold = 80;
    const onScroll = () => {
      const distanceFromBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight;
      isAtBottomRef.current = distanceFromBottom < threshold;
      userScrolledUpRef.current = distanceFromBottom > threshold;
      prevScrollTopRef.current = container.scrollTop;
      prevScrollHeightRef.current = container.scrollHeight;
    };
    container.addEventListener("scroll", onScroll);
    onScroll();
    return () => container.removeEventListener("scroll", onScroll);
  }, []);

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

  async function sendMessage() {
    if (!taskId) {
      setError("Missing task id for chat.");
      return;
    }
    const messageText = text.trim();
    if (!messageText) return;
    setSending(true);
    userScrolledUpRef.current = false;
    try {
      const res = await fetch(`/api/chats/${taskId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "text", text: messageText }),
      });
      const raw = await res.text();
      const data = raw ? JSON.parse(raw) : {};
      if (!res.ok) {
        throw new Error(data.error || "Failed to send message");
      }
      setText("");
      fetchMessages(lastSeen);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send";
      setError(message);
    } finally {
      setSending(false);
    }
  }

  function onPickImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;
    setError(null);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function sendImage() {
    if (!taskId) {
      setError("Missing task id for chat.");
      return;
    }
    if (!imageFile) return;
    setSending(true);
    try {
      const res = await fetch(`/api/chats/${taskId}/upload-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: imageFile.name,
          fileType: imageFile.type,
          fileSize: imageFile.size,
        }),
      });
      const raw = await res.text();
      const data = raw ? JSON.parse(raw) : {};
      if (!res.ok) {
        throw new Error(data.error || "Failed to prepare upload");
      }

      const uploadRes = await fetch(data.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": imageFile.type },
        body: imageFile,
      });
      if (!uploadRes.ok) {
        throw new Error("Upload failed");
      }

      const messageRes = await fetch(`/api/chats/${taskId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "image",
          imageUrl: data.imageUrl,
          imagePath: data.imagePath,
          messageId: data.messageId,
        }),
      });
      const messageRaw = await messageRes.text();
      const messageData = messageRaw ? JSON.parse(messageRaw) : {};
      if (!messageRes.ok) {
        throw new Error(messageData.error || "Failed to send image");
      }

      setImageFile(null);
      setImagePreview(null);
      fetchMessages(lastSeen);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send image";
      setError(message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4 py-6">
      <Card className="p-4 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/40">Task chat</p>
            <h1 className="text-lg font-semibold text-white">
              {taskTitle ?? "Task chat"}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-white/50">
              <span>{participantsLabel}</span>
              {otherProfile ? (
                <span className="flex items-center gap-2 text-xs text-white/60">
                  <span
                    className={`h-2 w-2 rounded-full ${getStatusMeta(otherProfile.lastActive).color}`}
                    aria-hidden="true"
                  />
                  {getStatusMeta(otherProfile.lastActive).label}
                </span>
              ) : null}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              aria-label="Close chat"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-lg text-white/70 transition hover:text-white"
            >
              &times;
            </Link>
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
              Real-time (polling)
            </div>
          </div>
        </div>
      </Card>

      <Card className="flex h-[60vh] flex-col overflow-hidden">
        <div
          ref={scrollRef}
          className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
        >
          {loading ? (
            <div className="text-sm text-white/50">Loading messages…</div>
          ) : messages.length === 0 ? (
            <div className="text-sm text-white/50">
              No messages yet. Say hello!
            </div>
          ) : (
            messages.map((msg) => {
              const mine = msg.senderEmail === me;
              return (
                <div
                  key={msg.id}
                  className={`flex ${mine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={
                      "max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm " +
                      (mine
                        ? "bg-indigo-500/80 text-white"
                        : "bg-white/10 text-white/90")
                    }
                  >
                    {msg.type === "image" && msg.imageUrl ? (
                      <button
                        type="button"
                        onClick={() => setImageModal(msg.imageUrl)}
                        className="block"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={msg.imageUrl}
                          alt="Chat image"
                          className="max-h-48 rounded-xl border border-white/10 object-cover"
                        />
                      </button>
                    ) : (
                      <p>{msg.text}</p>
                    )}
                    {msg.createdAt ? (
                      <p className="mt-1 text-[10px] text-white/50">
                        {new Date(msg.createdAt).toLocaleTimeString("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
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
          {imagePreview ? (
            <div className="mb-3 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview}
                alt="Preview"
                className="h-16 w-16 rounded-xl border border-white/10 object-cover"
              />
              <div className="flex flex-1 items-center justify-between">
                <p className="text-xs text-white/60">Image ready to send</p>
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="text-xs text-white/60 hover:text-white"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70"
            >
              Attach image
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={onPickImage}
              className="hidden"
            />
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
            <Button
              loading={sending}
              variant="secondary"
              onClick={sendImage}
              disabled={!imageFile}
            >
              Send image
            </Button>
          </div>
        </div>
      </Card>

      {imageModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
          <button
            type="button"
            className="absolute right-6 top-6 text-white/70"
            onClick={() => setImageModal(null)}
          >
            Close
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageModal}
            alt="Full view"
            className="max-h-[80vh] rounded-2xl border border-white/10 object-contain"
          />
        </div>
      ) : null}
    </div>
  );
}