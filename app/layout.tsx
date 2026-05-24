import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

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

        <Header />

        {/* Main content — consistent padding across all pages */}
        <main className="flex-1">
          <div className="max-w-[1200px] mx-auto pt-4 px-4 md:pt-8 md:px-8">
            {children}
          </div>
        </main>

        <Footer />

      </body>
    </html>
  );
}
