/**
 * Server-side intelligence layer.
 *
 * Every function here runs on the server with the caller's identity (RLS
 * applies). The deterministic engines below are intentionally rule-based and
 * versioned so they can be swapped for Python / GeoAI services later.
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const RECO_ENGINE_VERSION = "deterministic-rules-v0.1";

async function writeAudit(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
  action: string,
  entity: string,
  entityId: string | null,
  metadata: Record<string, unknown> = {},
) {
  await supabase
    .from("audit_logs")
    .insert({ user_id: userId, action, entity, entity_id: entityId, metadata });
}

/* ------------------------------------------------------------------ */
/* Deterministic recommendation engine                                  */
/* ------------------------------------------------------------------ */

export const generateRecommendations = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { mineId: string }) => z.object({ mineId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const mineId = data.mineId;

    const [mineRes, equipRes, weatherRes, zonesRes, driversRes, prodRes] = await Promise.all([
      supabase.from("mines").select("*").eq("id", mineId).single(),
      supabase.from("equipment").select("*").eq("mine_id", mineId),
      supabase.from("weather_records").select("*").eq("mine_id", mineId).eq("is_forecast", true),
      supabase
        .from("zones")
        .select("*")
        .eq("mine_id", mineId)
        .order("prospectivity_score", { ascending: false }),
      supabase
        .from("shortfall_drivers")
        .select("*")
        .eq("mine_id", mineId)
        .order("contribution_pct", { ascending: false }),
      supabase
        .from("production_records")
        .select("*")
        .eq("mine_id", mineId)
        .order("period", { ascending: false })
        .limit(3),
    ]);

    if (mineRes.error) throw new Error(mineRes.error.message);

    const equipment = equipRes.data ?? [];
    const weather = weatherRes.data ?? [];
    const zones = zonesRes.data ?? [];
    const drivers = driversRes.data ?? [];
    const production = prodRes.data ?? [];

    type Draft = { title: string; rationale: string; impact: string; category: string; weight: number };
    const drafts: Draft[] = [];

    // Rule 1 — idle / low-availability assets vs. best prospectivity zone
    const idle = equipment
      .filter((e) => e.status === "idle" || Number(e.availability_pct) < 70)
      .sort((a, b) => Number(a.availability_pct) - Number(b.availability_pct));
    const topZone = zones[0];
    if (idle.length > 0 && topZone) {
      const asset = idle[0]!;
      drafts.push({
        title: `Redeploy ${asset.asset_code} to ${topZone.label} (highest prospectivity, low current activity)`,
        rationale: `${asset.asset_type} ${asset.asset_code} is ${asset.status} at ${Number(asset.availability_pct).toFixed(0)}% availability while ${topZone.label} carries the highest modelled prospectivity score (${Number(topZone.prospectivity_score).toFixed(1)}).`,
        impact: idle.length > 2 ? "High" : "Medium",
        category: "equipment",
        weight: 100 - Number(asset.availability_pct),
      });
    }

    // Rule 2 — rainfall risk in the forecast window
    const wettest = [...weather].sort((a, b) => Number(b.rainfall_mm) - Number(a.rainfall_mm))[0];
    if (wettest && Number(wettest.rainfall_mm) >= 10) {
      drafts.push({
        title: `Prioritise accessible zones — ${Number(wettest.rainfall_mm).toFixed(0)} mm rainfall expected on ${wettest.observed_on}`,
        rationale: `Forecast rainfall reaches ${Number(wettest.rainfall_mm).toFixed(0)} mm (${wettest.risk_level} risk). Sequence haulage on drained benches before that window and defer low-lying faces.`,
        impact: Number(wettest.rainfall_mm) >= 30 ? "High" : "Medium",
        category: "weather",
        weight: Number(wettest.rainfall_mm),
      });
    }

    // Rule 3 — dominant shortfall driver
    const topDriver = drivers[0];
    if (topDriver) {
      drafts.push({
        title: `Attack "${topDriver.factor}" — ${Number(topDriver.contribution_pct).toFixed(0)}% of the current shortfall`,
        rationale: `Attribution analysis assigns ${Number(topDriver.contribution_pct).toFixed(0)}% of this month's gap to ${topDriver.factor.toLowerCase()}. A targeted intervention here has the largest single effect on closing the gap.`,
        impact: Number(topDriver.contribution_pct) >= 35 ? "High" : "Medium",
        category: "production",
        weight: Number(topDriver.contribution_pct),
      });
    }

    // Rule 4 — persistent under-delivery trend
    const gaps = production.map((p) => Number(p.target_tonnes) - Number(p.actual_tonnes));
    if (gaps.length >= 2 && gaps.every((g) => g > 0)) {
      const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
      drafts.push({
        title: `Re-baseline monthly target — ${gaps.length} consecutive months short by ~${Math.round(avgGap).toLocaleString("en-IN")} T`,
        rationale: `The last ${gaps.length} recorded months all closed below target with an average gap of ${Math.round(avgGap).toLocaleString("en-IN")} tonnes. Either the plan or the constraint set needs revision before the next cycle.`,
        impact: avgGap > 1000 ? "High" : "Medium",
        category: "planning",
        weight: avgGap / 20,
      });
    }

    // Rule 5 — under-explored high prospectivity ground
    const highZones = zones.filter((z) => z.category === "high");
    if (highZones.length > 0) {
      const bhRes = await supabase.from("boreholes").select("id").eq("mine_id", mineId);
      const bhCount = (bhRes.data ?? []).length;
      if (bhCount / Math.max(highZones.length, 1) < 15) {
        drafts.push({
          title: `Add drilling coverage across ${highZones.length} high-prospectivity zone(s)`,
          rationale: `Only ${bhCount} borehole records support ${highZones.length} high-prospectivity zones. Additional drilling would reduce model uncertainty before any commitment of development capital.`,
          impact: "Medium",
          category: "exploration",
          weight: 40,
        });
      }
    }

    const ranked = drafts.sort((a, b) => b.weight - a.weight).slice(0, 6);

    await supabase.from("recommendations").delete().eq("mine_id", mineId);
    if (ranked.length > 0) {
      const insertRes = await supabase.from("recommendations").insert(
        ranked.map((d, i) => ({
          mine_id: mineId,
          rank: i + 1,
          title: d.title,
          rationale: d.rationale,
          impact: d.impact,
          category: d.category,
          engine_version: RECO_ENGINE_VERSION,
        })),
      );
      if (insertRes.error) throw new Error(insertRes.error.message);
    }

    await supabase.from("notifications").insert({
      user_id: userId,
      title: `Recommendations refreshed — ${mineRes.data.name}`,
      body: `${ranked.length} prioritised action(s) generated by ${RECO_ENGINE_VERSION}.`,
      severity: "info",
    });

    await writeAudit(supabase, userId, "generate_recommendations", "mine", mineId, {
      count: ranked.length,
      engine: RECO_ENGINE_VERSION,
    });

    return { count: ranked.length, engine: RECO_ENGINE_VERSION };
  });

/* ------------------------------------------------------------------ */
/* Scenario simulator                                                   */
/* ------------------------------------------------------------------ */

const scenarioSchema = z.object({
  mineId: z.string().uuid(),
  name: z.string().trim().min(1).max(80),
  equipmentAvailabilityPct: z.number().min(40).max(100),
  rainfallDays: z.number().min(0).max(30),
  workingDays: z.number().min(10).max(31),
  blastingEfficiencyPct: z.number().min(40).max(120),
});

export const runScenario = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => scenarioSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const baseRes = await supabase
      .from("forecasts")
      .select("*")
      .eq("mine_id", data.mineId)
      .order("period")
      .limit(1)
      .maybeSingle();
    if (baseRes.error) throw new Error(baseRes.error.message);

    const target = Number(baseRes.data?.target_tonnes ?? 8000);
    const baseline = Number(baseRes.data?.predicted_tonnes ?? target * 0.87);

    // Deterministic, explainable multiplicative model.
    const availabilityFactor = data.equipmentAvailabilityPct / 78;
    const rainFactor = 1 - Math.min(data.rainfallDays, 30) * 0.011;
    const daysFactor = data.workingDays / 26;
    const blastFactor = 0.6 + (data.blastingEfficiencyPct / 100) * 0.4;

    const projected = Math.round(baseline * availabilityFactor * rainFactor * daysFactor * blastFactor);
    const delta = projected - Math.round(baseline);
    const shortfall = Math.max(target - projected, 0);

    const outputs = {
      target_tonnes: target,
      baseline_tonnes: Math.round(baseline),
      projected_tonnes: projected,
      delta_vs_baseline: delta,
      shortfall_tonnes: shortfall,
      shortfall_pct: Number(((shortfall / target) * 100).toFixed(1)),
      availability_factor: Number(availabilityFactor.toFixed(3)),
      rainfall_factor: Number(rainFactor.toFixed(3)),
      working_days_factor: Number(daysFactor.toFixed(3)),
      blasting_factor: Number(blastFactor.toFixed(3)),
      model_version: "scenario-multiplicative-v0.1",
    };

    const insertRes = await supabase
      .from("scenario_runs")
      .insert({
        mine_id: data.mineId,
        user_id: userId,
        name: data.name,
        inputs: {
          equipmentAvailabilityPct: data.equipmentAvailabilityPct,
          rainfallDays: data.rainfallDays,
          workingDays: data.workingDays,
          blastingEfficiencyPct: data.blastingEfficiencyPct,
        },
        outputs,
      })
      .select("id")
      .single();
    if (insertRes.error) throw new Error(insertRes.error.message);

    await writeAudit(supabase, userId, "run_scenario", "scenario_run", insertRes.data.id, {
      mine_id: data.mineId,
    });

    return { id: insertRes.data.id as string, outputs };
  });

/* ------------------------------------------------------------------ */
/* Upload registration + validation                                     */
/* ------------------------------------------------------------------ */

const uploadSchema = z.object({
  mineId: z.string().uuid().nullable(),
  datasetType: z.enum(["borehole", "production", "equipment", "weather", "geospatial", "other"]),
  fileName: z.string().trim().min(1).max(200),
  storagePath: z.string().trim().min(1).max(400),
  fileSizeBytes: z.number().int().positive().max(25 * 1024 * 1024),
  mimeType: z.string().trim().min(1).max(120),
  headerLine: z.string().max(2000).optional(),
  rowCount: z.number().int().min(0).max(5_000_000).optional(),
});

const EXPECTED_HEADERS: Record<string, string[]> = {
  borehole: ["borehole_code", "lat", "lng", "depth_m", "mn_percent"],
  production: ["period", "target_tonnes", "actual_tonnes"],
  equipment: ["asset_code", "asset_type", "availability_pct", "status"],
  weather: ["observed_on", "rainfall_mm", "temperature_c"],
  geospatial: [],
  other: [],
};

export const registerUpload = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => uploadSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const issues: string[] = [];
    const expected = EXPECTED_HEADERS[data.datasetType] ?? [];
    const found = (data.headerLine ?? "")
      .split(/[,;\t]/)
      .map((h) => h.trim().toLowerCase().replace(/["']/g, ""));

    if (expected.length > 0) {
      if (!data.headerLine) {
        issues.push("No header row could be read from the file.");
      } else {
        for (const col of expected) {
          if (!found.includes(col)) issues.push(`Missing expected column: ${col}`);
        }
      }
    }
    if (data.rowCount != null && data.rowCount === 0) issues.push("File contains no data rows.");
    if (data.fileSizeBytes > 10 * 1024 * 1024)
      issues.push("Large file — processing may be queued.");

    const blocking = issues.filter((i) => i.startsWith("Missing") || i.includes("no data"));
    const status = blocking.length > 0 ? "failed" : issues.length > 0 ? "warning" : "passed";
    const quality = Math.max(0, 100 - blocking.length * 25 - (issues.length - blocking.length) * 5);

    const res = await supabase
      .from("data_uploads")
      .insert({
        user_id: userId,
        mine_id: data.mineId,
        dataset_type: data.datasetType,
        file_name: data.fileName,
        storage_path: data.storagePath,
        file_size_bytes: data.fileSizeBytes,
        mime_type: data.mimeType,
        row_count: data.rowCount ?? null,
        validation_status: status,
        quality_score: quality,
        issues,
      })
      .select("id")
      .single();
    if (res.error) throw new Error(res.error.message);

    await supabase.from("notifications").insert({
      user_id: userId,
      title: `Upload ${status}: ${data.fileName}`,
      body:
        issues.length > 0
          ? `${issues.length} data-quality issue(s) detected. Quality score ${quality}/100.`
          : `Validation passed with a quality score of ${quality}/100.`,
      severity: status === "failed" ? "critical" : status === "warning" ? "warning" : "info",
    });

    await writeAudit(supabase, userId, "register_upload", "data_upload", res.data.id, {
      dataset_type: data.datasetType,
      status,
    });

    return { id: res.data.id as string, status, quality, issues };
  });

/* ------------------------------------------------------------------ */
/* Report generation                                                    */
/* ------------------------------------------------------------------ */

export const generateReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        mineId: z.string().uuid(),
        reportType: z.enum(["monthly_operations", "exploration_summary", "shortfall_analysis"]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const [mineRes, prodRes, forecastRes, driversRes, zonesRes, equipRes] = await Promise.all([
      supabase.from("mines").select("*").eq("id", data.mineId).single(),
      supabase
        .from("production_records")
        .select("*")
        .eq("mine_id", data.mineId)
        .order("period", { ascending: false })
        .limit(6),
      supabase.from("forecasts").select("*").eq("mine_id", data.mineId).order("period"),
      supabase.from("shortfall_drivers").select("*").eq("mine_id", data.mineId),
      supabase.from("zones").select("*").eq("mine_id", data.mineId),
      supabase.from("equipment").select("*").eq("mine_id", data.mineId),
    ]);
    if (mineRes.error) throw new Error(mineRes.error.message);

    const production = (prodRes.data ?? []).slice().reverse();
    const zones = zonesRes.data ?? [];
    const equipment = equipRes.data ?? [];

    const totalActual = production.reduce((s, p) => s + Number(p.actual_tonnes), 0);
    const totalTarget = production.reduce((s, p) => s + Number(p.target_tonnes), 0);
    const avgAvailability =
      equipment.length > 0
        ? equipment.reduce((s, e) => s + Number(e.availability_pct), 0) / equipment.length
        : 0;

    const payload = {
      mine: mineRes.data.name,
      district: mineRes.data.district,
      generated_at: new Date().toISOString(),
      data_basis: "Synthetic DEMO data — not actual company figures",
      totals: {
        actual_tonnes: totalActual,
        target_tonnes: totalTarget,
        achievement_pct: totalTarget ? Number(((totalActual / totalTarget) * 100).toFixed(1)) : 0,
      },
      production_series: production.map((p) => ({
        period: p.period,
        target: Number(p.target_tonnes),
        actual: Number(p.actual_tonnes),
      })),
      forecast_series: (forecastRes.data ?? []).map((f) => ({
        period: f.period,
        target: Number(f.target_tonnes),
        predicted: Number(f.predicted_tonnes),
      })),
      shortfall_drivers: (driversRes.data ?? []).map((d) => ({
        factor: d.factor,
        contribution_pct: Number(d.contribution_pct),
      })),
      prospectivity: {
        zones_assessed: zones.length,
        high_prospectivity_zones: zones.filter((z) => z.category === "high").length,
        note: "Prospectivity scores indicate modelled favourability, not confirmed reserves.",
      },
      equipment: {
        assets: equipment.length,
        average_availability_pct: Number(avgAvailability.toFixed(1)),
      },
    };

    const periods = production.map((p) => p.period as string).sort();
    const res = await supabase
      .from("reports")
      .insert({
        user_id: userId,
        mine_id: data.mineId,
        title: `${data.reportType.replace(/_/g, " ")} — ${mineRes.data.name}`,
        report_type: data.reportType,
        period_start: periods[0] ?? new Date().toISOString().slice(0, 10),
        period_end: periods[periods.length - 1] ?? new Date().toISOString().slice(0, 10),
        payload,
      })
      .select("id")
      .single();
    if (res.error) throw new Error(res.error.message);

    await writeAudit(supabase, userId, "generate_report", "report", res.data.id, {
      report_type: data.reportType,
    });

    return { id: res.data.id as string };
  });

/* ------------------------------------------------------------------ */
/* Notifications                                                        */
/* ------------------------------------------------------------------ */

export const markNotificationsRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ ids: z.array(z.string().uuid()).max(200) }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    if (data.ids.length === 0) return { updated: 0 };
    const res = await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .in("id", data.ids)
      .eq("user_id", userId);
    if (res.error) throw new Error(res.error.message);
    return { updated: data.ids.length };
  });

/* ------------------------------------------------------------------ */
/* Data pipeline health                                                 */
/* ------------------------------------------------------------------ */

export const getPipelineHealth = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ mineId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const mineId = data.mineId;

    const [bh, prod, eq, wx, zones] = await Promise.all([
      supabase.from("boreholes").select("id, mn_percent, depth_m").eq("mine_id", mineId),
      supabase.from("production_records").select("id, period").eq("mine_id", mineId),
      supabase.from("equipment").select("id, availability_pct").eq("mine_id", mineId),
      supabase.from("weather_records").select("id, observed_on").eq("mine_id", mineId),
      supabase.from("zones").select("id, prospectivity_score").eq("mine_id", mineId),
    ]);

    const sets = [
      { name: "Borehole logs", rows: (bh.data ?? []).length, expected: 30 },
      { name: "Production records", rows: (prod.data ?? []).length, expected: 12 },
      { name: "Equipment registry", rows: (eq.data ?? []).length, expected: 8 },
      { name: "Weather observations", rows: (wx.data ?? []).length, expected: 15 },
      { name: "Prospectivity zones", rows: (zones.data ?? []).length, expected: 6 },
    ];

    return {
      sets: sets.map((s) => ({
        ...s,
        completeness_pct: Math.min(100, Math.round((s.rows / s.expected) * 100)),
        status: s.rows >= s.expected ? "healthy" : s.rows > 0 ? "partial" : "missing",
      })),
      overall_pct: Math.round(
        sets.reduce((acc, s) => acc + Math.min(100, (s.rows / s.expected) * 100), 0) / sets.length,
      ),
      last_checked: new Date().toISOString(),
    };
  });
