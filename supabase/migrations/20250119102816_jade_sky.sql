/*
  # Add header image support for pages

  1. Schema Changes
    - Add header_image column to pages table
  
  2. Storage
    - Ensure page-images bucket exists
    - Set up storage policies if not already present
  
  3. Security
    - Add policies for authenticated users to upload images
    - Add policies for public to read images
*/

-- Add header_image column to pages if it doesn't exist
ALTER TABLE pages 
ADD COLUMN IF NOT EXISTS header_image text;

-- Create storage bucket for page images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('page-images', 'page-images', true)
ON CONFLICT (id) DO NOTHING;

-- Add storage policies with existence checks
DO $$ 
BEGIN
  -- Check and create upload policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Allow authenticated users to upload page images'
    AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "Allow authenticated users to upload page images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'page-images');
  END IF;

  -- Check and create read policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Allow public to read page images'
    AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "Allow public to read page images"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'page-images');
  END IF;

  -- Check and create public read policy for pages
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'pages' 
    AND policyname = 'Allow public to read pages'
  ) THEN
    CREATE POLICY "Allow public to read pages"
      ON pages
      FOR SELECT
      TO public
      USING (true);
  END IF;
END $$;