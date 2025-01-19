/*
  # Add header image support to blog posts

  1. Changes
    - Add header_image column to blog_posts table
    - Create storage bucket for blog images
    - Add storage policies for authenticated users
*/

-- Add header_image column to blog_posts
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'blog_posts' AND column_name = 'header_image'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN header_image text;
  END IF;
END $$;

-- Create storage bucket for blog images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload images
CREATE POLICY "Allow authenticated users to upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'blog-images');

-- Allow public access to read images
CREATE POLICY "Allow public to read images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'blog-images');