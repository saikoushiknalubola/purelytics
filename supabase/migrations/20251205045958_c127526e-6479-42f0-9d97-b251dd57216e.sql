-- Allow admins to view all products
CREATE POLICY "Admins can view all products" 
ON public.products 
FOR SELECT 
USING (public.is_admin(auth.uid()));

-- Allow admins to view all user roles for user counting
CREATE POLICY "Admins can view all user roles" 
ON public.user_roles 
FOR SELECT 
USING (public.is_admin(auth.uid()));