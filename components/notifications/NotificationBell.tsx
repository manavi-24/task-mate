"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { initNotificationSound, playNotificationSound } from "@/lib/notificationSound";

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  message: string;
  taskId: string | null;
  ctaUrl: string | null;
  createdAt: string | null;
  readAt: string | null;
};

function timeAgo(iso: string | null): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  const now = new Date().getTime();
  const diff = Math.max(0, now - then);

  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  return `${days}d ago`;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pollRef = useRef<number | null>(null);
  const prevUnreadRef = useRef<number | null>(null);
  const initialLoadRef = useRef(true);

  const hasUnread = unreadCount > 0;

  async function fetchNotifications() {
    try {
      setError(null);
      const res = await fetch("/api/notifications?limit=10", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to load notifications");
      }
      const data = (await res.json()) as {
        notifications: NotificationItem[];
        unreadCount: number;
      };
      if (!initialLoadRef.current && prevUnreadRef.current !== null) {
        if (data.unreadCount > prevUnreadRef.current) {
          playNotificationSound();
        }
      }
      setItems(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
      prevUnreadRef.current = data.unreadCount ?? 0;
      initialLoadRef.current = false;
      setLoading(false);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to load";
      setError(message);
      setLoading(false);
    }
  }

  async function markAllRead() {
    try {
      setMarking(true);
      const res = await fetch("/api/notifications/mark-all-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to mark as read");
      }
      await fetchNotifications();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to mark as read";
      setError(message);
    } finally {
      setMarking(false);
    }
  }

  useEffect(() => {
    initNotificationSound();
    // initial load
    fetchNotifications();

    // polling (every 10s)
    pollRef.current = window.setInterval(() => {
      fetchNotifications();
    }, 10000);

    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
  }, []);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!open) return;
      const target = e.target as Node;
      if (containerRef.current && !containerRef.current.contains(target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    // immediate refresh when dropdown opens
    fetchNotifications();
  }, [open]);

  const empty = !loading && items.length === 0;

  const rows = useMemo(
    () =>
      items.map((n) => {
        const isUnread = !n.readAt;
        const href = n.ctaUrl || "/dashboard";
        return (
          <Link
            key={n.id}
            href={href}
            onClick={() => setOpen(false)}
            className={
              "flex gap-3 rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 shadow-[0_6px_20px_-18px_rgba(0,0,0,0.6)] hover:bg-white/15 transition " +
              (isUnread ? "border-pink-500/30 bg-pink-500/10" : "bg-white/10")
            }
          >
            <div className="mt-1 h-2 w-2 rounded-full bg-pink-400" style={{ opacity: isUnread ? 1 : 0 }} />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <p className={"text-sm font-semibold truncate " + (isUnread ? "text-white" : "text-white/85")}>
                  {n.title}
                </p>
                <p className="shrink-0 text-xs text-white/60">{timeAgo(n.createdAt)}</p>
              </div>
              <p className={"mt-0.5 text-xs line-clamp-2 " + (isUnread ? "text-white/80" : "text-white/65")}>
                {n.message}
              </p>
            </div>
          </Link>
        );
      }),
    [items]
  );

  return (
    <div ref={containerRef} className="relative z-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white transition"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {hasUnread ? (
          <span className="absolute -right-1.5 -top-1.5 min-w-[18px] rounded-full bg-pink-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white shadow">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 mt-2 w-[340px] max-w-[calc(100vw-2rem)] rounded-2xl border border-white/15 bg-slate-900/95 p-3 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.85)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3 px-1">
            <div>
              <p className="text-sm font-semibold text-white">Notifications</p>
              <p className="text-xs text-white/45">Latest updates</p>
            </div>
            <button
              type="button"
              onClick={markAllRead}
              disabled={marking || unreadCount === 0}
              className="rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/20 hover:text-white transition disabled:opacity-50"
            >
              {marking ? "Marking…" : "Mark all as read"}
            </button>
          </div>

          {error ? (
            <div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
              {error}
            </div>
          ) : null}

          <div className="mt-3 space-y-2">
            {loading ? (
              <SkeletonList />
            ) : empty ? (
              <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-6 text-center">
                <p className="text-sm font-semibold text-white">No notifications yet</p>
                <p className="mt-1 text-xs text-white/55">
                  When something happens with your tasks, you’ll see it here.
                </p>
              </div>
            ) : (
              rows
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-3"
        >
          <div className="h-3 w-40 rounded bg-white/10" />
          <div className="mt-2 h-2 w-64 rounded bg-white/10" />
        </div>
      ))}
    </div>
  );
}
