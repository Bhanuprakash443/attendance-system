-- Fix search_path for calculate_total_hours function
CREATE OR REPLACE FUNCTION public.calculate_total_hours(check_in TIMESTAMPTZ, check_out TIMESTAMPTZ)
RETURNS DECIMAL(5,2)
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
BEGIN
  IF check_in IS NULL OR check_out IS NULL THEN
    RETURN 0;
  END IF;
  RETURN EXTRACT(EPOCH FROM (check_out - check_in)) / 3600;
END;
$$;