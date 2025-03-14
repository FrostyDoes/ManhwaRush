-- Create coin_packages table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.coin_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  coins INTEGER NOT NULL,
  price INTEGER NOT NULL, -- Price in cents
  stripe_price_id TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable row level security
ALTER TABLE public.coin_packages ENABLE ROW LEVEL SECURITY;

-- Create policies for coin_packages table
DROP POLICY IF EXISTS "Coin packages are viewable by everyone" ON public.coin_packages;
CREATE POLICY "Coin packages are viewable by everyone"
  ON public.coin_packages FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can insert coin packages" ON public.coin_packages;
CREATE POLICY "Admins can insert coin packages"
  ON public.coin_packages FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() AND users.role = 'admin'
  ));

DROP POLICY IF EXISTS "Admins can update coin packages" ON public.coin_packages;
CREATE POLICY "Admins can update coin packages"
  ON public.coin_packages FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() AND users.role = 'admin'
  ));

DROP POLICY IF EXISTS "Admins can delete coin packages" ON public.coin_packages;
CREATE POLICY "Admins can delete coin packages"
  ON public.coin_packages FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() AND users.role = 'admin'
  ));

-- Enable realtime for coin_packages table
ALTER PUBLICATION supabase_realtime ADD TABLE public.coin_packages;

-- Insert some initial coin packages
INSERT INTO public.coin_packages (name, description, coins, price, stripe_price_id, is_active)
VALUES
  ('Starter Pack', 'Perfect for new readers', 100, 999, 'price_starter_pack', true),
  ('Standard Pack', 'Most popular option', 300, 2499, 'price_standard_pack', true),
  ('Premium Pack', 'Best value for avid readers', 700, 4999, 'price_premium_pack', true),
  ('Mega Pack', 'For the ultimate fans', 1500, 9999, 'price_mega_pack', true)
ON CONFLICT (id) DO NOTHING;
