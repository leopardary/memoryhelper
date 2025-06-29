import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/app/components/Navbar/Navbar";
import Footer from "@/app/components/Footer";
import "@/app/globals.css";
import SessionProvider from "@/app/SessionProvider";
import {ColorsThemeProvider} from '@/providers/colors-theme-provider'
import {ThemeProvider} from '@/providers/theme-provider'
import { cn } from '@/app/components/Dashboard/utils'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MemoryHelper",
  description: "Your memory treasure keeper.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning lang="en">
      <link rel="icon" href="/favicon.png"
  type="image/png"
  sizes="32x32"
/>
      <body
        className={cn(`${geistSans.variable} ${geistMono.variable} w-full min-h-svh relative bg-background antialiased`)}
      >
        <SessionProvider>
          <ThemeProvider>
            <ColorsThemeProvider>
              <Navbar />
              <main className="p-4 max-w-7xl m-auto min-w-[300px]">{children}</main>
              <Footer />
            </ColorsThemeProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
