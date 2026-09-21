import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "Brainstorm with Zinchi | Zinchi International",
    template: "%s | Brainstorm with Zinchi",
  },
  description:
    "Brainstorm with Zinchi is Zinchi International's learning platform for test prep, courses, assignments, and mock exams — guiding students toward global opportunities.",
  metadataBase: new URL("https://brainstorm.zinchi.org"),
  openGraph: {
    title: "Brainstorm with Zinchi",
    description:
      "Zinchi International's learning platform for test prep, courses, assignments, and mock exams.",
    siteName: "Brainstorm with Zinchi",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
