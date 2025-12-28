
import "./globals.css";
import Navbar from "@/components/Navbar";
import AuthSessionProvider from "@/components/SessionProvider";
import Script from "next/script";

export const metadata = {
  title: "TaskMate",
  description: "Hostel task marketplace",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white min-h-screen">
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
        <AuthSessionProvider>
          <Navbar />
          <main className="pt-6">{children}</main>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
