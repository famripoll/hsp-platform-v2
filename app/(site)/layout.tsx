import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />

      {/* Main content — consistent padding across all pages */}
      <main className="flex-1">
        <div className="max-w-[1200px] mx-auto pt-4 px-4 md:pt-8 md:px-8">
          {children}
        </div>
      </main>

      <Footer />
    </>
  );
}
