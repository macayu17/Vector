import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import LetterGlitch from "@/components/backgrounds/LetterGlitch";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vector - Modern Job Tracking",
  description: "Track and manage your job applications with a beautiful modern interface",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="relative flex h-screen overflow-hidden bg-background text-foreground">
          <LetterGlitch
            glitchColors={['#a855f7', '#c084fc', '#e879f9']}
            glitchSpeed={50}
            centerVignette={false}
            outerVignette={true}
            smooth={true}
          />
          <Sidebar />
          <div className="flex flex-col flex-1 overflow-hidden relative z-10">
            <TopBar />
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
