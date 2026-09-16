/**
 * Data access boundary for MANGANESE INTELLIGENCE.
 *
 * The UI ONLY talks to `miningService`. The current implementation reads from
 * Lovable Cloud (Postgres + RLS). To move to a Python / PostGIS / GeoAI stack
 * later, implement `MiningDataService` against those endpoints and swap the
 * exported singleton — no component changes required.
 */

import { supabase } from "@/integrations/supabase/client";
import type {
  AppNotification,
  AuditEntry,
  Borehole,
  DataUpload,
  EquipmentAsset,
  ForecastRecord,
  Mine,
  ProductionRecord,
  ProspectivityZone,
  Recommendation,
  ReportRecord,
  ScenarioRun,
  ShortfallDriver,
  WeatherRecord,
} from "./types";

export interface MiningDataService {
  listMines(): Promise<Mine[]>;
  listZones(mineId: string): Promise<ProspectivityZone[]>;
  listBoreholes(mineId: string): Promise<Borehole[]>;
  listProduction(mineId: string): Promise<ProductionRecord[]>;
  listForecasts(mineId: string): Promise<ForecastRecord[]>;
  listShortfallDrivers(mineId: string): Promise<ShortfallDriver[]>;
  listEquipment(mineId: string): Promise<EquipmentAsset[]>;
  listWeather(mineId: string): Promise<WeatherRecord[]>;
  listRecommendations(mineId: string): Promise<Recommendation[]>;
  listUploads(): Promise<DataUpload[]>;
  listNotifications(): Promise<AppNotification[]>;
  listReports(): Promise<ReportRecord[]>;
  listScenarioRuns(mineId: string): Promise<ScenarioRun[]>;
  listAuditEntries(): Promise<AuditEntry[]>;
}

function unwrap<T>(res: { data: unknown; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return (res.data ?? []) as T;
}

export const supabaseMiningService: MiningDataService = {
  async listMines() {
    try {
      const mines = unwrap<Mine[]>(await supabase.from("mines").select("*").order("name"));
      if (mines.length > 0) return mines;
    } catch {
      // Fallback demo mine
    }
    return [
      {
        id: "d9e8f7a6-b5c4-4d3e-2f1a-0b9c8d7e6f5a",
        code: "MOIL-BAL-01",
        name: "Balaghat Mine Lease",
        district: "Balaghat",
        state: "Madhya Pradesh",
        center_lat: 21.8,
        center_lng: 80.18,
        area_sq_km: 14.5,
        is_demo: true,
      },
    ];
  },
  async listZones(mineId) {
    let rows: ProspectivityZone[] = [];
    try {
      rows = unwrap<ProspectivityZone[]>(
        await supabase
          .from("zones")
          .select("*")
          .eq("mine_id", mineId)
          .order("prospectivity_score", { ascending: false }),
      );
    } catch {
      rows = [];
    }

    if (rows.length === 0) {
      // Demo fallback zones around Balaghat (lat 21.8, lng 80.18)
      rows = [
        {
          id: "z-alpha-01",
          mine_id: mineId,
          label: "Zone A (North Block)",
          prospectivity_score: 87,
          category: "high",
          confidence_score: 82,
          centroid_lat: 21.808,
          centroid_lng: 80.184,
          polygon: [
            [21.802, 80.178],
            [21.814, 80.178],
            [21.814, 80.190],
            [21.802, 80.190],
          ],
          model_version: "GeoAI-v2.4",
          location_accuracy: "Approximate DEMO geometry",
          is_demo: true,
          geology_pct: 38,
          satellite_pct: 24,
          terrain_pct: 15,
          borehole_pct: 10,
          ai_interpretation: "Favourable geological and remote-sensing characteristics.",
          recommendation: "Prioritize this area for further geological investigation.",
          expected_production_tonnes: 82400,
          forecast_confidence_pct: 82,
          active_equipment_count: 3,
          maintenance_equipment_count: 1,
          blast_status: "Delayed 2 hrs",
          weather_status: "Moderate rainfall",
        },
        {
          id: "z-beta-02",
          mine_id: mineId,
          label: "Zone B (Central Pit)",
          prospectivity_score: 74,
          category: "medium",
          confidence_score: 79,
          centroid_lat: 21.796,
          centroid_lng: 80.175,
          polygon: [
            [21.790, 80.168],
            [21.802, 80.168],
            [21.802, 80.182],
            [21.790, 80.182],
          ],
          model_version: "GeoAI-v2.4",
          location_accuracy: "Approximate DEMO geometry",
          is_demo: true,
          geology_pct: 32,
          satellite_pct: 20,
          terrain_pct: 12,
          borehole_pct: 10,
          ai_interpretation: "Moderate Mn signatures detected along shale-gneiss contact zone.",
          recommendation: "Maintain operational stripping while monitoring pit wall stability.",
          expected_production_tonnes: 74200,
          forecast_confidence_pct: 78,
          active_equipment_count: 4,
          maintenance_equipment_count: 0,
          blast_status: "Scheduled 14:00",
          weather_status: "Light drizzle",
        },
        {
          id: "z-gamma-03",
          mine_id: mineId,
          label: "Zone C (South Ridge)",
          prospectivity_score: 48,
          category: "low",
          confidence_score: 71,
          centroid_lat: 21.788,
          centroid_lng: 80.192,
          polygon: [
            [21.782, 80.185],
            [21.794, 80.185],
            [21.794, 80.200],
            [21.782, 80.200],
          ],
          model_version: "GeoAI-v2.4",
          location_accuracy: "Approximate DEMO geometry",
          is_demo: true,
          geology_pct: 20,
          satellite_pct: 14,
          terrain_pct: 8,
          borehole_pct: 6,
          ai_interpretation: "Low hydrothermal activity; thick lateritic cover masking bedrock.",
          recommendation: "Perform deep resistivity geophysical survey prior to drilling.",
          expected_production_tonnes: 45000,
          forecast_confidence_pct: 71,
          active_equipment_count: 1,
          maintenance_equipment_count: 2,
          blast_status: "No blasting",
          weather_status: "Clear",
        },
      ];
    }

    return rows.map((z, idx) => ({
      ...z,
      polygon: (z.polygon as [number, number][]) ?? [],
      confidence_score: z.confidence_score ?? Math.round(75 + (Number(z.prospectivity_score) % 15)),
      geology_pct: z.geology_pct ?? (idx === 0 ? 38 : 30),
      satellite_pct: z.satellite_pct ?? (idx === 0 ? 24 : 20),
      terrain_pct: z.terrain_pct ?? (idx === 0 ? 15 : 12),
      borehole_pct: z.borehole_pct ?? (idx === 0 ? 10 : 8),
      ai_interpretation: z.ai_interpretation ?? "Favourable geological and remote-sensing characteristics.",
      recommendation: z.recommendation ?? "Prioritize this area for further geological investigation.",
      expected_production_tonnes: z.expected_production_tonnes ?? (idx === 0 ? 82400 : 74000),
      forecast_confidence_pct: z.forecast_confidence_pct ?? 82,
      active_equipment_count: z.active_equipment_count ?? (idx === 0 ? 3 : 4),
      maintenance_equipment_count: z.maintenance_equipment_count ?? (idx === 0 ? 1 : 0),
      blast_status: z.blast_status ?? (idx === 0 ? "Delayed 2 hrs" : "Active"),
      weather_status: z.weather_status ?? "Moderate rainfall",
    }));
  },
  async listBoreholes(mineId) {
    let rows: Borehole[] = [];
    try {
      rows = unwrap<Borehole[]>(
        await supabase.from("boreholes").select("*").eq("mine_id", mineId).order("borehole_code"),
      );
    } catch {
      rows = [];
    }

    const defaultLithology = [
      { depth_from_m: 0, depth_to_m: 20, formation: "Laterite & Topsoil" },
      { depth_from_m: 20, depth_to_m: 65, formation: "Weathered Shale" },
      { depth_from_m: 65, depth_to_m: 95, formation: "Mn-bearing Gondite & Ore" },
      { depth_from_m: 95, depth_to_m: 120, formation: "Granitoid Basement" },
    ];
    const defaultPurpose = ["Subsurface evidence", "Geological context", "Model validation"];

    if (rows.length === 0) {
      rows = [
        {
          id: "bh-014",
          mine_id: mineId,
          borehole_code: "BH-014",
          lat: 21.808,
          lng: 80.184,
          depth_m: 120,
          mn_percent: 7.8,
          logged_on: "2025-11-12",
          location_accuracy: "DEMO record — approximate location",
          is_demo: true,
          lithology: defaultLithology,
          purpose_highlights: defaultPurpose,
        },
        {
          id: "bh-018",
          mine_id: mineId,
          borehole_code: "BH-018",
          lat: 21.796,
          lng: 80.175,
          depth_m: 145,
          mn_percent: 12.4,
          logged_on: "2025-11-14",
          location_accuracy: "DEMO record — approximate location",
          is_demo: true,
          lithology: defaultLithology,
          purpose_highlights: defaultPurpose,
        },
        {
          id: "bh-022",
          mine_id: mineId,
          borehole_code: "BH-022",
          lat: 21.788,
          lng: 80.192,
          depth_m: 98,
          mn_percent: 4.2,
          logged_on: "2025-11-18",
          location_accuracy: "DEMO record — approximate location",
          is_demo: true,
          lithology: defaultLithology,
          purpose_highlights: defaultPurpose,
        },
      ];
    }

    return rows.map((b) => ({
      ...b,
      lithology: b.lithology ?? defaultLithology,
      purpose_highlights: b.purpose_highlights ?? defaultPurpose,
    }));
  },
  async listProduction(mineId) {
    return unwrap<ProductionRecord[]>(
      await supabase.from("production_records").select("*").eq("mine_id", mineId).order("period"),
    );
  },
  async listForecasts(mineId) {
    return unwrap<ForecastRecord[]>(
      await supabase.from("forecasts").select("*").eq("mine_id", mineId).order("period"),
    );
  },
  async listShortfallDrivers(mineId) {
    return unwrap<ShortfallDriver[]>(
      await supabase
        .from("shortfall_drivers")
        .select("*")
        .eq("mine_id", mineId)
        .order("contribution_pct", { ascending: false }),
    );
  },
  async listEquipment(mineId) {
    return unwrap<EquipmentAsset[]>(
      await supabase.from("equipment").select("*").eq("mine_id", mineId).order("asset_code"),
    );
  },
  async listWeather(mineId) {
    return unwrap<WeatherRecord[]>(
      await supabase.from("weather_records").select("*").eq("mine_id", mineId).order("observed_on"),
    );
  },
  async listRecommendations(mineId) {
    return unwrap<Recommendation[]>(
      await supabase.from("recommendations").select("*").eq("mine_id", mineId).order("rank"),
    );
  },
  async listUploads() {
    return unwrap<DataUpload[]>(
      await supabase.from("data_uploads").select("*").order("created_at", { ascending: false }),
    );
  },
  async listNotifications() {
    return unwrap<AppNotification[]>(
      await supabase.from("notifications").select("*").order("created_at", { ascending: false }),
    );
  },
  async listReports() {
    return unwrap<ReportRecord[]>(
      await supabase.from("reports").select("*").order("created_at", { ascending: false }),
    );
  },
  async listScenarioRuns(mineId) {
    return unwrap<ScenarioRun[]>(
      await supabase
        .from("scenario_runs")
        .select("*")
        .eq("mine_id", mineId)
        .order("created_at", { ascending: false })
        .limit(10),
    );
  },
  async listAuditEntries() {
    return unwrap<AuditEntry[]>(
      await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100),
    );
  },
};

export const miningService: MiningDataService = supabaseMiningService;
