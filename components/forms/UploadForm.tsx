"use client";
import { FormEvent, useState } from "react";
import dynamic from "next/dynamic";
import { facilityTypes } from "@/lib/validation";

const LocationPicker = dynamic(() => import("@/components/map/LocationPicker"), { ssr: false });

export default function UploadForm() {
  const [lat, setLat] = useState(37.7749);
  const [lng, setLng] = useState(-122.4194);
  const [status, setStatus] = useState<{ kind: "idle" | "loading" | "error" | "success"; message?: string; id?: string }>({ kind: "idle" });
  const [progress, setProgress] = useState(0);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus({ kind: "loading" });
    setProgress(0);
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("latitude", String(lat));
    fd.set("longitude", String(lng));
    const videos = fd.getAll("videos").filter((f) => f instanceof File && f.size > 0);
    if (videos.length < 1) return setStatus({ kind: "error", message: "Please attach at least one video." });

    await new Promise<void>((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/submissions");
      xhr.upload.onprogress = (ev) => { if (ev.lengthComputable) setProgress(Math.round((ev.loaded / ev.total) * 100)); };
      xhr.onload = () => {
        try {
          const data = JSON.parse(xhr.responseText || "{}");
          if (xhr.status >= 200 && xhr.status < 300) {
            setStatus({ kind: "success", message: "Submission received. It is pending admin review and will not appear publicly until approved.", id: data.id });
            form.reset(); setLat(37.7749); setLng(-122.4194); setProgress(100);
          } else {
            const detail = data?.details?.fieldErrors ? Object.values(data.details.fieldErrors).flat().join(" ") : data?.error;
            setStatus({ kind: "error", message: detail || "Submission failed. Please check your input." });
          }
        } catch { setStatus({ kind: "error", message: "Unexpected server response." }); }
        resolve();
      };
      xhr.onerror = () => { setStatus({ kind: "error", message: "Network error during upload." }); resolve(); };
      xhr.send(fd);
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-xl bg-white p-6 shadow-sm" encType="multipart/form-data">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm">Facility name *
          <input name="name" required minLength={2} maxLength={120} className="mt-1 w-full rounded border px-3 py-2" />
        </label>
        <label className="text-sm">Facility type *
          <select name="type" required className="mt-1 w-full rounded border px-3 py-2" defaultValue="">
            <option value="" disabled>Select type</option>
            {facilityTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
      </div>
      <label className="block text-sm">Description *
        <textarea name="description" required minLength={10} maxLength={2000} rows={4} className="mt-1 w-full rounded border px-3 py-2" />
      </label>
      <label className="block text-sm">Accessibility details (optional)
        <textarea name="accessibility" maxLength={1000} rows={3} className="mt-1 w-full rounded border px-3 py-2" />
      </label>
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Location * (click map or enter coordinates)</legend>
        <LocationPicker lat={lat} lng={lng} onChange={(a,b)=>{setLat(a);setLng(b);}} />
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm">Latitude
            <input name="latitude" type="number" step="any" min={-90} max={90} value={lat} onChange={(e)=>setLat(Number(e.target.value))} required className="mt-1 w-full rounded border px-3 py-2" />
          </label>
          <label className="text-sm">Longitude
            <input name="longitude" type="number" step="any" min={-180} max={180} value={lng} onChange={(e)=>setLng(Number(e.target.value))} required className="mt-1 w-full rounded border px-3 py-2" />
          </label>
        </div>
      </fieldset>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm">Video files * (mp4/webm/mov)
          <input name="videos" type="file" accept="video/mp4,video/webm,video/quicktime" multiple required className="mt-1 w-full rounded border px-3 py-2" />
        </label>
        <label className="text-sm">Photos (optional)
          <input name="photos" type="file" accept="image/jpeg,image/png,image/webp" multiple className="mt-1 w-full rounded border px-3 py-2" />
        </label>
      </div>
      <fieldset className="grid gap-4 md:grid-cols-3">
        <legend className="text-sm font-medium">Contact details (optional, kept private)</legend>
        <label className="text-sm">Name <input name="contactName" className="mt-1 w-full rounded border px-3 py-2" /></label>
        <label className="text-sm">Email <input name="contactEmail" type="email" className="mt-1 w-full rounded border px-3 py-2" /></label>
        <label className="text-sm">Phone <input name="contactPhone" className="mt-1 w-full rounded border px-3 py-2" /></label>
      </fieldset>
      {status.kind === "loading" && (
        <div aria-live="polite">
          <div className="h-2 w-full overflow-hidden rounded bg-slate-200"><div className="h-full bg-brand-700" style={{ width: `${progress}%` }} /></div>
          <p className="mt-1 text-sm">Uploading… {progress}%</p>
        </div>
      )}
      {status.kind === "error" && <p role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-red-800">{status.message}</p>}
      {status.kind === "success" && <p role="status" className="rounded border border-green-200 bg-green-50 p-3 text-green-800">{status.message} Reference: {status.id}</p>}
      <button disabled={status.kind === "loading"} className="rounded bg-brand-700 px-5 py-2 font-medium text-white disabled:opacity-60">Submit for review</button>
    </form>
  );
}
