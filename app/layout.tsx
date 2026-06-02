import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "High School Prospect | HSP",
  description: "Baseball recruiting platform for high school prospects",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full flex flex-col bg-white text-hsp-dark antialiased overflow-y-scroll">
        {children}
      </body>
    </html>
  );
}
