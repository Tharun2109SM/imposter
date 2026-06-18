import type { Metadata } from "next";
import { Inter, Shrikhand } from "next/font/google";
import "./globals.css";

const display = Shrikhand({
  subsets: ["latin"],
  variable: "--font-retro-display",
  weight: "400"
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter"
});

export const metadata: Metadata = {
  title: "Imposter.",
  description: "A warm social deduction party game."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${inter.variable}`}>{children}</body>
    </html>
  );
}
