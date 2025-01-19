-- Add Resend API key to site settings
INSERT INTO site_settings (key, value)
VALUES (
  'resend_api_key',
  'your_resend_api_key_here'
)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Add policy to restrict access to sensitive settings
CREATE POLICY "Restrict access to sensitive settings"
  ON site_settings
  FOR SELECT
  TO public
  USING (key NOT LIKE '%api_key%' AND key NOT LIKE '%secret%');