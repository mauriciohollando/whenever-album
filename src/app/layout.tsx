import type { Metadata } from "next";
import { Caveat, Fraunces, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700"],
  adjustFontFallback: false,
});

const body = Source_Serif_4({
  variable: "--font-body",
  subsets: ["latin"],
  adjustFontFallback: false,
});

const hand = Caveat({
  variable: "--font-hand",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: "Whenever — a family album for any century",
  description:
    "Upload a few photographs of your people. Pick any stretch of years. Get a twenty-page album back — $20, one album, no subscription.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${hand.variable} h-full`}
    >
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
