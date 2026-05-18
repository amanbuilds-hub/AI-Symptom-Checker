/*
  # Update user creation trigger to handle all signup form data

  1. Updates
    - Update handle_new_user() function to extract all user data from auth metadata
    - Handle phone, location, role, language fields from signup form
    - Use SECURITY DEFINER to bypass RLS restrictions
*/

-- Update function to handle user creation with all form data
-- SECURITY DEFINER allows the function to run with the privileges of the function owner (postgres)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (
    id, 
    email, 
    name, 
    phone, 
    location, 
    role, 
    language,
    created_at, 
    updated_at
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', new.email),
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'location',
    COALESCE(new.raw_user_meta_data->>'role', 'customer'),
    COALESCE(new.raw_user_meta_data->>'language', 'en'),
    now(),
    now()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql;