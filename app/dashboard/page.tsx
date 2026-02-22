export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/firebaseAdmin";
import { serializeTask } from "@/lib/serializeTask";
import Image from "next/image";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { DollarSign, ListChecks, TrendingUp, Zap } from "lucide-react";
import { DashboardLogoutButton } from "@/components/dashboard/DashboardLogoutButton";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/get-started?callback=%2Fdashboard");
  }

  const email = session.user.email;

  /* ---------- MY POSTED TASKS ---------- */
  const postedSnap = await db
    .collection("tasks")
    .where("createdBy.email", "==", email)
    .orderBy("createdAt", "desc")
    .get();

  const postedTasks = postedSnap.docs.map(serializeTask);

  /* ---------- MY ACCEPTED TASKS ---------- */
  const acceptedSnap = await db
    .collection("tasks")
    .where("acceptedBy.email", "==", email)
    .get();

  const acceptedTasks = acceptedSnap.docs.map(serializeTask);

  /* ---------- EARNINGS (ONLY CLOSED TASKS) ---------- */
  const earnings = acceptedTasks
    .filter(task => task.status === "closed")
    .reduce((sum, task) => sum + (task.price || 0), 0);

  const activePosted = postedTasks.filter(
    (t) => t.status !== "closed"
  ).length;
  const activeAccepted = acceptedTasks.filter(
    (t) => t.status !== "closed"
  ).length;

  const activeCombined = activePosted + activeAccepted;

  const userName = session.user.name ?? "";
  const firstName = userName.trim().split(" ")[0] || "";
  const userPhoto = session.user.image ?? null;

  return (
    <div className="relative overflow-hidden">
      {/* background glow + subtle grid (landing-page vibe) */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] [background-size:24px_24px]" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-indigo-300">
              Your workspace
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Dashboard
            </h1>
            <p className="mt-3 max-w-2xl text-white/60">
              Track tasks you posted, tasks you accepted, and your earnings — all
              in one place.
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 sm:items-end">
            {/* user chip */}
            <div className="relative">
              <div className="pointer-events-none absolute -inset-1 rounded-3xl bg-gradient-to-r from-indigo-500/25 to-purple-500/25 blur-xl" />
              <div className="relative inline-flex items-center gap-3 rounded-3xl border border-white/10 bg-white/5 px-4 py-2.5 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.45)]">
                <div className="h-10 w-10 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                  {userPhoto ? (
                    <Image
                      src={userPhoto}
                      alt={userName || "User"}
                      width={40}
                      height={40}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-white/70">
                      {(firstName || "U").slice(0, 1).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="leading-tight">
                  <p className="text-sm font-semibold text-white">
                    {firstName ? `Hi, ${firstName}` : "Hi"}
                  </p>
                  <p className="text-xs text-white/55">Welcome back</p>
                </div>

                <div className="pl-2">
                  <DashboardLogoutButton />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Metrics */}
        <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Total earnings"
            value={`₹${earnings.toLocaleString("en-IN")}`}
            helper="Closed accepted tasks"
            icon={<DollarSign className="h-5 w-5" />}
          />
          <MetricCard
            label="Tasks posted"
            value={postedTasks.length}
            helper={`Active: ${activePosted}`}
            icon={<ListChecks className="h-5 w-5" />}
          />
          <MetricCard
            label="Tasks accepted"
            value={acceptedTasks.length}
            helper={`Active: ${activeAccepted}`}
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <MetricCard
            label="Active tasks"
            value={activeCombined}
            helper="Posted + accepted (not closed)"
            icon={<Zap className="h-5 w-5" />}
          />
        </section>

        {/* Main lists w/ tabs */}
        <div className="mt-10">
          <DashboardClient postedTasks={postedTasks} acceptedTasks={acceptedTasks} />
        </div>
      </div>
    </div>
  );
}
