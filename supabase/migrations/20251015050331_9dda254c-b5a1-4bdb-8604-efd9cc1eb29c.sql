-- Fix: Make user_id NOT NULL to prevent orphaned product records
-- This ensures all products are always associated with an authenticated user

ALTER TABLE public.products
ALTER COLUMN user_id SET NOT NULL;

-- Update INSERT policy to explicitly validate user_id
DROP POLICY IF EXISTS "Users can create their own products" ON public.products;

CREATE POLICY "Users can create their own products"
ON public.products
FOR INSERT
WITH CHECK (auth.uid() = user_id AND user_id IS NOT NULL);