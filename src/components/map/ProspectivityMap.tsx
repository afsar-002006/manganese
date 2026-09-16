import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.heat";
import { useEffect, useMemo } from "react";
import {
  CircleMarker,
  MapContainer,
  Polygon,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import type { Borehole, Mine, ProspectivityZone } from "@/services/types";

export type MapMode = "thermal" | "zones";
export type MapBasemap = "satellite" | "terrain";

export interface MapLayers {
  prospectivity: boolean;
  geology: boolean;
  boreholes: boolean;
  faults: boolean;
  equipment: boolean;
  production: boolean;
  weather: boolean;
  blasting: boolean;
  zoneLabels?: boolean;
  satellite?: boolean;
  mode?: MapMode;
}

const CATEGORY_COLOR: Record<string, string> = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#22c55e",
};

/** Deterministic pseudo-random so the thermal cloud is stable between renders. */
function rand(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function buildHeatPoints(
  zones: ProspectivityZone[],
  boreholes: Borehole[],
): Array<[number, number, number]> {
  const pts: Array<[number, number, number]> = [];
  zones.forEach((z, zi) => {
    const score = Number(z.prospectivity_score) / 100;
    const spread = 0.012 + score * 0.01;
    for (let i = 0; i < 90; i++) {
      const s = zi * 1000 + i;
      const a = rand(s) * Math.PI * 2;
      const r = Math.sqrt(rand(s + 0.5)) * spread;
      pts.push([
        Number(z.centroid_lat) + Math.sin(a) * r,
        Number(z.centroid_lng) + Math.cos(a) * r,
        Math.max(0.08, score * (1 - r / spread)),
      ]);
    }
  });
  boreholes.forEach((b) => {
    pts.push([Number(b.lat), Number(b.lng), Math.min(1, Number(b.mn_percent) / 45)]);
  });
  return pts;
}

function HeatLayer({ points }: { points: Array<[number, number, number]> }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    const heatLayer = (L as unknown as {
      heatLayer: (pts: Array<[number, number, number]>, opts: Record<string, unknown>) => L.Layer;
    }).heatLayer;
    const layer = heatLayer(points, {
      radius: 32,
      blur: 26,
      maxZoom: 15,
      max: 1,
      minOpacity: 0.25,
      gradient: {
        0.0: "#0d3b66",
        0.25: "#22c55e",
        0.5: "#eab308",
        0.72: "#f97316",
        0.9: "#ef4444",
        1.0: "#7f1d1d",
      },
    });
    layer.addTo(map);
    return () => {
      map.removeLayer(layer);
    };
  }, [map, points]);
  return null;
}

// Synthetic layer geometry datasets
const GEOLOGY_FORMATIONS: Array<{ name: string; type: string; color: string; coords: [number, number][] }> = [
  {
    name: "Manganese Ore Bed (Gondite Formation)",
    type: "Sausar Group",
    color: "#a855f7",
    coords: [
      [21.815, 80.170],
      [21.818, 80.192],
      [21.808, 80.195],
      [21.805, 80.172],
    ],
  },
  {
    name: "Quartzo-Feldspathic Schist & Gneiss",
    type: "Tirodi Basement Gneiss",
    color: "#3b82f6",
    coords: [
      [21.792, 80.165],
      [21.804, 80.166],
      [21.802, 80.180],
      [21.790, 80.178],
    ],
  },
];

const FAULT_LINES: Array<{ name: string; coords: [number, number][] }> = [
  {
    name: "Balaghat Thrust Fault (F-1)",
    coords: [
      [21.816, 80.165],
      [21.804, 80.182],
      [21.785, 80.195],
    ],
  },
  {
    name: "Transverse Shear Fault (F-2)",
    coords: [
      [21.810, 80.195],
      [21.795, 80.170],
    ],
  },
];

const EQUIPMENT_MARKERS = [
  { code: "EX-14", type: "Excavator", lat: 21.807, lng: 80.182, status: "Active (Zone A)", color: "#22c55e" },
  { code: "DP-08", type: "Haul Truck", lat: 21.801, lng: 80.176, status: "Active (Pit B)", color: "#22c55e" },
  { code: "DR-02", type: "Blast Rig", lat: 21.795, lng: 80.174, status: "Maintenance", color: "#f59e0b" },
];

const PRODUCTION_ZONES = [
  { name: "Active Extraction Bench #4", lat: 21.799, lng: 80.177, status: "Daily Target: 2,800 T" },
  { name: "Overburden Stripping Face #2", lat: 21.806, lng: 80.185, status: "Stripping Ratio 1:4.2" },
];

const BLAST_LOCATIONS = [
  { code: "BLAST-ZONE-1", lat: 21.805, lng: 80.181, schedule: "Scheduled 14:30 hrs", hazard: "Safety Radius 500m" },
];

const WEATHER_RAINGAUGES = [
  { station: "Balaghat Mine Weather Stn #1", lat: 21.800, lng: 80.180, rainfall: "14.2 mm/hr", risk: "Moderate" },
];

export default function ProspectivityMap({
  mine,
  zones,
  boreholes,
  layers,
  selectedZoneId,
  selectedBoreholeId,
  onSelectZone,
  onSelectBorehole,
}: {
  mine: Mine;
  zones: ProspectivityZone[];
  boreholes: Borehole[];
  layers: MapLayers;
  selectedZoneId?: string | undefined;
  selectedBoreholeId?: string | undefined;
  onSelectZone?: ((zone: ProspectivityZone) => void) | undefined;
  onSelectBorehole?: ((borehole: Borehole) => void) | undefined;
}) {
  const heatPoints = useMemo(() => buildHeatPoints(zones, boreholes), [zones, boreholes]);
  const thermal = layers.mode === "thermal";

  return (
    <MapContainer
      key={mine.id}
      center={[mine.center_lat, mine.center_lng]}
      zoom={12}
      scrollWheelZoom
      style={{ height: "100%", width: "100%" }}
    >
      {layers.satellite ? (
        <TileLayer
          attribution="Tiles &copy; Esri — indicative imagery only"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />
      ) : (
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
      )}

      {/* Layer 1: Prospectivity Heatmap */}
      {thermal && layers.prospectivity && <HeatLayer points={heatPoints} />}

      {/* Layer 2: Geology Formations */}
      {layers.geology &&
        GEOLOGY_FORMATIONS.map((geo, idx) => (
          <Polygon
            key={`geo-${idx}`}
            positions={geo.coords}
            pathOptions={{
              color: geo.color,
              weight: 1.5,
              dashArray: "4, 4",
              fillColor: geo.color,
              fillOpacity: 0.18,
            }}
          >
            <Tooltip permanent direction="center" className="!bg-transparent !border-0 !shadow-none">
              <span className="rounded bg-purple-950/80 px-1.5 py-0.5 text-[9px] font-medium text-purple-200 border border-purple-500/30">
                {geo.type}
              </span>
            </Tooltip>
            <Popup>
              <div className="space-y-1 text-xs">
                <p className="font-semibold text-purple-400">{geo.name}</p>
                <p className="text-muted-foreground">{geo.type}</p>
                <p className="text-[10px] text-muted-foreground">Geological Formation Layer</p>
              </div>
            </Popup>
          </Polygon>
        ))}

      {/* Layer 4: Fault Lines */}
      {layers.faults &&
        FAULT_LINES.map((fault, idx) => (
          <Polygon
            key={`fault-${idx}`}
            positions={fault.coords}
            pathOptions={{ color: "#ef4444", weight: 3, dashArray: "6, 6" }}
          >
            <Tooltip permanent direction="center" className="!bg-transparent !border-0 !shadow-none">
              <span className="rounded bg-red-950/90 px-1 py-0.5 text-[9px] font-bold text-red-300 border border-red-500/40">
                ⚡ {fault.name}
              </span>
            </Tooltip>
          </Polygon>
        ))}

      {/* Layer 1 (Polygon mode) & Prospectivity Zone Polygons */}
      {layers.prospectivity &&
        zones.map((zone) => {
          const isSelected = selectedZoneId === zone.id;
          return (
            <Polygon
              key={zone.id}
              positions={zone.polygon}
              eventHandlers={{
                click: () => onSelectZone?.(zone),
              }}
              pathOptions={
                isSelected
                  ? { color: "#38bdf8", weight: 4, opacity: 1, fillColor: "#0284c7", fillOpacity: 0.6 }
                  : thermal
                  ? { color: "#ffffff", weight: 1.5, opacity: 0.75, fillOpacity: 0 }
                  : {
                      color: CATEGORY_COLOR[zone.category] ?? "#a855f7",
                      weight: 2,
                      fillOpacity: 0.45,
                    }
              }
            >
              {layers.zoneLabels && (
                <Tooltip
                  permanent
                  direction="center"
                  className="!bg-transparent !border-0 !shadow-none"
                >
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-semibold text-white ${
                      isSelected ? "bg-sky-600 ring-2 ring-white" : "bg-black/75"
                    }`}
                  >
                    {zone.label} · {Number(zone.prospectivity_score).toFixed(0)}%
                  </span>
                </Tooltip>
              )}
              <Popup>
                <div className="space-y-1 text-xs">
                  <p className="font-semibold text-primary">{zone.label}</p>
                  <p>
                    Modelled Prospectivity: <strong>{Number(zone.prospectivity_score).toFixed(1)}%</strong>{" "}
                    ({zone.category})
                  </p>
                  <p>Model Confidence: <strong>{zone.confidence_score ?? 82}%</strong></p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Click zone to view XAI evidence &amp; decision support details.
                  </p>
                </div>
              </Popup>
            </Polygon>
          );
        })}

      {/* Layer 3: Boreholes */}
      {layers.boreholes &&
        boreholes.map((bh) => {
          const isSelected = selectedBoreholeId === bh.id;
          return (
            <CircleMarker
              key={bh.id}
              center={[bh.lat, bh.lng]}
              radius={isSelected ? 7 : 5}
              eventHandlers={{
                click: () => onSelectBorehole?.(bh),
              }}
              pathOptions={
                isSelected
                  ? { color: "#facc15", weight: 3, fillColor: "#eab308", fillOpacity: 1 }
                  : { color: "#ffffff", weight: 1.5, fillColor: "#38bdf8", fillOpacity: 0.9 }
              }
            >
              <Popup>
                <div className="space-y-1 text-xs">
                  <p className="font-semibold">{bh.borehole_code}</p>
                  <p>Depth: <strong>{Number(bh.depth_m).toFixed(1)} m</strong></p>
                  <p>Mn Assay: <strong>{Number(bh.mn_percent).toFixed(2)}%</strong></p>
                  <p className="text-[10px] text-muted-foreground">Click marker to inspect subsurface lithology profile.</p>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

      {/* Layer 5: Equipment */}
      {layers.equipment &&
        EQUIPMENT_MARKERS.map((eq, idx) => (
          <CircleMarker
            key={`eq-${idx}`}
            center={[eq.lat, eq.lng]}
            radius={6}
            pathOptions={{ color: "#ffffff", weight: 1.5, fillColor: eq.color, fillOpacity: 0.9 }}
          >
            <Tooltip permanent direction="top" className="!bg-transparent !border-0 !shadow-none">
              <span className="rounded bg-emerald-950/90 px-1 py-0.5 text-[9px] font-bold text-emerald-300 border border-emerald-500/30">
                🚜 {eq.code}
              </span>
            </Tooltip>
            <Popup>
              <div className="space-y-1 text-xs">
                <p className="font-semibold text-emerald-400">{eq.code} ({eq.type})</p>
                <p>Status: {eq.status}</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}

      {/* Layer 6: Production Zones */}
      {layers.production &&
        PRODUCTION_ZONES.map((pz, idx) => (
          <CircleMarker
            key={`pz-${idx}`}
            center={[pz.lat, pz.lng]}
            radius={8}
            pathOptions={{ color: "#f59e0b", weight: 2, fillColor: "#d97706", fillOpacity: 0.7 }}
          >
            <Popup>
              <div className="space-y-1 text-xs">
                <p className="font-semibold text-amber-400">⛏️ {pz.name}</p>
                <p>{pz.status}</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}

      {/* Layer 7: Weather Overlay */}
      {layers.weather &&
        WEATHER_RAINGAUGES.map((wx, idx) => (
          <CircleMarker
            key={`wx-${idx}`}
            center={[wx.lat, wx.lng]}
            radius={10}
            pathOptions={{ color: "#3b82f6", weight: 2, fillColor: "#1d4ed8", fillOpacity: 0.4 }}
          >
            <Popup>
              <div className="space-y-1 text-xs">
                <p className="font-semibold text-blue-400">🌧️ {wx.station}</p>
                <p>Precipitation Rate: {wx.rainfall}</p>
                <p>Operational Risk: {wx.risk}</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}

      {/* Layer 8: Blasting */}
      {layers.blasting &&
        BLAST_LOCATIONS.map((b, idx) => (
          <CircleMarker
            key={`blast-${idx}`}
            center={[b.lat, b.lng]}
            radius={9}
            pathOptions={{ color: "#ef4444", weight: 2, fillColor: "#b91c1c", fillOpacity: 0.8 }}
          >
            <Tooltip permanent direction="bottom" className="!bg-transparent !border-0 !shadow-none">
              <span className="rounded bg-red-950/90 px-1 py-0.5 text-[9px] font-bold text-red-200 border border-red-500/40">
                💥 {b.code}
              </span>
            </Tooltip>
            <Popup>
              <div className="space-y-1 text-xs">
                <p className="font-semibold text-red-400">💥 {b.code}</p>
                <p>Schedule: {b.schedule}</p>
                <p>{b.hazard}</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
    </MapContainer>
  );
}

