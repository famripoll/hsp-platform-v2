"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-client";
import { X, Trash2, Loader2 } from "lucide-react";

type MediaRecord = {
  id: string;
  file_path: string;
  file_name: string;
  signedUrl: string;
};

type DeleteTarget = {
  id: string;
  bucket: string;
  file_path: string;
};

export default function MediaGallery() {
  const supabase = createClient();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<MediaRecord[]>([]);
  const [videos, setVideos] = useState<MediaRecord[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [lightboxPhoto, setLightboxPhoto] = useState<MediaRecord | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<DeleteTarget | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) {
        setLoading(false);
        return;
      }

      const { data: records } = await supabase
        .from("student_media")
        .select("id, file_path, file_name, media_type")
        .eq("profile_id", user.id)
        .order("created_at", { ascending: false });

      if (!records || cancelled) {
        setLoading(false);
        return;
      }

      const photoRecords = records.filter((r) => r.media_type === "photo");
      const videoRecords = records.filter((r) => r.media_type === "video");

      const [signedPhotos, signedVideos] = await Promise.all([
        Promise.all(
          photoRecords.map(async (r) => {
            const { data } = await supabase.storage
              .from("student-photos")
              .createSignedUrl(r.file_path, 3600);
            return {
              id: r.id,
              file_path: r.file_path,
              file_name: r.file_name,
              signedUrl: data?.signedUrl ?? "",
            };
          })
        ),
        Promise.all(
          videoRecords.map(async (r) => {
            const { data } = await supabase.storage
              .from("student-videos")
              .createSignedUrl(r.file_path, 3600);
            return {
              id: r.id,
              file_path: r.file_path,
              file_name: r.file_name,
              signedUrl: data?.signedUrl ?? "",
            };
          })
        ),
      ]);

      if (!cancelled) {
        setPhotos(signedPhotos);
        setVideos(signedVideos);
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, refreshKey]);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (lightboxPhoto) { setLightboxPhoto(null); return; }
      if (confirmDelete) { setConfirmDelete(null); return; }
      setOpen(false);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, lightboxPhoto, confirmDelete]);

  async function handleDelete() {
    if (!confirmDelete) return;
    setDeleting(true);
    await supabase.storage.from(confirmDelete.bucket).remove([confirmDelete.file_path]);
    await supabase.from("student_media").delete().eq("id", confirmDelete.id);
    if (lightboxPhoto?.id === confirmDelete.id) setLightboxPhoto(null);
    setConfirmDelete(null);
    setDeleting(false);
    setRefreshKey((k) => k + 1);
  }

  return (
    <>
      {/* Trigger button — matches the existing card style */}
      <button
        onClick={() => setOpen(true)}
        className="w-full bg-red-50 font-semibold rounded-xl py-3 transition-colors hover:bg-red-100"
        style={{ color: "#d93025" }}
      >
        View Media →
      </button>

      {/* ── Main modal ── */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <h2 className="text-xl font-bold" style={{ color: "#0f172a" }}>
                My Media
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" style={{ color: "#0f172a" }} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 p-6 space-y-8">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#d93025" }} />
                </div>
              ) : (
                <>
                  {/* Photos */}
                  <section>
                    <h3
                      className="text-xs font-bold uppercase tracking-widest mb-3"
                      style={{ color: "#d93025" }}
                    >
                      Photos
                    </h3>
                    {photos.length === 0 ? (
                      <p className="text-sm" style={{ color: "#64748b" }}>
                        No photos yet.
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {photos.map((p) => (
                          <div
                            key={p.id}
                            className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100"
                          >
                            <img
                              src={p.signedUrl}
                              alt={p.file_name}
                              className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => setLightboxPhoto(p)}
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmDelete({
                                  id: p.id,
                                  bucket: "student-photos",
                                  file_path: p.file_path,
                                });
                              }}
                              className="absolute top-2 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{ backgroundColor: "rgba(15,23,42,0.8)" }}
                              aria-label="Delete photo"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-white" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  {/* Videos */}
                  <section>
                    <h3
                      className="text-xs font-bold uppercase tracking-widest mb-3"
                      style={{ color: "#d93025" }}
                    >
                      Videos
                    </h3>
                    {videos.length === 0 ? (
                      <p className="text-sm" style={{ color: "#64748b" }}>
                        No videos yet.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {videos.map((v) => (
                          <div
                            key={v.id}
                            className="relative group rounded-xl overflow-hidden bg-gray-900"
                          >
                            <video
                              src={v.signedUrl}
                              controls
                              className="w-full rounded-xl"
                              style={{ maxHeight: "220px" }}
                            />
                            <button
                              onClick={() =>
                                setConfirmDelete({
                                  id: v.id,
                                  bucket: "student-videos",
                                  file_path: v.file_path,
                                })
                              }
                              className="absolute top-2 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{ backgroundColor: "rgba(15,23,42,0.8)" }}
                              aria-label="Delete video"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-white" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Photo lightbox ── */}
      {open && lightboxPhoto && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.92)" }}
          onClick={() => setLightboxPhoto(null)}
        >
          <button
            onClick={() => setLightboxPhoto(null)}
            className="absolute top-5 right-5 p-2 rounded-xl transition-colors"
            style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
            aria-label="Close lightbox"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <img
            src={lightboxPhoto.signedUrl}
            alt={lightboxPhoto.file_name}
            className="max-w-full max-h-[85vh] object-contain rounded-xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* ── Delete confirmation ── */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
        >
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-bold mb-1.5" style={{ color: "#0f172a" }}>
              Delete this file?
            </h3>
            <p className="text-sm mb-5" style={{ color: "#64748b" }}>
              This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                style={{ color: "#0f172a" }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                style={{ backgroundColor: "#d93025" }}
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
