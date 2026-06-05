import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ChatFab } from "@/components/chat-fab";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kitchen Assistant — AI Recipe Generation",
  description:
    "Generate beautiful, illustrated recipes with AI. Discover dishes, chat with your personal AI chef, and cook with confidence.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Let content extend into the notch / rounded-corner areas so we can use
  // safe-area insets for the fixed chat FAB and chat composer.
  viewportFit: "cover",
  themeColor: "#af1c1c",
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
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <Providers>
          <Navbar />
          <main className="flex flex-1 flex-col">{children}</main>
          <Footer />
          <ChatFab />
        </Providers>
      </body>
    </html>
  );
}
