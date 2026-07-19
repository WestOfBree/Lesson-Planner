import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aerial Coach",
  description: "Lesson planning and student progress tracking for aerial silks coaches.",
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
      <body className="min-h-full bg-[radial-gradient(circle_at_top_left,_rgba(15,118,110,0.16),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(15,23,42,0.12),_transparent_26%),linear-gradient(180deg,_#f8f5ef_0%,_#f1ebe0_100%)] text-slate-950">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
