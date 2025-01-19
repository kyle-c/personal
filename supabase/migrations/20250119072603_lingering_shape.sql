/*
  # Add header image support to pages
  
  1. Changes
    - Add header_image column to pages table
  
  2. Storage
    - Add storage policies for page images
*/

-- Add header_image column to pages
ALTER TABLE pages 
ADD COLUMN IF NOT EXISTS header_image text;

-- Create storage bucket for page images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('page-images', 'page-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload page images
CREATE POLICY "Allow authenticated users to upload page images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'page-images');

-- Allow public access to read page images
CREATE POLICY "Allow public to read page images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'page-images');