/*
  # Add email verification for subscribers

  1. Changes
    - Add verified column to track email confirmation status
    - Add verification_token for secure email confirmation
    - Add index for efficient token lookups
    - Add RLS policies for verification
*/

-- Add columns for email verification
ALTER TABLE subscribers 
ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_token uuid DEFAULT gen_random_uuid();

-- Add index for verification token lookups
CREATE INDEX IF NOT EXISTS subscribers_verification_token_idx 
ON subscribers (verification_token);

-- Update RLS policies to allow verification
CREATE POLICY "Allow public to verify subscription"
  ON subscribers
  FOR UPDATE
  TO public
  USING (
    verification_token::text = current_setting('request.jwt.claims')::json->>'verification_token'
    AND verified = false
  )
  WITH CHECK (
    verification_token::text = current_setting('request.jwt.claims')::json->>'verification_token'
    AND verified = true
    AND unsubscribed_at IS NULL
  );