import Link from "next/link";
import { facilityTypes } from "@/lib/validation";
import { getApprovedFacilities } from "@/lib/public-data";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: { q?: string; type?: string } }) {
  const q = searchParams.q || "";
  const type = searchParams.type || "";
  let facilities: Awaited<ReturnType<typeof getApprovedFacilities>> = [];
  let error = "";
  try { facilities = await getApprovedFacilities({ q, type }); } catch { error = "Unable to load facilities right now."; }

  return (
    <div className="space-y-6">
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Find and share public facilities</h1>
        <p className="mt-2 text-slate-700">Browse community-submitted facilities reviewed by administrators. Submit new locations to help others.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/upload" className="rounded bg-brand-700 px-4 py-2 text-white no-underline">Submit a facility</Link>
          <Link href="/map" className="rounded border border-brand-700 px-4 py-2 text-brand-800 no-underline">View map</Link>
        </div>
      </section>
      <form className="grid gap-3 rounded-xl bg-white p-4 shadow-sm md:grid-cols-[1fr_220px_auto]" aria-label="Search approved facilities">
        <label className="flex flex-col text-sm">Search
          <input name="q" defaultValue={q} className="mt-1 rounded border px-3 py-2" placeholder="Name or description" />
        </label>
        <label className="flex flex-col text-sm">Facility type
          <select name="type" defaultValue={type} className="mt-1 rounded border px-3 py-2">
            <option value="">All types</option>
            {facilityTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <button className="self-end rounded bg-slate-900 px-4 py-2 text-white">Filter</button>
      </form>
      {error && <p role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-red-800">{error}</p>}
      {!error && facilities.length === 0 && <p className="rounded bg-white p-6 text-slate-700 shadow-sm">No approved facilities match your search yet.</p>}
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {facilities.map((f) => (
          <li key={f.id} className="overflow-hidden rounded-xl bg-white shadow-sm">
            {f.media[0] ? (
              <img src={`/api/media/${f.media[0].id}`} alt={`${f.name} thumbnail`} className="h-40 w-full object-cover" />
            ) : <div className="flex h-40 items-center justify-center bg-slate-100 text-sm text-slate-500">No photo</div>}
            <div className="p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-brand-700">{f.type}</p>
              <h2 className="mt-1 text-lg font-semibold"><Link href={`/facilities/${f.id}`} className="no-underline hover:underline">{f.name}</Link></h2>
              <p className="mt-2 text-sm text-slate-700">{f.description.slice(0, 140)}{f.description.length > 140 ? "…" : ""}</p>
              <Link href={`/facilities/${f.id}`} className="mt-3 inline-block text-sm font-medium text-brand-800">View details</Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
