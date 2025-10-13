-- Create ingredients toxicity database
CREATE TABLE public.ingredients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  hazard_score INTEGER NOT NULL CHECK (hazard_score >= 1 AND hazard_score <= 5),
  hazard_type TEXT NOT NULL,
  regulatory_flag TEXT,
  description TEXT,
  alternatives TEXT,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  brand TEXT,
  category TEXT,
  image_url TEXT,
  ingredients_raw TEXT,
  toxiscore NUMERIC(5,2),
  color_code TEXT CHECK (color_code IN ('green', 'yellow', 'red')),
  flagged_ingredients JSONB,
  summary TEXT,
  alternatives JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ingredients (public read, admin write)
CREATE POLICY "Anyone can view ingredients"
ON public.ingredients
FOR SELECT
USING (true);

-- RLS Policies for products (users can only see their own)
CREATE POLICY "Users can view their own products"
ON public.products
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own products"
ON public.products
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own products"
ON public.products
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products"
ON public.products
FOR DELETE
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_ingredients_updated_at
BEFORE UPDATE ON public.ingredients
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed with common hazardous ingredients
INSERT INTO public.ingredients (name, hazard_score, hazard_type, regulatory_flag, description, alternatives, source) VALUES
('Sodium Lauryl Sulfate', 3, 'irritant', 'FDA approved', 'May cause skin and eye irritation, especially with prolonged exposure', 'Sodium Cocoyl Isethionate, Cocamidopropyl Betaine', 'EWG Skin Deep Database'),
('Paraben', 4, 'hormone disruptor', 'EU restricted', 'Linked to hormone disruption and potential reproductive toxicity', 'Phenoxyethanol, Leucidal Liquid', 'FDA Consumer Update'),
('Fragrance', 3, 'allergen', 'FDA approved', 'May trigger allergic reactions and respiratory issues', 'Essential oils, Natural extracts', 'American Academy of Dermatology'),
('Formaldehyde', 5, 'carcinogen', 'EU banned', 'Known carcinogen, can cause cancer with long-term exposure', 'Grapefruit seed extract, Vitamin E', 'IARC Classification'),
('Triclosan', 4, 'hormone disruptor', 'FDA banned in soaps', 'Disrupts thyroid hormones and may contribute to antibiotic resistance', 'Tea tree oil, Thyme oil', 'FDA Final Rule 2016'),
('Phthalates', 5, 'reproductive toxin', 'EU banned', 'Linked to reproductive and developmental harm', 'Citric acid, Natural extracts', 'CDC Biomonitoring'),
('BHA/BHT', 4, 'carcinogen', 'EU restricted', 'Possible carcinogen and endocrine disruptor', 'Vitamin E, Rosemary extract', 'California Prop 65'),
('Coal Tar', 5, 'carcinogen', 'EU banned', 'Known human carcinogen', 'Natural colorants', 'FDA Regulations'),
('Lead Acetate', 5, 'neurotoxin', 'Globally banned', 'Neurotoxic heavy metal, extremely dangerous', 'Plant-based dyes', 'WHO Guidelines'),
('Hydroquinone', 4, 'carcinogen', 'EU banned', 'Potential carcinogen and causes skin damage', 'Vitamin C, Kojic acid', 'FDA Safety Alert')
ON CONFLICT (name) DO NOTHING;