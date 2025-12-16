"use client";


import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  if (!session) return null;

  return (
    <nav className="w-full bg-gray-900 border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="text-xl font-bold text-white">
          TaskMate
        </Link>

        {/* Links */}
        <div className="flex items-center gap-6 text-sm">
          <Link href="/tasks" className="hover:text-gray-300">
            Browse Tasks
          </Link>

          <Link href="/tasks/create" className="hover:text-gray-300">
            Create Task
          </Link>

          <Link href="/dashboard" className="hover:text-gray-300">
            Dashboard
          </Link>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-500"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
