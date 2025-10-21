import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Batch Scheduler - Manufacturing Management",
  description: "Batch scheduling, equipment tracking, and inventory management for chemical/process manufacturing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-gray-50">
        <Navigation />
        <main className="min-h-screen">
          {children}
        </main>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
