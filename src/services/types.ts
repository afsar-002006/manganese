/**
 * Domain types for the MANGANESE INTELLIGENCE platform.
 *
 * These types are deliberately transport-agnostic so the service layer
 * (see `mining-service.ts`) can later be re-pointed at a Python / PostGIS /
 * GeoAI backend without touching any UI component.
 */

export interface Mine {
  id: string;
  code: string;
  name: string;
  district: string;
  state: string;
  center_lat: number;
  center_lng: number;
  area_sq_km: number;
  is_demo: boolean;
}

export interface ContributingFactor {
  name: string;
  contribution_pct: number;
}

export interface ProspectivityZone {
  id: string;
  mine_id: string;
  label: string;
  prospectivity_score: number;
  category: "high" | "medium" | "low" | string;
  confidence_score?: number;
  centroid_lat: number;
  centroid_lng: number;
  /** [[lat, lng], ...] ring — approximate demo geometry, not survey grade. */
  polygon: [number, number][];
  model_version: string;
  location_accuracy: string;
  is_demo: boolean;

  // Decision Support System Extensions
  geology_pct?: number;
  satellite_pct?: number;
  terrain_pct?: number;
  borehole_pct?: number;
  ai_interpretation?: string;
  recommendation?: string;
  expected_production_tonnes?: number;
  forecast_confidence_pct?: number;
  active_equipment_count?: number;
  maintenance_equipment_count?: number;
  blast_status?: string;
  weather_status?: string;
}

export interface BoreholeLithologyLayer {
  depth_from_m: number;
  depth_to_m: number;
  formation: string;
}

export interface Borehole {
  id: string;
  mine_id: string;
  borehole_code: string;
  lat: number;
  lng: number;
  depth_m: number;
  mn_percent: number;
  logged_on: string;
  location_accuracy: string;
  is_demo: boolean;
  lithology?: BoreholeLithologyLayer[];
  purpose_highlights?: string[];
}

export interface ProductionRecord {
  id: string;
  mine_id: string;
  period: string;
  target_tonnes: number;
  actual_tonnes: number;
}

export interface ForecastRecord {
  id: string;
  mine_id: string;
  period: string;
  target_tonnes: number;
  predicted_tonnes: number;
  confidence: number;
  model_version: string;
}

export interface ShortfallDriver {
  id: string;
  mine_id: string;
  period: string;
  factor: string;
  contribution_pct: number;
}

export interface EquipmentAsset {
  id: string;
  mine_id: string;
  asset_code: string;
  asset_type: string;
  availability_pct: number;
  utilisation_pct: number;
  status: string;
  assigned_zone: string | null;
}

export interface WeatherRecord {
  id: string;
  mine_id: string;
  observed_on: string;
  rainfall_mm: number;
  temperature_c: number;
  risk_level: string;
  is_forecast: boolean;
}

export interface Recommendation {
  id: string;
  mine_id: string;
  rank: number;
  title: string;
  rationale: string;
  impact: string;
  category: string;
  status: string;
  generated_at: string;
  engine_version: string;
}

export interface DataUpload {
  id: string;
  mine_id: string | null;
  dataset_type: string;
  file_name: string;
  storage_path: string;
  file_size_bytes: number;
  mime_type: string;
  row_count: number | null;
  validation_status: string;
  quality_score: number | null;
  issues: string[];
  created_at: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  severity: string;
  read_at: string | null;
  created_at: string;
}

export interface ReportRecord {
  id: string;
  mine_id: string;
  title: string;
  report_type: string;
  period_start: string;
  period_end: string;
  payload: Record<string, unknown>;
  created_at: string;
}

export interface ScenarioRun {
  id: string;
  mine_id: string;
  name: string;
  inputs: Record<string, number>;
  outputs: Record<string, number | string>;
  created_at: string;
}

export interface AuditEntry {
  id: string;
  action: string;
  entity: string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}
