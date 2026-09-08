import Link from "next/link";
import Header from "../components/layout/Header";

// The public student profile keeps the FULL public Header — the outreach email
// invites the coach to create an account, so the nav and Sign Up belong here.
// The marketing Footer does not: no pricing or social links on a page that
// renders a minor's data. Only the copyright line and the two legal links are
// kept, styled to match the real Footer's bottom bar.
export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />

      <main className="flex-1">
        <div className="max-w-[1200px] mx-auto pt-4 px-4 md:pt-8 md:px-8">
          {children}
        </div>
      </main>

      <footer className="bg-slate-100 mt-20 pt-10 pb-10 px-5 w-full box-border">
        <div className="max-w-[1200px] mx-auto">
          <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-5 flex-wrap">
            <p className="text-xs text-hsp-gray m-0 text-center md:text-left">
              © 2026 Ripoll Services, LLC. All Rights Reserved.
            </p>
            <div className="flex gap-6 flex-wrap justify-center">
              <Link href="/terms-and-conditions" className="text-hsp-gray no-underline text-xs whitespace-nowrap hover:underline">Terms and Conditions</Link>
              <Link href="/privacy-policy" className="text-hsp-gray no-underline text-xs whitespace-nowrap hover:underline">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
