import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "High School Prospect | HSP",
  description: "Baseball recruiting platform for high school prospects",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full flex flex-col bg-white text-hsp-dark antialiased [scrollbar-gutter:stable]">
        {children}
      </body>
    </html>
  );
}
