-- Add public read access policy for books
DO $$ 
BEGIN
  -- Add policy for books table
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'books' 
    AND policyname = 'Allow public to read books'
  ) THEN
    CREATE POLICY "Allow public to read books"
      ON books
      FOR SELECT
      TO public
      USING (true);
  END IF;
END $$;