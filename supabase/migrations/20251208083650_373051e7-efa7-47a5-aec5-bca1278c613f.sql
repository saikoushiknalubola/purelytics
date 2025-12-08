-- Create user_points table to track points balance
CREATE TABLE public.user_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  points_balance INTEGER NOT NULL DEFAULT 0,
  total_earned INTEGER NOT NULL DEFAULT 0,
  scan_streak INTEGER NOT NULL DEFAULT 0,
  last_scan_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create point_transactions table for history
CREATE TABLE public.point_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  points INTEGER NOT NULL,
  transaction_type TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_points
CREATE POLICY "Users can view their own points"
ON public.user_points FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own points record"
ON public.user_points FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own points"
ON public.user_points FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all user points"
ON public.user_points FOR SELECT
USING (public.is_admin(auth.uid()));

-- RLS policies for point_transactions
CREATE POLICY "Users can view their own transactions"
ON public.point_transactions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
ON public.point_transactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions"
ON public.point_transactions FOR SELECT
USING (public.is_admin(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_user_points_updated_at
BEFORE UPDATE ON public.user_points
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to award points after scan (will be called from edge function)
CREATE OR REPLACE FUNCTION public.award_scan_points(p_user_id UUID, p_points INTEGER DEFAULT 10)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_last_scan DATE;
  v_streak INTEGER;
BEGIN
  -- Get current streak info
  SELECT last_scan_date, scan_streak INTO v_last_scan, v_streak
  FROM user_points WHERE user_id = p_user_id;
  
  -- Insert or update user_points
  INSERT INTO user_points (user_id, points_balance, total_earned, scan_streak, last_scan_date)
  VALUES (p_user_id, p_points, p_points, 1, CURRENT_DATE)
  ON CONFLICT (user_id) DO UPDATE SET
    points_balance = user_points.points_balance + p_points,
    total_earned = user_points.total_earned + p_points,
    scan_streak = CASE 
      WHEN user_points.last_scan_date = CURRENT_DATE - INTERVAL '1 day' THEN user_points.scan_streak + 1
      WHEN user_points.last_scan_date = CURRENT_DATE THEN user_points.scan_streak
      ELSE 1
    END,
    last_scan_date = CURRENT_DATE,
    updated_at = now();
  
  -- Record transaction
  INSERT INTO point_transactions (user_id, points, transaction_type, description)
  VALUES (p_user_id, p_points, 'scan', 'Points earned from product scan');
END;
$$;