/*
  # Create doctors table for extended doctor information

  1. New Tables
    - `doctors`
      - `id` (uuid, primary key, references users.id)
      - `specialization` (text)
      - `experience` (integer)
      - `languages` (text array)
      - `availability` (boolean, default true)
      - `rating` (decimal, default 0)
      - `consultation_fee` (integer)
      - `license_number` (text, unique)
      - `verified` (boolean, default false)
      - `bio` (text)
      - `education` (text array)
      - `certifications` (text array)
      - `working_hours` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `doctors` table
    - Add policies for doctors to manage their own data
    - Add policy for public read access to verified doctors
*/

-- Create doctors table
CREATE TABLE IF NOT EXISTS doctors (
  id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  specialization text NOT NULL,
  experience integer DEFAULT 0,
  languages text[] DEFAULT ARRAY['en'],
  availability boolean DEFAULT true,
  rating decimal(3,2) DEFAULT 0.0,
  consultation_fee integer DEFAULT 0,
  license_number text UNIQUE,
  verified boolean DEFAULT false,
  bio text,
  education text[] DEFAULT ARRAY[]::text[],
  certifications text[] DEFAULT ARRAY[]::text[],
  working_hours jsonb DEFAULT '{"start": "09:00", "end": "17:00", "days": ["monday", "tuesday", "wednesday", "thursday", "friday"]}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Doctors can read own data"
  ON doctors
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Doctors can update own data"
  ON doctors
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Doctors can insert own data"
  ON doctors
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Public can read verified doctors"
  ON doctors
  FOR SELECT
  TO authenticated
  USING (verified = true);