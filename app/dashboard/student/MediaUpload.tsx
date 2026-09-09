"use client";

import { useRef, useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-client";
import { Camera, Video, Loader2, Lock } from "lucide-react";

const LOCKED_MSG = "Upgrade to a paid subscription to upload photos and videos. Please ask your Parent/Guardian to select a payment plan.";

// Derive a safe, lowercase file extension. Falls back when the name has no
// dot, or when the "extension" isn't a plausible alphanumeric ext (e.g. it
// contains a space or is unreasonably long).
function safeExt(name: string, fallback: string): string {
  const dot = name.lastIndexOf(".");
  if (dot < 0 || dot === name.length - 1) return fallback;
  const ext = name.slice(dot + 1).toLowerCase();
  return /^[a-z0-9]{1,5}$/.test(ext) ? ext : fallback;
}

export default function MediaUpload({ subscriptionStatus, mediaVersion }: { subscriptionStatus: string; mediaVersion: number }) {
  const isPaid = subscriptionStatus === "paid";
  const supabase = createClient();

  const [userId, setUserId] = useState<string | null>(null);
  const [photoCount, setPhotoCount] = useState(0);
  const [videoCount, setVideoCount] = useState(0);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);
  const [photoMsg, setPhotoMsg] = useState<{ text: string; error: boolean } | null>(null);
  const [videoMsg, setVideoMsg] = useState<{ text: string; error: boolean } | null>(null);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { count: pCount } = await supabase
        .from("student_media")
        .select("*", { count: "exact", head: true })
        .eq("profile_id", user.id)
        .eq("media_type", "photo");
      setPhotoCount(pCount ?? 0);

      const { count: vCount } = await supabase
        .from("student_media")
        .select("*", { count: "exact", head: true })
        .eq("profile_id", user.id)
        .eq("media_type", "video");
      setVideoCount(vCount ?? 0);
    }
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaVersion]);

  function getVideoDuration(file: File): Promise<number> {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      const url = URL.createObjectURL(file);
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        resolve(video.duration);
      };
      video.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(0);
      };
      video.src = url;
    });
  }

  async function handlePhotoChange(file: File) {
    if (!userId) return;
    setPhotoMsg(null);

    if (file.size > 10 * 1024 * 1024) {
      setPhotoMsg({ text: "Photo must be under 10MB.", error: true });
      return;
    }

    const { count } = await supabase
      .from("student_media")
      .select("*", { count: "exact", head: true })
      .eq("profile_id", userId)
      .eq("media_type", "photo");

    if ((count ?? 0) >= 5) {
      setPhotoMsg({ text: "You have reached the maximum of 5 photos.", error: true });
      return;
    }

    setPhotoUploading(true);

    const filePath = `${userId}/photo_${Date.now()}.${safeExt(file.name, "jpg")}`;

    const { error: uploadError } = await supabase.storage
      .from("student-photos")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Photo storage upload error:", uploadError.message, uploadError.statusCode, uploadError);
      setPhotoMsg({ text: "Upload failed: " + uploadError.message, error: true });
      setPhotoUploading(false);
      return;
    }

    const { error: insertError } = await supabase.from("student_media").insert({
      profile_id: userId,
      media_type: "photo",
      file_path: filePath,
      file_name: file.name,
    });

    if (insertError) {
      console.error("Photo DB insert error:", insertError.message, insertError.code, insertError);
      setPhotoMsg({ text: "Upload failed: " + insertError.message, error: true });
      setPhotoUploading(false);
      return;
    }

    setPhotoCount((prev) => prev + 1);
    setPhotoMsg({ text: "Photo uploaded successfully!", error: false });
    setPhotoUploading(false);
  }

  async function handleVideoChange(file: File) {
    if (!userId) return;
    setVideoMsg(null);

    if (file.size > 250 * 1024 * 1024) {
      setVideoMsg({ text: "Video must be under 250MB.", error: true });
      return;
    }

    const duration = await getVideoDuration(file);
    if (duration > 60) {
      setVideoMsg({ text: "Video must be 60 seconds or less.", error: true });
      return;
    }

    const { count } = await supabase
      .from("student_media")
      .select("*", { count: "exact", head: true })
      .eq("profile_id", userId)
      .eq("media_type", "video");

    if ((count ?? 0) >= 3) {
      setVideoMsg({ text: "You have reached the maximum of 3 videos.", error: true });
      return;
    }

    setVideoUploading(true);

    const filePath = `${userId}/video_${Date.now()}.${safeExt(file.name, "mp4")}`;

    const { error: uploadError } = await supabase.storage
      .from("student-videos")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Video storage upload error:", uploadError.message, uploadError.statusCode, uploadError);
      setVideoMsg({ text: "Upload failed: " + uploadError.message, error: true });
      setVideoUploading(false);
      return;
    }

    const { error: insertError } = await supabase.from("student_media").insert({
      profile_id: userId,
      media_type: "video",
      file_path: filePath,
      file_name: file.name,
    });

    if (insertError) {
      console.error("Video DB insert error:", insertError.message, insertError.code, insertError);
      setVideoMsg({ text: "Upload failed: " + insertError.message, error: true });
      setVideoUploading(false);
      return;
    }

    setVideoCount((prev) => prev + 1);
    setVideoMsg({ text: "Video uploaded successfully!", error: false });
    setVideoUploading(false);
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Photo Upload */}
        <div>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/jpeg,image/png"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handlePhotoChange(file);
              e.target.value = "";
            }}
          />
          <button
            onClick={() => {
              if (!isPaid) {
                setPhotoMsg({ text: LOCKED_MSG, error: true });
                return;
              }
              if (!photoUploading) photoInputRef.current?.click();
            }}
            disabled={photoUploading}
            className="w-full border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center gap-2 text-center hover:border-red-300 hover:bg-red-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {photoUploading ? (
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#CE2C22" }} />
            ) : isPaid ? (
              <Camera className="w-8 h-8" style={{ color: "#CE2C22" }} />
            ) : (
              <Lock className="w-8 h-8" style={{ color: "#5A6779" }} />
            )}
            <p className="text-sm font-semibold" style={{ color: "#0f172a" }}>
              Upload Photos
            </p>
            <p className="text-xs" style={{ color: "#5A6779" }}>
              {isPaid ? `JPG, PNG up to 10MB (${photoCount}/5)` : "Paid plan required"}
            </p>
          </button>
          {photoMsg && (
            <p
              className={`text-xs mt-1.5 text-center ${
                photoMsg.error ? "text-red-600" : "text-green-600"
              }`}
            >
              {photoMsg.text}
            </p>
          )}
        </div>

        {/* Video Upload */}
        <div>
          <input
            ref={videoInputRef}
            type="file"
            accept="video/mp4,video/quicktime,.mov,.mp4"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleVideoChange(file);
              e.target.value = "";
            }}
          />
          <button
            onClick={() => {
              if (!isPaid) {
                setVideoMsg({ text: LOCKED_MSG, error: true });
                return;
              }
              if (!videoUploading) videoInputRef.current?.click();
            }}
            disabled={videoUploading}
            className="w-full border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center gap-2 text-center hover:border-red-300 hover:bg-red-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {videoUploading ? (
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#CE2C22" }} />
            ) : isPaid ? (
              <Video className="w-8 h-8" style={{ color: "#CE2C22" }} />
            ) : (
              <Lock className="w-8 h-8" style={{ color: "#5A6779" }} />
            )}
            <p className="text-sm font-semibold" style={{ color: "#0f172a" }}>
              Upload Videos
            </p>
            <p className="text-xs" style={{ color: "#5A6779" }}>
              {isPaid ? `MP4, MOV up to 250MB (${videoCount}/3)` : "Paid plan required"}
            </p>
          </button>
          {videoMsg && (
            <p
              className={`text-xs mt-1.5 text-center ${
                videoMsg.error ? "text-red-600" : "text-green-600"
              }`}
            >
              {videoMsg.text}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
