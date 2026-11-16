"use client";
import { useEffect, useMemo, useState } from "react";

type Media = { id: string; kind: "VIDEO" | "PHOTO"; mimeType: string };
type Submission = {
  id: string; name: string; type: string; description: string; accessibility?: string | null;
  latitude: number; longitude: number; submittedAt: string; status: string;
  contactName?: string | null; contactEmail?: string | null; contactPhone?: string | null; media: Media[];
};

export default function AdminReviewClient() {
  const [items, setItems] = useState<Submission[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [type, setType] = useState("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [active, setActive] = useState<Submission | null>(null);
  const [note, setNote] = useState("");
  const [reason, setReason] = useState("");
  const pageSize = 10;

  async function load() {
    setLoading(true); setError("");
    try {
      const res = await fetch(`/api/admin/submissions?status=PENDING&page=${page}&q=${encodeURIComponent(q)}&type=${encodeURIComponent(type)}`, { cache: "no-store" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setItems(data.items); setTotal(data.total);
    } catch { setError("Unable to load pending submissions."); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [page, type]);

  async function review(decision: "APPROVED" | "REJECTED") {
    if (!active) return;
    const msg = decision === "APPROVED" ? "Approve this submission? It will become publicly visible." : "Reject this submission? It will remain hidden.";
    if (!confirm(msg)) return;
    if (decision === "REJECTED" && !reason.trim()) { alert("Rejection reason is required."); return; }
    const res = await fetch(`/api/admin/submissions/${active.id}/review`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision, rejectionReason: reason, internalNote: note })
    });
    if (!res.ok) { const d = await res.json().catch(()=>({})); alert(d.error || "Review failed"); return; }
    setActive(null); setNote(""); setReason(""); load();
  }

  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-4">
      <form className="grid gap-3 rounded-xl bg-white p-4 shadow-sm md:grid-cols-[1fr_220px_auto]" onSubmit={(e)=>{e.preventDefault(); setPage(1); load();}}>
        <label className="text-sm">Search<input value={q} onChange={e=>setQ(e.target.value)} className="mt-1 w-full rounded border px-3 py-2" /></label>
        <label className="text-sm">Type<select value={type} onChange={e=>{setType(e.target.value); setPage(1);}} className="mt-1 w-full rounded border px-3 py-2"><option value="">All</option><option>Park</option><option>Library</option><option>Community Center</option><option>Restroom</option><option>Playground</option><option>Transit Stop</option><option>Health Clinic</option><option>Other</option></select></label>
        <button className="self-end rounded bg-slate-900 px-4 py-2 text-white">Search</button>
      </form>
      {error && <p role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-red-800">{error}</p>}
      {loading && <p className="rounded bg-white p-4 shadow-sm">Loading pending submissions…</p>}
      {!loading && items.length === 0 && <p className="rounded bg-white p-6 shadow-sm">No pending submissions.</p>}
      <ul className="space-y-3">
        {items.map(item => (
          <li key={item.id} className="rounded-xl bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase text-brand-700">{item.type}</p>
                <h2 className="text-lg font-semibold">{item.name}</h2>
                <p className="text-sm text-slate-700">{item.description.slice(0, 180)}{item.description.length>180?"…":""}</p>
                <p className="mt-1 text-xs text-slate-500">Submitted {new Date(item.submittedAt).toLocaleString()}</p>
              </div>
              <button className="rounded border px-3 py-2 text-sm" onClick={()=>{setActive(item); setNote(""); setReason("");}}>Review</button>
            </div>
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-3">
        <button disabled={page<=1} onClick={()=>setPage(p=>p-1)} className="rounded border px-3 py-1 disabled:opacity-50">Prev</button>
        <span className="text-sm">Page {page} of {pages}</span>
        <button disabled={page>=pages} onClick={()=>setPage(p=>p+1)} className="rounded border px-3 py-1 disabled:opacity-50">Next</button>
      </div>

      {active && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4" role="dialog" aria-modal="true">
          <div className="mx-auto max-w-4xl space-y-4 rounded-xl bg-white p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase text-brand-700">{active.type}</p>
                <h2 className="text-xl font-semibold">{active.name}</h2>
              </div>
              <button onClick={()=>setActive(null)} className="rounded border px-3 py-1">Close</button>
            </div>
            <p className="whitespace-pre-wrap text-slate-700">{active.description}</p>
            {active.accessibility && <p><span className="font-medium">Accessibility:</span> {active.accessibility}</p>}
            <p className="text-sm text-slate-600">Location: {active.latitude}, {active.longitude}</p>
            <iframe title="Submission location" className="h-64 w-full rounded border" src={`https://www.openstreetmap.org/export/embed.html?marker=${active.latitude},${active.longitude}&layer=mapnik`} />
            <div className="space-y-3">
              <h3 className="font-semibold">Videos</h3>
              {active.media.filter(m=>m.kind==="VIDEO").map(v => (
                <video key={v.id} controls className="w-full rounded"><source src={`/api/media/${v.id}`} type={v.mimeType} /></video>
              ))}
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold">Photos</h3>
              <div className="grid gap-2 sm:grid-cols-3">
                {active.media.filter(m=>m.kind==="PHOTO").map(p => <img key={p.id} src={`/api/media/${p.id}`} alt="Submission photo" className="h-40 w-full rounded object-cover" />)}
              </div>
            </div>
            {(active.contactName || active.contactEmail || active.contactPhone) && (
              <div className="rounded bg-slate-50 p-3 text-sm"><p className="font-medium">Private contact (admin-only)</p><p>{active.contactName}</p><p>{active.contactEmail}</p><p>{active.contactPhone}</p></div>
            )}
            <label className="block text-sm">Internal note (optional)<textarea value={note} onChange={e=>setNote(e.target.value)} className="mt-1 w-full rounded border px-3 py-2" rows={3} /></label>
            <label className="block text-sm">Rejection reason (required if rejecting)<textarea value={reason} onChange={e=>setReason(e.target.value)} className="mt-1 w-full rounded border px-3 py-2" rows={3} /></label>
            <div className="flex flex-wrap gap-3">
              <button onClick={()=>review("APPROVED")} className="rounded bg-green-700 px-4 py-2 text-white">Approve</button>
              <button onClick={()=>review("REJECTED")} className="rounded bg-red-700 px-4 py-2 text-white">Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
