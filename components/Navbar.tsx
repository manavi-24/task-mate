"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { NotificationBell } from "@/components/notifications/NotificationBell";

function MessengerIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="messengerGradient"
          x1="8"
          y1="10"
          x2="40"
          y2="42"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00C6FF" />
          <stop offset="1" stopColor="#0062FF" />
        </linearGradient>
      </defs>
      <path
        d="M24 6C14.06 6 6 13.48 6 22.66c0 5.25 2.7 9.86 6.94 12.95V42l6.48-3.55c1.49.41 3.07.63 4.58.63 9.94 0 18-7.48 18-16.66S33.94 6 24 6Z"
        fill="url(#messengerGradient)"
      />
      <path
        d="M16.2 28.2l8.4-8.9 4.6 5.1 8.6-5.1-8.8 9.4-4.7-5.1-8.1 4.6Z"
        fill="#fff"
      />
    </svg>
  );
}

export default function Navbar() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [unreadConversations, setUnreadConversations] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    let mounted = true;
    async function loadUnread() {
      try {
        const res = await fetch("/api/conversations");
        const data = await res.json();
        if (!mounted) return;
        setUnreadConversations(data.totalUnreadConversationsCount ?? 0);
      } catch {
        if (!mounted) return;
        setUnreadConversations(0);
      }
    }

    if (session?.user?.email) {
      fetch("/api/users", { method: "POST" }).catch(() => null);
      loadUnread();
      const timer = window.setInterval(loadUnread, 10000);
      return () => {
        mounted = false;
        window.clearInterval(timer);
      };
    }
    return () => {
      mounted = false;
    };
  }, [session?.user?.email]);

  if (!session) return null;
  // Avoid showing the authenticated navbar on the public landing page.
  if (pathname === "/") return null;

  return (
    <nav className="w-full bg-gradient-to-r from-gray-900 to-gray-950 border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* LEFT — Logo */}
        <Link
          href="/dashboard"
          className="text-xl font-bold tracking-wide text-white"
        >
          TaskMate
        </Link>

        {/* RIGHT — Desktop Nav */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
           <Link
            href="/dashboard"
            className="text-gray-300 hover:text-white transition"
          >
            Dashboard
          </Link>
          <Link
            href="/tasks"
            className="text-gray-300 hover:text-white transition"
          >
            Browse Tasks
          </Link>

          <Link
            href="/tasks/create"
            className="text-gray-300 hover:text-white transition"
          >
            Create Task
          </Link>

         

          <div className="ml-2 flex items-center gap-3">
            <Link
              href="/messages"
              className="relative rounded-full border border-white/10 bg-white/5 p-2 text-gray-200 transition hover:bg-white/10"
              aria-label="Open messages"
              title="Messages"
            >
              <MessengerIcon size={30} />
              {unreadConversations > 0 ? (
                <span className="absolute -right-2 -top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full border border-gray-900 bg-rose-500 px-1 text-[10px] font-semibold text-white shadow-sm">
                  {unreadConversations}
                </span>
              ) : null}
            </Link>
            <NotificationBell />
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="px-4 py-1.5 rounded-md bg-red-600 text-white hover:bg-red-500 transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-gray-300 hover:text-white"
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="md:hidden bg-gray-900 border-t border-gray-800 px-6 py-4 space-y-4 text-sm">
          <Link
            href="/messages"
            onClick={() => setOpen(false)}
            className="flex items-center justify-between text-gray-300 hover:text-white"
          >
            <span>Messages</span>
            {unreadConversations > 0 ? (
              <span className="inline-flex min-w-[20px] items-center justify-center rounded-full border border-gray-900 bg-rose-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                {unreadConversations}
              </span>
            ) : null}
          </Link>

          <Link
            href="/tasks"
            onClick={() => setOpen(false)}
            className="block text-gray-300 hover:text-white"
          >
            Browse Tasks
          </Link>

          <Link
            href="/tasks/create"
            onClick={() => setOpen(false)}
            className="block text-gray-300 hover:text-white"
          >
            Create Task
          </Link>

          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="block text-gray-300 hover:text-white"
          >
            Dashboard
          </Link>

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="block w-full text-left text-red-400 hover:text-red-300"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
