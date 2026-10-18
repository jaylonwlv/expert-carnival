import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Relocation Engine · Client Tracker",
  description: "Track your Las Vegas relocation, step by step.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* .reveal (components/Reveal.tsx) starts offset/transparent and
            relies on JS (IntersectionObserver) to reveal it -- without
            this, a visitor with JS disabled would never see that content
            at all. The animation is a progressive enhancement, not a
            requirement for reading the page. */}
        <noscript>
          <style>{".reveal { opacity: 1 !important; transform: none !important; }"}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
