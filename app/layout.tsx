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
      <body className="h-full flex flex-col bg-white text-hsp-dark antialiased">

        {/* Header placeholder — replace with real Header component */}
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
          <div className="max-w-[1200px] mx-auto px-4 md:px-8 h-16 flex items-center">
            <span className="font-bold text-lg text-hsp-red">HSP</span>
          </div>
        </header>

        {/* Main content — consistent padding across all pages */}
        <main className="flex-1">
          <div className="max-w-[1200px] mx-auto pt-4 px-4 md:pt-8 md:px-8">
            {children}
          </div>
        </main>

        {/* Footer placeholder — replace with real Footer component */}
        <footer className="bg-hsp-dark text-white mt-auto">
          <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8">
            <p className="text-hsp-gray text-sm">
              © 2026 High School Prospect. All rights reserved.
            </p>
          </div>
        </footer>

      </body>
    </html>
  );
}
