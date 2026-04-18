import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Memz Academy",
  description: "Memz Academy LMS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--memz-page-bg)] text-[var(--memz-text)]">
        <div className="min-h-screen bg-[var(--memz-page-bg)]">
          <Navbar />
          <main className="min-h-[calc(100vh-80px)] pt-24">{children}</main>
        </div>
      </body>
    </html>
  );
}