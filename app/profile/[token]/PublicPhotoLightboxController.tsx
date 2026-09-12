"use client";

/* eslint-disable @next/next/no-img-element -- Reuse the photo URL already displayed in the DOM. */

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

export default function PublicPhotoLightboxController() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [photo, setPhoto] = useState<{ src: string; alt: string } | null>(null);

  useEffect(() => {
    // The controller is mounted inside the server-rendered photo section.
    const section = dialogRef.current?.parentElement;
    if (!section) return;

    function handlePhotoClick(event: MouseEvent) {
      if (!(event.target instanceof Element)) return;
      const trigger = event.target.closest(
        "button[data-public-photo-lightbox-trigger]"
      );
      if (!(trigger instanceof HTMLButtonElement) || !section?.contains(trigger)) return;
      const img = trigger.querySelector("img");
      if (!img) return;
      const src = img.currentSrc || img.src;
      if (!src) return;

      triggerRef.current = trigger;
      setPhoto({ src, alt: img.alt });
    }

    section.addEventListener("click", handlePhotoClick);
    return () => section.removeEventListener("click", handlePhotoClick);
  }, []);

  useEffect(() => {
    if (!photo) return;
    dialogRef.current?.showModal();
    closeRef.current?.focus({ preventScroll: true });
  }, [photo]);

  function closePreview() {
    dialogRef.current?.close();
  }

  return (
    <dialog
      ref={dialogRef}
      aria-label={photo ? `Photo preview: ${photo.alt}` : "Photo preview"}
      className="fixed inset-0 m-0 h-full supports-[height:100dvh]:h-dvh w-full max-h-none max-w-none border-0 p-0 bg-transparent text-white backdrop:bg-black/95 open:flex items-center justify-center"
      onClick={(event) => {
        // Only the dark area dismisses; clicks on the image stay open.
        if (event.target === event.currentTarget) closePreview();
      }}
      onClose={() => {
        setPhoto(null);
        triggerRef.current?.focus({ preventScroll: true });
        triggerRef.current = null;
      }}
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
      {photo && (
        <img
          key={photo.src}
          src={photo.src}
          alt={photo.alt}
          className="block h-auto max-w-[90vw] max-h-[85vh] supports-[height:100dvh]:max-h-[85dvh] rounded-xl"
          onLoad={(event) => {
            const img = event.currentTarget;
            if (!img.naturalWidth || !img.naturalHeight) return;
            const aspectRatio = img.naturalWidth / img.naturalHeight;
            const heightUnit = CSS.supports("height", "100dvh") ? "dvh" : "vh";
            // Match the coach preview: size the image box without letterboxing.
            img.style.width = `min(90vw, ${85 * aspectRatio}${heightUnit})`;
          }}
        />
      )}
    </dialog>
  );
}
