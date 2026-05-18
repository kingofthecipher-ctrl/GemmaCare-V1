/**
 * Map.tsx — Offline-safe stub
 *
 * The original component loaded Google Maps via an external proxy
 * (forge.butterfly-effect.dev) which requires internet access.
 * Since GemmaCare is designed to work 100% offline, that dependency
 * has been removed. If you need mapping in a connected deployment,
 * restore the Google Maps loader and set VITE_FRONTEND_FORGE_API_KEY.
 */

import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";

interface MapViewProps {
  className?: string;
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
  onMapReady?: (map: unknown) => void;
}

export function MapView({ className }: MapViewProps) {
  return (
    <div
      className={cn(
        "w-full h-[500px] rounded-lg border border-border bg-muted flex flex-col items-center justify-center gap-3 text-muted-foreground",
        className
      )}
    >
      <MapPin className="h-8 w-8 opacity-40" />
      <p className="text-sm font-medium">Map unavailable offline</p>
      <p className="text-xs opacity-60">
        Map tiles require an internet connection
      </p>
    </div>
  );
}
