"use client";

import Link from "next/link";
import { useState } from "react";

const desktopLinks = [
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Sign Up", href: "/signup" },
];

const drawerLinks = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Pricing", href: "/pricing" },
  { label: "Learn More", href: "/learn-more" },
  { label: "Sign Up", href: "/signup" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 flex flex-col md:flex-row md:items-center md:justify-between md:h-16 py-3 md:py-0">

          {/* Row 1 (mobile) / Left side (desktop): Logo + hamburger */}
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-baseline gap-1 font-black text-2xl md:text-3xl leading-none hover:opacity-80 hover:scale-105 transition-all duration-200">
              <span className="text-hsp-red">High</span>
              <span className="text-hsp-dark">School</span>
              <span className="text-hsp-dark">Prospect</span>
            </Link>
            <button
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="md:hidden p-1 text-2xl text-hsp-dark"
            >
              ☰
            </button>
          </div>

          {/* Row 2 (mobile only): Sign Up + Login */}
          <div className="flex md:hidden items-center gap-2 mt-2">
            <Link
              href="/signup"
              className="text-sm text-hsp-gray hover:text-hsp-dark transition-colors duration-150"
            >
              Sign Up
            </Link>
            <Link
              href="/login"
              className="bg-hsp-red text-white text-sm font-semibold px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity duration-150 hover:scale-105 transition-transform duration-200"
            >
              Login
            </Link>
          </div>

          {/* Desktop nav — md and above */}
          <nav className="hidden md:flex items-center gap-6">
            {desktopLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-hsp-dark hover:text-hsp-red hover:scale-105 transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              className="bg-hsp-red text-white text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity duration-150 hover:scale-105 transition-transform duration-200"
            >
              Login
            </Link>
          </nav>

        </div>
      </header>

      {/* Overlay */}
      <div
        onClick={close}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/40 md:hidden transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white z-50 flex flex-col shadow-xl md:hidden transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-gray-200 shrink-0">
          <span className="font-bold text-sm text-hsp-dark">Menu</span>
          <button
            onClick={close}
            aria-label="Close menu"
            className="text-hsp-gray hover:text-hsp-dark text-lg p-1 transition-colors duration-150"
          >
            ✕
          </button>
        </div>

        {/* Drawer links */}
        <nav className="flex flex-col gap-1 p-4">
          {drawerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={close}
              className="text-sm font-medium text-hsp-dark px-3 py-3 rounded-lg hover:bg-hsp-card transition-colors duration-150"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            onClick={close}
            className="mt-2 text-center bg-hsp-red text-white text-sm font-semibold px-3 py-3 rounded-lg hover:opacity-90 transition-opacity duration-150 hover:scale-105 transition-transform duration-200"
          >
            Login
          </Link>
        </nav>
      </div>
    </>
  );
}
