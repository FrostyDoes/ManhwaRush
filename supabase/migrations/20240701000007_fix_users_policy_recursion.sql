-- Drop any existing policies that might be causing recursion
DROP POLICY IF EXISTS "Public users are viewable by everyone." ON public.users;
DROP POLICY IF EXISTS "Users can view their own data." ON public.users;
DROP POLICY IF EXISTS "Users can update own data." ON public.users;

-- Create a simpler policy for viewing users
CREATE POLICY "Users can view all users"
ON public.users FOR SELECT
USING (true);

-- Create a policy for users to update only their own data
CREATE POLICY "Users can update own data"
ON public.users FOR UPDATE
USING (auth.uid() = id);

-- Create a policy for users to insert their own data
CREATE POLICY "Users can insert own data"
ON public.users FOR INSERT
WITH CHECK (auth.uid() = id);
