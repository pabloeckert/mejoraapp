-- Update handle_new_user to split full_name into nombre and apellido
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  full_name TEXT;
  name_parts TEXT[];
  first_name TEXT;
  last_name TEXT;
BEGIN
  full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '');

  -- Split name into parts
  IF full_name != '' THEN
    name_parts := string_to_array(full_name, ' ');
    first_name := name_parts[1];
    -- Join everything after first name as apellido
    IF array_length(name_parts, 1) > 1 THEN
      last_name := array_to_string(name_parts[2:], ' ');
    END IF;
  END IF;

  INSERT INTO public.profiles (user_id, display_name, email, nombre, apellido)
  VALUES (
    NEW.id,
    COALESCE(full_name, NEW.email),
    NEW.email,
    first_name,
    last_name
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
