-- Migration: Auto-assign admin role to approved emails on signup
-- Date: 2026-04-24
-- Sprint: Admin management

-- Lista de emails que reciben rol admin automáticamente al registrarse
CREATE TABLE IF NOT EXISTS admin_whitelist (
  email TEXT PRIMARY KEY,
  added_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE admin_whitelist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin whitelist: solo admin gestiona"
  ON admin_whitelist
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Insertar los 3 admins
INSERT INTO admin_whitelist (email) VALUES
  ('pabloeckert@gmail.com'),
  ('sindygeisert@gmail.com'),
  ('mejoraok@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- Trigger: al crear usuario, si su email está en whitelist → admin automático
CREATE OR REPLACE FUNCTION handle_new_user_role()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM admin_whitelist WHERE email = NEW.email) THEN
    INSERT INTO user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger después de insertar en profiles (que ya existe como handle_new_user)
-- Mejor: trigger directo en auth.users después del signup
DROP TRIGGER IF EXISTS on_auth_user_created_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_role();
