/*
  # Create consultations table for managing appointments and consultations

  1. New Tables
    - `consultations`
      - `id` (uuid, primary key)
      - `customer_id` (uuid, references users.id)
      - `doctor_id` (uuid, references users.id)
      - `type` (text, video/audio/chat)
      - `status` (text, scheduled/ongoing/completed/cancelled)
      - `scheduled_at` (timestamp)
      - `duration` (integer, in minutes)
      - `symptoms` (text array)
      - `diagnosis` (text)
      - `prescription` (text)
      - `notes` (text)
      - `rating` (integer)
      - `feedback` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `consultations` table
    - Add policies for customers and doctors to access their consultations
*/

-- Create consultations table
CREATE TABLE IF NOT EXISTS consultations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES users(id) ON DELETE CASCADE,
  doctor_id uuid REFERENCES users(id) ON DELETE CASCADE,
  type text DEFAULT 'video' CHECK (type IN ('video', 'audio', 'chat')),
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'ongoing', 'completed', 'cancelled')),
  scheduled_at timestamptz,
  duration integer DEFAULT 0,
  symptoms text[] DEFAULT ARRAY[]::text[],
  diagnosis text,
  prescription text,
  notes text,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  feedback text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Customers can read own consultations"
  ON consultations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = customer_id);

CREATE POLICY "Doctors can read their consultations"
  ON consultations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = doctor_id);

CREATE POLICY "Customers can create consultations"
  ON consultations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Doctors can update their consultations"
  ON consultations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = doctor_id);

CREATE POLICY "Customers can update their consultations"
  ON consultations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = customer_id);