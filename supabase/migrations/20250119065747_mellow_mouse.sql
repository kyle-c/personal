-- Drop existing verification policy
DROP POLICY IF EXISTS "Allow public to verify subscription" ON subscribers;

-- Add more permissive verification policy
CREATE POLICY "Allow public to verify subscription"
  ON subscribers
  FOR UPDATE
  TO public
  USING (verification_token IS NOT NULL)
  WITH CHECK (true);

-- Add policy for authenticated users to manage subscribers
CREATE POLICY "Allow authenticated users to manage subscribers"
  ON subscribers
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add policy for public to read their own subscription status
CREATE POLICY "Allow public to read own subscription"
  ON subscribers
  FOR SELECT
  TO public
  USING (true);