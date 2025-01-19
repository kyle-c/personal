/*
  # Add link categories management
  
  1. New Tables
    - `link_categories`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `order` (integer)
      - `created_at` (timestamp)

  2. Changes
    - Modify `links` table to reference `link_categories`
    - Migrate existing category data
    - Add appropriate indexes and constraints

  3. Security
    - Enable RLS on new table
    - Add policies for authenticated users
*/

-- Create link_categories table
CREATE TABLE IF NOT EXISTS link_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  "order" integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE link_categories ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to manage categories
CREATE POLICY "Allow authenticated users to manage categories"
  ON link_categories
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow public to read categories
CREATE POLICY "Allow public to read categories"
  ON link_categories
  FOR SELECT
  TO public
  USING (true);

-- Add index for ordering
CREATE INDEX IF NOT EXISTS link_categories_order_idx ON link_categories ("order");

-- Migrate existing categories
INSERT INTO link_categories (name, "order")
VALUES 
  ('Design & Technology', 1),
  ('Business & Strategy', 2),
  ('Wine & Hospitality', 3),
  ('Thinking & Culture', 4)
ON CONFLICT (name) DO NOTHING;

-- Add category_id to links table
ALTER TABLE links ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES link_categories(id);

-- Migrate existing category data
DO $$
DECLARE
  category_record RECORD;
BEGIN
  FOR category_record IN SELECT id, name FROM link_categories LOOP
    UPDATE links 
    SET category_id = category_record.id 
    WHERE category = category_record.name;
  END LOOP;
END $$;

-- Make category_id required after migration
ALTER TABLE links ALTER COLUMN category_id SET NOT NULL;

-- Drop old category column
ALTER TABLE links DROP COLUMN IF EXISTS category;