import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-hsp-dark text-white mt-auto">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">

        <p className="text-hsp-gray text-sm">
          © 2026 High School Prospect. All rights reserved.
        </p>

        <nav className="flex items-center gap-6">
          <Link
            href="/privacy-policy"
            className="text-sm text-hsp-gray hover:text-white transition-colors duration-150"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms-and-conditions"
            className="text-sm text-hsp-gray hover:text-white transition-colors duration-150"
          >
            Terms &amp; Conditions
          </Link>
        </nav>

      </div>
    </footer>
  );
}
