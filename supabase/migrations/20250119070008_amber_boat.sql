-- Drop existing policies to clean up
DROP POLICY IF EXISTS "Allow public to verify subscription" ON subscribers;
DROP POLICY IF EXISTS "Allow public to read own subscription" ON subscribers;
DROP POLICY IF EXISTS "Allow authenticated users to manage subscribers" ON subscribers;
DROP POLICY IF EXISTS "Allow public to subscribe" ON subscribers;

-- Add more permissive policies for subscription management
CREATE POLICY "Allow public to subscribe and verify"
  ON subscribers
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Add policy for authenticated users to manage all subscribers
CREATE POLICY "Allow authenticated users to manage subscribers"
  ON subscribers
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add verification_sent_at column to track email sending
ALTER TABLE subscribers
ADD COLUMN IF NOT EXISTS verification_sent_at timestamptz;

-- Add index for verification tracking
CREATE INDEX IF NOT EXISTS subscribers_verification_sent_idx 
ON subscribers (verification_sent_at);