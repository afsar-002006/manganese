
-- ===== roles =====
CREATE TYPE public.app_role AS ENUM ('admin','analyst','viewer');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  org text DEFAULT 'MOIL Team',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_upsert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'analyst',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "roles_select_own" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.can_write(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','analyst'))
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)))
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'analyst')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===== domain tables =====
CREATE TABLE public.mines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  district text NOT NULL,
  state text NOT NULL,
  center_lat double precision NOT NULL,
  center_lng double precision NOT NULL,
  area_sq_km numeric NOT NULL,
  is_demo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mine_id uuid NOT NULL REFERENCES public.mines(id) ON DELETE CASCADE,
  label text NOT NULL,
  prospectivity_score numeric NOT NULL,
  category text NOT NULL,
  centroid_lat double precision NOT NULL,
  centroid_lng double precision NOT NULL,
  polygon jsonb NOT NULL,
  model_version text NOT NULL DEFAULT 'demo-prospectivity-v0.1',
  location_accuracy text NOT NULL DEFAULT 'approximate',
  is_demo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.boreholes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mine_id uuid NOT NULL REFERENCES public.mines(id) ON DELETE CASCADE,
  borehole_code text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  depth_m numeric NOT NULL,
  mn_percent numeric NOT NULL,
  logged_on date NOT NULL,
  location_accuracy text NOT NULL DEFAULT 'approximate',
  is_demo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.production_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mine_id uuid NOT NULL REFERENCES public.mines(id) ON DELETE CASCADE,
  period date NOT NULL,
  target_tonnes numeric NOT NULL,
  actual_tonnes numeric NOT NULL,
  is_demo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (mine_id, period)
);

CREATE TABLE public.forecasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mine_id uuid NOT NULL REFERENCES public.mines(id) ON DELETE CASCADE,
  period date NOT NULL,
  target_tonnes numeric NOT NULL,
  predicted_tonnes numeric NOT NULL,
  confidence numeric NOT NULL DEFAULT 0.8,
  model_version text NOT NULL DEFAULT 'demo-forecast-v0.1',
  is_demo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (mine_id, period)
);

CREATE TABLE public.shortfall_drivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mine_id uuid NOT NULL REFERENCES public.mines(id) ON DELETE CASCADE,
  period date NOT NULL,
  factor text NOT NULL,
  contribution_pct numeric NOT NULL,
  is_demo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mine_id uuid NOT NULL REFERENCES public.mines(id) ON DELETE CASCADE,
  asset_code text NOT NULL,
  asset_type text NOT NULL,
  availability_pct numeric NOT NULL,
  utilisation_pct numeric NOT NULL,
  status text NOT NULL,
  assigned_zone text,
  is_demo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.weather_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mine_id uuid NOT NULL REFERENCES public.mines(id) ON DELETE CASCADE,
  observed_on date NOT NULL,
  rainfall_mm numeric NOT NULL,
  temperature_c numeric NOT NULL,
  risk_level text NOT NULL,
  is_forecast boolean NOT NULL DEFAULT false,
  is_demo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (mine_id, observed_on)
);

CREATE TABLE public.recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mine_id uuid NOT NULL REFERENCES public.mines(id) ON DELETE CASCADE,
  rank int NOT NULL,
  title text NOT NULL,
  rationale text NOT NULL,
  impact text NOT NULL,
  category text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  generated_at timestamptz NOT NULL DEFAULT now(),
  engine_version text NOT NULL DEFAULT 'deterministic-rules-v0.1',
  is_demo boolean NOT NULL DEFAULT true
);

CREATE TABLE public.scenario_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mine_id uuid NOT NULL REFERENCES public.mines(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  inputs jsonb NOT NULL,
  outputs jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.data_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mine_id uuid REFERENCES public.mines(id) ON DELETE SET NULL,
  dataset_type text NOT NULL,
  file_name text NOT NULL,
  storage_path text NOT NULL,
  file_size_bytes bigint NOT NULL,
  mime_type text NOT NULL,
  row_count int,
  validation_status text NOT NULL DEFAULT 'pending',
  quality_score numeric,
  issues jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL,
  severity text NOT NULL DEFAULT 'info',
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mine_id uuid NOT NULL REFERENCES public.mines(id) ON DELETE CASCADE,
  title text NOT NULL,
  report_type text NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity text NOT NULL,
  entity_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- grants
GRANT SELECT ON public.mines, public.zones, public.boreholes, public.production_records,
  public.forecasts, public.shortfall_drivers, public.equipment, public.weather_records,
  public.recommendations TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.mines, public.zones, public.boreholes, public.production_records,
  public.forecasts, public.shortfall_drivers, public.equipment, public.weather_records,
  public.recommendations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scenario_runs, public.data_uploads,
  public.notifications, public.reports TO authenticated;
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.mines, public.zones, public.boreholes, public.production_records,
  public.forecasts, public.shortfall_drivers, public.equipment, public.weather_records,
  public.recommendations, public.scenario_runs, public.data_uploads, public.notifications,
  public.reports, public.audit_logs TO service_role;

-- RLS
ALTER TABLE public.mines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boreholes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shortfall_drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenario_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['mines','zones','boreholes','production_records','forecasts',
    'shortfall_drivers','equipment','weather_records','recommendations'] LOOP
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (true)', t||'_read', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (public.can_write(auth.uid()))', t||'_ins', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (public.can_write(auth.uid()))', t||'_upd', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (public.has_role(auth.uid(),''admin''))', t||'_del', t);
  END LOOP;
  FOREACH t IN ARRAY ARRAY['scenario_runs','data_uploads','notifications','reports'] LOOP
    EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)', t||'_own', t);
  END LOOP;
END $$;

CREATE POLICY "audit_read_own" ON public.audit_logs FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "audit_insert_own" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ===== DEMO SEED DATA (synthetic, not actual company figures) =====
INSERT INTO public.mines (code, name, district, state, center_lat, center_lng, area_sq_km) VALUES
 ('BAL','Balaghat Mine (DEMO)','Balaghat','Madhya Pradesh', 21.8100, 80.1850, 12.4),
 ('UKW','Ukwa Mine (DEMO)','Balaghat','Madhya Pradesh', 21.7300, 80.3900, 6.8),
 ('MUN','Munsar Mine (DEMO)','Nagpur','Maharashtra', 21.3500, 79.3100, 5.2),
 ('BEL','Beldongri Mine (DEMO)','Nagpur','Maharashtra', 21.2900, 79.2200, 4.1),
 ('KAN','Kandri Mine (DEMO)','Nagpur','Maharashtra', 21.2600, 79.2900, 3.7);

-- zones: 6 per mine
INSERT INTO public.zones (mine_id, label, prospectivity_score, category, centroid_lat, centroid_lng, polygon)
SELECT m.id,
  'Zone ' || chr(65 + ((g-1)/2)::int) || g,
  s.score,
  CASE WHEN s.score >= 75 THEN 'high' WHEN s.score >= 40 THEN 'medium' ELSE 'low' END,
  s.clat, s.clng,
  jsonb_build_array(
    jsonb_build_array(s.clat + 0.012, s.clng - 0.014),
    jsonb_build_array(s.clat + 0.010, s.clng + 0.013),
    jsonb_build_array(s.clat - 0.011, s.clng + 0.015),
    jsonb_build_array(s.clat - 0.013, s.clng - 0.012)
  )
FROM public.mines m
CROSS JOIN generate_series(1,6) g
CROSS JOIN LATERAL (
  SELECT round((22 + ((g * 37 + length(m.code) * 13) % 74))::numeric, 1) AS score,
         m.center_lat + ((g % 3) - 1) * 0.030 + ((g / 4)) * 0.012 AS clat,
         m.center_lng + ((g % 2) * 2 - 1) * 0.034 + ((g % 5) - 2) * 0.010 AS clng
) s;

-- boreholes: 36 per mine
INSERT INTO public.boreholes (mine_id, borehole_code, lat, lng, depth_m, mn_percent, logged_on)
SELECT m.id,
  m.code || '-BH' || lpad(g::text, 3, '0'),
  m.center_lat + (((g * 61) % 100) - 50) * 0.0011,
  m.center_lng + (((g * 47) % 100) - 50) * 0.0013,
  round((45 + ((g * 29) % 120))::numeric, 1),
  round((18 + ((g * 13) % 26) + 0.4)::numeric, 2),
  (date '2025-04-01' + ((g * 9) % 330))
FROM public.mines m CROSS JOIN generate_series(1,36) g;

-- production: last 12 months
INSERT INTO public.production_records (mine_id, period, target_tonnes, actual_tonnes)
SELECT m.id,
  (date_trunc('month', current_date) - ((12 - g) || ' months')::interval)::date,
  t.target,
  round(t.target * (0.82 + (((g * 17 + length(m.name)) % 20) / 100.0)), 0)
FROM public.mines m
CROSS JOIN generate_series(1,12) g
CROSS JOIN LATERAL (SELECT (6000 + (length(m.code) * 900) + ((g % 4) * 500))::numeric AS target) t;

-- forecasts: next 3 months
INSERT INTO public.forecasts (mine_id, period, target_tonnes, predicted_tonnes, confidence)
SELECT m.id,
  (date_trunc('month', current_date) + ((g - 1) || ' months')::interval)::date,
  t.target,
  round(t.target * (0.84 + (((g * 23 + length(m.name)) % 14) / 100.0)), 0),
  round((0.72 + ((g * 7) % 20) / 100.0)::numeric, 2)
FROM public.mines m
CROSS JOIN generate_series(1,3) g
CROSS JOIN LATERAL (SELECT (6000 + (length(m.code) * 900) + ((g % 4) * 500))::numeric AS target) t;

-- shortfall drivers for current month
INSERT INTO public.shortfall_drivers (mine_id, period, factor, contribution_pct)
SELECT m.id, date_trunc('month', current_date)::date, f.factor, f.pct
FROM public.mines m
CROSS JOIN (VALUES
  ('Equipment downtime', 42),
  ('Rainfall impact', 24),
  ('Blasting delay', 19),
  ('Ore availability', 10),
  ('Other factors', 5)
) AS f(factor, pct);

-- equipment
INSERT INTO public.equipment (mine_id, asset_code, asset_type, availability_pct, utilisation_pct, status, assigned_zone)
SELECT m.id,
  m.code || '-' || (ARRAY['EXC','HAUL','DRILL','LOAD'])[1 + (g % 4)] || lpad(g::text,2,'0'),
  (ARRAY['Excavator','Haul truck','Drill rig','Wheel loader'])[1 + (g % 4)],
  round((62 + ((g * 31) % 36))::numeric, 1),
  round((51 + ((g * 19) % 44))::numeric, 1),
  (ARRAY['operational','maintenance','operational','idle'])[1 + (g % 4)],
  'Zone ' || chr(65 + (g % 4)) || (1 + (g % 6))
FROM public.mines m CROSS JOIN generate_series(1,8) g;

-- weather: 10 past days + 5 forecast days
INSERT INTO public.weather_records (mine_id, observed_on, rainfall_mm, temperature_c, risk_level, is_forecast)
SELECT m.id,
  (current_date - 10 + g),
  r.rain,
  round((24 + ((g * 11 + length(m.code)) % 12))::numeric, 1),
  CASE WHEN r.rain >= 30 THEN 'high' WHEN r.rain >= 10 THEN 'moderate' ELSE 'low' END,
  (g > 10)
FROM public.mines m
CROSS JOIN generate_series(1,15) g
CROSS JOIN LATERAL (SELECT round((((g * 37 + length(m.name) * 7) % 48))::numeric, 1) AS rain) r;
