
-- Drop legacy insecure tables
DROP TABLE IF EXISTS public."Agri" CASCADE;
DROP TABLE IF EXISTS public."Agri_setup" CASCADE;

-- Shared updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Compliance record type enum
CREATE TYPE public.compliance_type AS ENUM ('fertilizer', 'pesticide', 'activity');

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  farm_name text NOT NULL DEFAULT '',
  location  text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, farm_name, location)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'farm_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'location', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ PRODUCTS ============
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL DEFAULT '',
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_products_user ON public.products(user_id);

CREATE POLICY "Users select own products" ON public.products FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own products" ON public.products FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own products" ON public.products FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own products" ON public.products FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ BATCHES ============
CREATE TABLE public.batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  code text NOT NULL,
  harvest_date date NOT NULL,
  quantity text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_batches_user ON public.batches(user_id);
CREATE INDEX idx_batches_product ON public.batches(product_id);

CREATE POLICY "Users select own batches" ON public.batches FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own batches" ON public.batches FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own batches" ON public.batches FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own batches" ON public.batches FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER trg_batches_updated_at BEFORE UPDATE ON public.batches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ COMPLIANCE RECORDS ============
CREATE TABLE public.compliance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type public.compliance_type NOT NULL,
  name text NOT NULL,
  date date NOT NULL,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.compliance_records ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_compliance_user ON public.compliance_records(user_id);

CREATE POLICY "Users select own compliance" ON public.compliance_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own compliance" ON public.compliance_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own compliance" ON public.compliance_records FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own compliance" ON public.compliance_records FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER trg_compliance_updated_at BEFORE UPDATE ON public.compliance_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ LABELS ============
CREATE TABLE public.labels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  batch_id uuid NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.labels ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_labels_user ON public.labels(user_id);

CREATE POLICY "Users select own labels" ON public.labels FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own labels" ON public.labels FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own labels" ON public.labels FOR DELETE USING (auth.uid() = user_id);

-- ============ REPORTS ============
CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  batch_id uuid NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_reports_user ON public.reports(user_id);

CREATE POLICY "Users select own reports" ON public.reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own reports" ON public.reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own reports" ON public.reports FOR DELETE USING (auth.uid() = user_id);
