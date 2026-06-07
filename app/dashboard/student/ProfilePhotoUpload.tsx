"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { createClient } from "@/lib/supabase-client";
import { Camera, User, Loader2, X } from "lucide-react";

type Props = {
  initialPhotoUrl: string | null;
};

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", reject);
    img.setAttribute("crossOrigin", "anonymous");
    img.src = url;
  });
}

async function getCroppedBlob(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = 400;
  canvas.height = 400;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    400,
    400
  );
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Canvas toBlob failed"))),
      "image/jpeg",
      0.92
    );
  });
}

export default function ProfilePhotoUpload({ initialPhotoUrl }: Props) {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [photoPath, setPhotoPath] = useState<string | null>(initialPhotoUrl);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Cropper state
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!photoPath) {
      Promise.resolve().then(() => {
        if (!cancelled) setSignedUrl(null);
      });
      return () => { cancelled = true; };
    }
    supabase.storage
      .from("profile-photos")
      .createSignedUrl(photoPath, 3600)
      .then(({ data }) => {
        if (!cancelled) setSignedUrl(data?.signedUrl ?? null);
      });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoPath]);

  useEffect(() => {
    if (!errorMsg) return;
    const t = setTimeout(() => setErrorMsg(null), 4000);
    return () => clearTimeout(t);
  }, [errorMsg]);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("Photo must be under 10MB.");
      return;
    }

    setErrorMsg(null);
    setRawFile(file);
    setCropSrc(URL.createObjectURL(file));
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  }

  function cancelCrop() {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
    setRawFile(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  }

  async function handleSave() {
    if (!cropSrc || !croppedAreaPixels || !rawFile) return;

    // Capture before closing modal
    const src = cropSrc;
    const pixels = croppedAreaPixels;
    const file = rawFile;

    // Close modal immediately for snappy UX; spinner shows on avatar
    setCropSrc(null);
    setRawFile(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);

    setUploading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      URL.revokeObjectURL(src);
      setUploading(false);
      return;
    }

    let blob: Blob;
    try {
      // Canvas must finish drawing before we revoke the object URL
      blob = await getCroppedBlob(src, pixels);
    } catch {
      URL.revokeObjectURL(src);
      setErrorMsg("Failed to process image.");
      setUploading(false);
      return;
    }
    URL.revokeObjectURL(src);

    if (photoPath) {
      await supabase.storage.from("profile-photos").remove([photoPath]);
    }

    const ext = file.name.split(".").pop() ?? "jpg";
    const newPath = `${user.id}/profile_${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("profile-photos")
      .upload(newPath, blob, { contentType: "image/jpeg" });

    if (uploadError) {
      setErrorMsg("Upload failed: " + uploadError.message);
      setUploading(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("students")
      .update({ photo_url: newPath })
      .eq("profile_id", user.id);

    if (updateError) {
      setErrorMsg("Failed to save: " + updateError.message);
      setUploading(false);
      return;
    }

    setPhotoPath(newPath);
    setUploading(false);
  }

  return (
    <>
      {/* ── Avatar + camera badge ── */}
      <div className="relative shrink-0">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <div
          className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: "#0f172a" }}
        >
          {uploading ? (
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          ) : signedUrl ? (
            <img src={signedUrl} alt="Profile photo" className="w-full h-full object-cover" />
          ) : (
            <User className="w-12 h-12 text-white" />
          )}
        </div>

        <button
          onClick={() => { if (!uploading) fileInputRef.current?.click(); }}
          disabled={uploading}
          className="absolute bottom-0 left-0 w-6 h-6 rounded-full flex items-center justify-center shadow-sm disabled:opacity-70"
          style={{ backgroundColor: "#d93025" }}
          aria-label="Upload photo"
        >
          <Camera className="w-3 h-3 text-white" />
        </button>

        {errorMsg && (
          <p className="absolute top-full left-0 mt-1.5 text-xs text-red-600 whitespace-nowrap">
            {errorMsg}
          </p>
        )}
      </div>

      {/* ── Cropper modal ── */}
      {cropSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
        >
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
              <h2 className="text-base font-bold" style={{ color: "#0f172a" }}>
                Crop Photo
              </h2>
              <button
                onClick={cancelCrop}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Cancel"
              >
                <X className="w-4 h-4" style={{ color: "#0f172a" }} />
              </button>
            </div>

            {/* Cropper canvas area */}
            <div className="relative w-full bg-gray-900" style={{ height: "300px" }}>
              <Cropper
                image={cropSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            {/* Zoom slider */}
            <div className="px-5 pt-4 pb-1">
              <label
                className="block text-xs font-semibold uppercase tracking-wide mb-2"
                style={{ color: "#64748b" }}
              >
                Zoom
              </label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-[#d93025]"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 px-5 py-4">
              <button
                onClick={cancelCrop}
                className="flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-colors hover:bg-red-50"
                style={{ borderColor: "#d93025", color: "#d93025" }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors hover:opacity-90"
                style={{ backgroundColor: "#d93025" }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
