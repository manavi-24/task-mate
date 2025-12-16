import "./globals.css";
import Navbar from "@/components/Navbar";
import AuthSessionProvider from "@/components/SessionProvider";

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
        <AuthSessionProvider>
          <Navbar />
          <main className="pt-6">{children}</main>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
