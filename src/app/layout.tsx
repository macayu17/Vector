import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono, Lora } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

const themeScript = `
(() => {
  try {
    const stored = localStorage.getItem('darkMode');
    const useDark = stored === null ? true : stored === 'true';
    document.documentElement.classList.toggle('dark', useDark);
    document.documentElement.style.colorScheme = useDark ? 'dark' : 'light';
  } catch {
    document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = 'dark';
  }
})();
`;

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
    <html
      lang="en"
      className={`${dmSans.variable} ${lora.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans antialiased">
        <AuthProvider>
          <div className="relative min-h-screen bg-background text-foreground">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
