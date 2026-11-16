"use client";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";
import { useEffect } from "react";

const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41]
});

type Facility = { id: string; name: string; type: string; description: string; latitude: number; longitude: number };

function FitBounds({ facilities }: { facilities: Facility[] }) {
  const map = useMap();
  useEffect(() => {
    if (facilities.length > 0) {
      const bounds = L.latLngBounds(facilities.map(f => [f.latitude, f.longitude] as [number, number]));
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 14 });
    }
  }, [facilities, map]);
  return null;
}

export default function PublicMap({ facilities }: { facilities: Facility[] }) {
  const tile = process.env.NEXT_PUBLIC_MAP_TILE_URL || "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const attr = process.env.NEXT_PUBLIC_MAP_ATTRIBUTION || "&copy; OpenStreetMap contributors";
  const center: [number, number] = facilities.length ? [facilities[0].latitude, facilities[0].longitude] : [37.7749, -122.4194];
  return (
    <MapContainer center={center} zoom={facilities.length ? 12 : 2} style={{ height: 520, width: "100%" }} className="rounded-xl border">
      <TileLayer url={tile} attribution={attr} />
      {facilities.map(f => (
        <Marker key={f.id} position={[f.latitude, f.longitude]} icon={icon}>
          <Popup>
            <div className="max-w-xs">
              <p className="text-xs font-semibold uppercase text-brand-700">{f.type}</p>
              <p className="font-semibold">{f.name}</p>
              <p className="text-sm">{f.description.slice(0, 120)}{f.description.length > 120 ? "…" : ""}</p>
              <Link href={`/facilities/${f.id}`} className="text-sm font-medium text-brand-800">View details</Link>
            </div>
          </Popup>
        </Marker>
      ))}
      <FitBounds facilities={facilities} />
    </MapContainer>
  );
}
