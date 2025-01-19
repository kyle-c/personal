/*
  # Add home bio setting
  
  1. Changes
    - Add initial home bio setting to site_settings table
*/

INSERT INTO site_settings (key, value)
VALUES (
  'home_bio',
  'Based in California''s world famous Napa Valley. I''m currently building Gleamly.ai, Unbndl, and The Wild Kindness portfolio of vacation rentals in California. In real life, I''m a father of 3 and an enthusiast of EVs and multiethnic democracies.'
)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;