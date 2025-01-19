-- Add public read access policy for links and link categories
DO $$ 
BEGIN
  -- Add policy for links table
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'links' 
    AND policyname = 'Allow public to read links'
  ) THEN
    CREATE POLICY "Allow public to read links"
      ON links
      FOR SELECT
      TO public
      USING (true);
  END IF;

  -- Add policy for link_categories table
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'link_categories' 
    AND policyname = 'Allow public to read link categories'
  ) THEN
    CREATE POLICY "Allow public to read link categories"
      ON link_categories
      FOR SELECT
      TO public
      USING (true);
  END IF;
END $$;