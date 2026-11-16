"use client";
import dynamic from "next/dynamic";

const PublicMap = dynamic(() => import("@/components/map/PublicMap"), { ssr: false });

export default function MapClient({ facilities }: { facilities: { id: string; name: string; type: string; description: string; latitude: number; longitude: number }[] }) {
  return <PublicMap facilities={facilities} />;
}
