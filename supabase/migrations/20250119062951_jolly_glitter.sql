/*
  # Add subscribers table

  1. New Tables
    - `subscribers`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `created_at` (timestamp)
      - `unsubscribed_at` (timestamp, nullable)

  2. Security
    - Enable RLS on `subscribers` table
    - Add policy for public to insert new subscribers
    - Add policy for authenticated users to read all subscribers
*/

-- Create subscribers table
CREATE TABLE IF NOT EXISTS subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  unsubscribed_at timestamptz
);

-- Enable RLS
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Allow public to subscribe (insert)
CREATE POLICY "Allow public to subscribe"
  ON subscribers
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow authenticated users to read all subscribers
CREATE POLICY "Allow authenticated users to read subscribers"
  ON subscribers
  FOR SELECT
  TO authenticated
  USING (true);

-- Add index for email lookups
CREATE INDEX IF NOT EXISTS subscribers_email_idx ON subscribers (email);