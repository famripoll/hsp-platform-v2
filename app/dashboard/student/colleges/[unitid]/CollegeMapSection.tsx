"use client";

import { X } from "lucide-react";

// Fully controlled by CollegeHero, which owns the shared open state so the
// hero's clickable city/state row and this card's close button drive the same
// thing. Renders nothing at all while collapsed; the iframe is only mounted
// while open — a deliberate lazy load.
export default function CollegeMapSection({
  address,
  open,
  onToggle,
}: {
  address: string;
  open: boolean;
  onToggle: () => void;
}) {
  if (!open) return null;

  const mapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY;

  return (
    <div id="college-map" className="bg-white rounded-2xl shadow-sm p-6 scroll-mt-6">
      <div className="flex justify-end mb-2">
        <button
          type="button"
          onClick={onToggle}
          aria-label="Close map"
          className="p-2 -mr-2 -mt-2 rounded-md text-[#64748b] transition-colors hover:text-[#d93025] hover:bg-gray-50"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="rounded-xl overflow-hidden">
        {mapsKey ? (
          <iframe
            title="Campus location"
            src={`https://www.google.com/maps/embed/v1/place?key=${mapsKey}&q=${encodeURIComponent(
              address
            )}`}
            width="100%"
            height="250"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <p className="text-sm text-center py-8" style={{ color: "#64748b" }}>
            Map unavailable
          </p>
        )}
      </div>
    </div>
  );
}
