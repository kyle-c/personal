-- Add public read access policy for blog posts
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'blog_posts' 
    AND policyname = 'Allow public to read published blog posts'
  ) THEN
    CREATE POLICY "Allow public to read published blog posts"
      ON blog_posts
      FOR SELECT
      TO public
      USING (published = true);
  END IF;
END $$;