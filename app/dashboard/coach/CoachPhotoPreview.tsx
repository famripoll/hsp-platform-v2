"use client";

/* eslint-disable @next/next/no-img-element -- Use the existing signed photo URL directly. */

import { useRef } from "react";
import { X } from "lucide-react";

type CoachPhotoPreviewProps = {
  src: string;
  alt: string;
};

export default function CoachPhotoPreview({ src, alt }: CoachPhotoPreviewProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  function openPreview() {
    dialogRef.current?.showModal();
    closeRef.current?.focus({ preventScroll: true });
  }

  function closePreview() {
    dialogRef.current?.close();
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={`Enlarge photo: ${alt}`}
        aria-haspopup="dialog"
        onClick={openPreview}
        className="aspect-square w-full rounded-xl overflow-hidden bg-gray-100 cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#CE2C22]"
      >
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      </button>

      <dialog
        ref={dialogRef}
        aria-label={`Photo preview: ${alt}`}
        className="fixed inset-0 m-0 h-full supports-[height:100dvh]:h-dvh w-full max-h-none max-w-none border-0 p-0 bg-transparent text-white backdrop:bg-black/95 open:flex items-center justify-center"
        onClick={(event) => {
          // Only the dark area dismisses; clicks on the image stay open.
          if (event.target === event.currentTarget) closePreview();
        }}
        onClose={() => triggerRef.current?.focus({ preventScroll: true })}
      >
        <button
          ref={closeRef}
          type="button"
          autoFocus
          aria-label="Close photo preview"
          onClick={closePreview}
          className="absolute z-10 flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-black/70 text-white cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          style={{
            top: "max(1rem, env(safe-area-inset-top))",
            right: "max(1rem, env(safe-area-inset-right))",
          }}
        >
          <X className="h-6 w-6" aria-hidden="true" />
        </button>
        <img
          src={src}
          alt={alt}
          className="block h-auto max-w-[90vw] max-h-[85vh] supports-[height:100dvh]:max-h-[85dvh] rounded-xl"
          onLoad={(event) => {
            const img = event.currentTarget;
            if (!img.naturalWidth || !img.naturalHeight) return;
            const aspectRatio = img.naturalWidth / img.naturalHeight;
            const heightUnit = CSS.supports("height", "100dvh") ? "dvh" : "vh";
            // Size the actual image box to its aspect ratio, without letterboxing.
            img.style.width = `min(90vw, ${85 * aspectRatio}${heightUnit})`;
          }}
        />
      </dialog>
    </>
  );
}
