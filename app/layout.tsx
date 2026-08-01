import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", weight: ["500", "600"] });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], variable: "--font-mono", weight: ["400", "500"] });

export const metadata: Metadata = {
  title: "Corpus — Chat with your documents, grounded in truth",
  description:
    "Upload your team's documents and get instant, cited answers powered by Claude. No more digging through PDFs.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${fraunces.variable} ${inter.variable} ${mono.variable}`}>
        <body className="font-body">{children}</body>
      </html>
    </ClerkProvider>
  );
}
