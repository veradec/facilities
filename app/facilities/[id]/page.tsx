import { notFound } from "next/navigation";
import { getApprovedFacility } from "@/lib/public-data";

export const dynamic = "force-dynamic";

export default async function FacilityDetail({ params }: { params: { id: string } }) {
  const facility = await getApprovedFacility(params.id);
  if (!facility) notFound();
  const videos = facility.media.filter(m => m.kind === "VIDEO");
  const photos = facility.media.filter(m => m.kind === "PHOTO");

  return (
    <article className="space-y-6">
      <header className="rounded-xl bg-white p-6 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-brand-700">{facility.type}</p>
        <h1 className="mt-1 text-3xl font-semibold">{facility.name}</h1>
        <p className="mt-3 whitespace-pre-wrap text-slate-700">{facility.description}</p>
        {facility.accessibility && <p className="mt-3 text-sm text-slate-700"><span className="font-medium">Accessibility:</span> {facility.accessibility}</p>}
        <p className="mt-3 text-sm text-slate-600">Location: {facility.latitude.toFixed(5)}, {facility.longitude.toFixed(5)}</p>
      </header>
      {photos.length > 0 && (
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Photos</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map(p => <img key={p.id} src={`/api/media/${p.id}`} alt={`${facility.name} photo`} className="h-48 w-full rounded object-cover" />)}
          </div>
        </section>
      )}
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Videos</h2>
        <div className="mt-3 space-y-4">
          {videos.map(v => (
            <video key={v.id} controls className="w-full rounded" preload="metadata">
              <source src={`/api/media/${v.id}`} type={v.mimeType} />
            </video>
          ))}
          {videos.length === 0 && <p className="text-slate-600">No approved videos available.</p>}
        </div>
      </section>
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Map location</h2>
        <iframe
          title={`Map for ${facility.name}`}
          className="mt-3 h-72 w-full rounded border"
          loading="lazy"
          src={`https://www.openstreetmap.org/export/embed.html?marker=${facility.latitude},${facility.longitude}&layer=mapnik`}
        />
      </section>
    </article>
  );
}
