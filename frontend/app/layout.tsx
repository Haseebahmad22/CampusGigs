import type { Metadata } from "next";
import { Geist, Geist_Mono, Roboto, Playfair_Display } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

// Wordmark / logo font — elegant, distinctive
const playfair = Playfair_Display({
  variable: "--font-logo",
  subsets: ["latin"],
  weight: ["700", "800"],
  style: ["italic"],
});

export const metadata: Metadata = {
  title: "CampusGigs — Where Campus Talent Meets Opportunity",
  description:
    "The premier platform connecting student talent with real campus opportunities. Post gigs, earn tokens, and build your campus reputation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${roboto.variable} ${playfair.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
