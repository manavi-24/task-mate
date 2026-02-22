import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

import LandingHeader from "@/components/landing/LandingHeader";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import Payments from "@/components/landing/Payments";
import Trust from "@/components/landing/Trust";
import FinalCTA from "@/components/landing/FinalCTA";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";

export const metadata = {
  title: "TaskMate — Hostel micro-task marketplace",
  description:
    "Post quick hostel tasks and get them done fast. Students accept tasks, follow a clear lifecycle, and pay via UPI, cash, or online.",
  openGraph: {
    title: "TaskMate",
    description:
      "A micro-task marketplace for students. Post tasks, get them done, pay easily.",
    url: "/",
    siteName: "TaskMate",
    type: "website" as const,
  },
};

export default async function Home() {
  const session = await getServerSession(authOptions);
  const isAuthed = Boolean(session?.user?.email);

  const primaryCtaHref = isAuthed ? "/dashboard" : "/get-started";
  const primaryCtaLabel = isAuthed ? "Go to Dashboard" : "Get Started";

  return (
    <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
      <LandingHeader />

      <main>
        <Hero primaryCtaHref={primaryCtaHref} primaryCtaLabel={primaryCtaLabel} />
        <Features />
        <HowItWorks />
        <Payments />
        <Trust />
        <FinalCTA />
        <FAQ />
      </main>

      <Footer />
    </div>
  );
}
