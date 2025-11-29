-- Add more specific ingredient variations to improve matching
-- This helps the ToxiScore calculation match more real product ingredients

INSERT INTO public.ingredients (name, hazard_score, hazard_type, description, source) VALUES
-- Specific Parabens
('Methylparaben', 3, 'Preservative', 'Hormone disruptor, may interfere with endocrine system', 'EWG Skin Deep Database'),
('Ethylparaben', 3, 'Preservative', 'Potential endocrine disruptor and allergen', 'EWG Skin Deep Database'),
('Propylparaben', 4, 'Preservative', 'Stronger hormone disrupting potential than methylparaben', 'EWG Skin Deep Database'),
('Butylparaben', 4, 'Preservative', 'Strong hormone disruptor, banned in some countries', 'EU Scientific Committee'),

-- Specific Sulfates
('Sodium Lauryl Sulfate', 3, 'Surfactant', 'Strong cleanser that can strip natural oils and irritate skin', 'Clinical Studies'),
('Ammonium Lauryl Sulfate', 3, 'Surfactant', 'Can cause skin and eye irritation', 'Safety Assessments'),
('Sodium Laureth Sulfate', 2, 'Surfactant', 'Milder than SLS but may still irritate sensitive skin', 'Dermatological Studies'),

-- Specific Phthalates  
('Diethyl Phthalate', 4, 'Plasticizer', 'Endocrine disruptor linked to reproductive issues', 'CDC Studies'),
('Dibutyl Phthalate', 5, 'Plasticizer', 'Banned in cosmetics in EU, reproductive toxin', 'EU Regulations'),
('Di(2-ethylhexyl) Phthalate', 5, 'Plasticizer', 'Known carcinogen and reproductive toxin', 'IARC Classification'),

-- Common Food Additives
('Tartrazine', 4, 'Colorant', 'May trigger hyperactivity and allergic reactions', 'Food Standards Agency'),
('Sunset Yellow', 4, 'Colorant', 'Linked to hyperactivity in children', 'Medical Studies'),
('Monosodium Glutamate', 3, 'Flavor Enhancer', 'May cause headaches and allergic reactions in sensitive individuals', 'FDA Reports'),
('Disodium Inosinate', 2, 'Flavor Enhancer', 'Umami enhancer, may cause sensitivity', 'Food Safety Studies'),
('Disodium Guanylate', 2, 'Flavor Enhancer', 'May trigger reactions in people with gout', 'Clinical Reports'),

-- Common Preservatives
('BHT', 4, 'Antioxidant', 'Possible endocrine disruptor and allergen', 'Environmental Health Perspectives'),
('BHA', 4, 'Antioxidant', 'Reasonably anticipated to be a human carcinogen', 'National Toxicology Program'),
('TBHQ', 3, 'Antioxidant', 'May cause nausea and tinnitus in high doses', 'FDA Safety Data'),
('Methylisothiazolinone', 4, 'Preservative', 'Strong allergen and skin sensitizer', 'Contact Dermatitis Studies'),
('Potassium Sorbate', 1, 'Preservative', 'Generally recognized as safe, minimal concerns', 'FDA GRAS List'),

-- Synthetic Fragrances
('Fragrance', 2, 'Fragrance', 'May contain undisclosed allergens and irritants', 'Fragrance Transparency'),
('Parfum', 2, 'Fragrance', 'Trade secret that may hide harmful chemicals', 'EU Regulations'),

-- Silicones
('Dimethicone', 1, 'Emollient', 'Generally safe but can cause buildup on skin/hair', 'Cosmetic Safety Reviews'),
('Cyclomethicone', 2, 'Emollient', 'Volatile silicone that may have environmental concerns', 'Environmental Studies'),

-- Alcohols
('Isopropyl Alcohol', 2, 'Solvent', 'Can be drying and irritating to skin', 'Dermatology Guidelines'),
('Denatured Alcohol', 2, 'Solvent', 'Very drying, can damage skin barrier', 'Clinical Studies')
ON CONFLICT (name) DO NOTHING;