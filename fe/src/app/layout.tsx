import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import MobileNavigation from "@/components/MobileNavigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WingIt",
  description: "A modern social experience with WingIt",
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-gray-50 dark:bg-gray-900`}>
        <Providers>
          {children}
          <MobileNavigation />
        </Providers>
      </body>
    </html>
  );
}
