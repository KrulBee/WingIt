import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import MobileNavigation from "@/components/MobileNavigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WingIt - Mạng xã hội Việt Nam",
  description: "Kết nối và chia sẻ những khoảnh khắc đẹp nhất với cộng đồng Việt Nam. Khám phá 63 tỉnh thành và tạo nên những kỷ niệm đáng nhớ.",
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
    <html lang="vi" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-gray-50 dark:bg-gray-900`}>
        <Providers>
          {children}
          <MobileNavigation />
        </Providers>
      </body>
    </html>
  );
}
