"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  if (!session) return null;

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

          <Link
            href="/dashboard"
            className="text-gray-300 hover:text-white transition"
          >
            Dashboard
          </Link>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="ml-4 px-4 py-1.5 rounded-md bg-red-600 text-white hover:bg-red-500 transition"
          >
            Logout
          </button>
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
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="block w-full text-left text-red-400 hover:text-red-300"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
