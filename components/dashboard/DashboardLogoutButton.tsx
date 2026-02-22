"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function DashboardLogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-white transition"
    >
      <LogOut className="h-3.5 w-3.5" />
      Logout
    </button>
  );
}
