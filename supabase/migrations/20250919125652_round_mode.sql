/*
  # Create health records table for storing patient health data

  1. New Tables
    - `health_records`
      - `id` (uuid, primary key)
      - `customer_id` (uuid, references users.id)
      - `consultation_id` (uuid, references consultations.id, optional)
      - `type` (text, consultation/symptom_check/prescription/lab_report)
      - `title` (text)
      - `description` (text)
      - `data` (jsonb)
      - `attachments` (text array)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `health_records` table
    - Add policies for customers to access their own records
    - Add policies for doctors to access records of their patients
*/

-- Create health records table
CREATE TABLE IF NOT EXISTS health_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES users(id) ON DELETE CASCADE,
  consultation_id uuid REFERENCES consultations(id) ON DELETE SET NULL,
  type text DEFAULT 'consultation' CHECK (type IN ('consultation', 'symptom_check', 'prescription', 'lab_report')),
  title text NOT NULL,
  description text,
  data jsonb DEFAULT '{}'::jsonb,
  attachments text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Customers can read own health records"
  ON health_records
  FOR SELECT
  TO authenticated
  USING (auth.uid() = customer_id);

CREATE POLICY "Customers can create own health records"
  ON health_records
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customers can update own health records"
  ON health_records
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = customer_id);

-- Policy for doctors to read health records of their patients (through consultations)
CREATE POLICY "Doctors can read patient records from consultations"
  ON health_records
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM consultations 
      WHERE consultations.id = health_records.consultation_id 
      AND consultations.doctor_id = auth.uid()
    )
  );