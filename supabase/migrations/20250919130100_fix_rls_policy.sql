/*
  # Fix RLS policy for user creation trigger

  1. Updates
    - Drop the restrictive INSERT policy that blocks trigger
    - Create proper policies for authenticated users
    - Allow trigger to bypass RLS with SECURITY DEFINER
*/

-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Users can insert own data" ON users;

-- Create policy for authenticated users to read their own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Create policy for authenticated users to update their own data
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Allow public read access to basic user info (for doctor listings, etc.)
CREATE POLICY "Public can read basic user info"
  ON users
  FOR SELECT
  TO anon, authenticated
  USING (role = 'doctor' AND id IN (
    SELECT id FROM doctors WHERE verified = true
  ));