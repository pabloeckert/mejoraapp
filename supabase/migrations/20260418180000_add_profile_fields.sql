-- Add new profile fields for admin user management
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nombre TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS apellido TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cargo TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Migrate existing display_name to nombre if nombre is null
UPDATE public.profiles SET nombre = display_name WHERE nombre IS NULL AND display_name IS NOT NULL;

-- Create index for admin queries
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at DESC);

-- Add admin update policy for profiles
CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
