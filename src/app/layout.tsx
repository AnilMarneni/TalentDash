import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "../components/layout/Navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TalentDash - Salary & Company Intelligence",
  description: "Browse verified salaries, compare compensation packages, and research company intelligence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-zinc-50 text-zinc-900 font-sans">
        <Navbar />
        <div className="flex-1 flex flex-col">
          {children}
        </div>
        <footer className="bg-white border-t border-zinc-200 py-6">
          <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400 font-medium">
            <div>
              &copy; 2026 TalentDash. All rights reserved.
            </div>
            <div className="flex gap-6">
              <span className="hover:text-zinc-600 transition-colors cursor-pointer">Privacy Policy</span>
              <span className="hover:text-zinc-600 transition-colors cursor-pointer">Terms of Service</span>
              <span className="hover:text-zinc-600 transition-colors cursor-pointer">Contact</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
