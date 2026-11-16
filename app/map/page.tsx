import { facilityTypes } from "@/lib/validation";
import { getApprovedFacilities } from "@/lib/public-data";
import MapClient from "./MapClient";

export const dynamic = "force-dynamic";

export default async function MapPage({ searchParams }: { searchParams: { q?: string; type?: string } }) {
  const q = searchParams.q || "";
  const type = searchParams.type || "";
  let facilities: Awaited<ReturnType<typeof getApprovedFacilities>> = [];
  let error = "";
  try { facilities = await getApprovedFacilities({ q, type }); } catch { error = "Unable to load map data."; }
  const plain = facilities.map(f => ({ id: f.id, name: f.name, type: f.type, description: f.description, latitude: f.latitude, longitude: f.longitude }));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Facilities map</h1>
      <form className="grid gap-3 rounded-xl bg-white p-4 shadow-sm md:grid-cols-[1fr_220px_auto]" aria-label="Filter map facilities">
        <label className="text-sm">Search<input name="q" defaultValue={q} className="mt-1 w-full rounded border px-3 py-2" /></label>
        <label className="text-sm">Facility type
          <select name="type" defaultValue={type} className="mt-1 w-full rounded border px-3 py-2">
            <option value="">All types</option>
            {facilityTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <button className="self-end rounded bg-slate-900 px-4 py-2 text-white">Filter</button>
      </form>
      {error && <p role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-red-800">{error}</p>}
      {!error && plain.length === 0 && <p className="rounded bg-white p-6 text-slate-700 shadow-sm">No approved facilities to display yet.</p>}
      {!error && plain.length > 0 && <MapClient facilities={plain} />}
    </div>
  );
}
