import type { Metadata } from "next";
import { Fraunces, DM_Sans } from "next/font/google";
import AuthProvider from "@/components/auth-provider";
import QueryProvider from "@/providers/query-provider";
import GoogleProvider from "@/providers/google-provider";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Elevoria",
  description: "AI-powered productivity platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${dmSans.variable}`}>
      <body>
        <GoogleProvider>
          <QueryProvider>
            <AuthProvider>{children}</AuthProvider>
          </QueryProvider>
        </GoogleProvider>
      </body>
    </html>
  );
}
