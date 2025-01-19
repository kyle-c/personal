/*
  # Add social links table

  1. New Tables
    - `social_links`
      - `id` (uuid, primary key)
      - `title` (text) - Display name of the link
      - `url` (text) - URL of the link
      - `icon` (text) - Lucide icon name
      - `order` (integer) - Display order
      - `created_at` (timestamp)
  
  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS social_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  url text NOT NULL,
  icon text NOT NULL,
  "order" integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to manage social links
CREATE POLICY "Allow authenticated users to manage social links"
  ON social_links
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow public to read social links
CREATE POLICY "Allow public to read social links"
  ON social_links
  FOR SELECT
  TO public
  USING (true);

-- Add index for ordering
CREATE INDEX IF NOT EXISTS social_links_order_idx ON social_links ("order");

-- Insert default social links
INSERT INTO social_links (title, url, icon, "order")
VALUES 
  ('Email', 'mailto:kylec@unbndl.com', 'Mail', 1),
  ('Read.cv', 'https://read.cv/yourusername', 'FileText', 2)
ON CONFLICT DO NOTHING;