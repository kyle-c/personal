/*
  # Add public read access for social links

  1. Changes
    - Add policy to allow public read access to social_links table
*/

-- Add public read access policy for social links
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'social_links' 
    AND policyname = 'Allow public to read social links'
  ) THEN
    CREATE POLICY "Allow public to read social links"
      ON social_links
      FOR SELECT
      TO public
      USING (true);
  END IF;
END $$;