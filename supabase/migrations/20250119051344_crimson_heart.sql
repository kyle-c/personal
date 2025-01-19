-- Create site_settings table for storing site-wide configuration
CREATE TABLE IF NOT EXISTS site_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to manage site settings
CREATE POLICY "Allow authenticated users to manage site settings"
  ON site_settings
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow public to read site settings
CREATE POLICY "Allow public to read site settings"
  ON site_settings
  FOR SELECT
  TO public
  USING (true);

-- Add index for key lookups
CREATE INDEX IF NOT EXISTS site_settings_key_idx ON site_settings (key);