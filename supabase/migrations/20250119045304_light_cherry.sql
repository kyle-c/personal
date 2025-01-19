/*
  # Populate initial content

  1. Changes
    - Insert initial pages content from the About, Now, and Uses pages
    - Insert books from the Books page
    - Insert links from the Blogroll page
*/

-- Insert initial pages
INSERT INTO pages (slug, title, content)
VALUES
  ('about', 'About', 'I''m Kyle Chen, a product designer and entrepreneur based in California''s Napa Valley. I split my time between building digital products and hospitality ventures.

Currently, I''m the founder and CEO of Gleamly.ai, where we''re building AI-powered tools to help businesses better understand and act on customer feedback. Our mission is to make customer intelligence more accessible and actionable for companies of all sizes.

I also run Unbndl, a digital product studio that partners with early-stage startups to build and launch their products. We focus on creating thoughtful, user-centered experiences that help businesses grow.

In the hospitality space, I manage The Wild Kindness, a portfolio of design-forward vacation rentals in California''s wine country. Each property is carefully curated to provide unique experiences that blend modern comfort with local character.

Previously, I led product design at several technology companies in San Francisco, where I worked on enterprise software, consumer apps, and developer tools. This experience shaped my approach to building products that are both powerful and accessible.

Outside of work, I''m deeply interested in sustainable agriculture, wine production, and the intersection of technology and hospitality. I spend my free time hiking Napa''s trails, learning about viticulture, and exploring ways to make tourism more sustainable.

I believe in building things that last—whether that''s software that solves real problems, spaces that create meaningful experiences, or communities that support and inspire each other.'),
  ('now', 'Now', 'Last updated March 2025 from Napa Valley, California

Leading product and engineering at Gleamly.ai. We''re building AI-powered tools to help businesses better understand and act on customer feedback. Currently focused on launching our new sentiment analysis feature.

Expanding The Wild Kindness with a new property in Sonoma County. Working with local artisans to create unique spaces that blend modern design with wine country charm.

Reading "The Ministry for the Future" by Kim Stanley Robinson and "The Craft of Winemaking" by James Halliday. Both are helping shape my thinking about sustainability and craft.

Learning about regenerative agriculture and its application in vineyard management. Exploring ways to implement these practices in our properties.

Spending more time outdoors with my kids, hiking the Napa Valley trails and teaching them about local ecology. Working on maintaining a better work-life balance.'),
  ('uses', 'Uses', 'A list of hardware, software, and tools I use daily for work and life.')
ON CONFLICT (slug) DO NOTHING;

-- Insert books
INSERT INTO books (title, author, url, "order")
VALUES
  ('The Age of AI', 'Henry Kissinger, Eric Schmidt, and Daniel Huttenlocher', 'https://www.amazon.com/Age-AI-Intelligence-Transforming-Humanity/dp/0316273805', 1),
  ('The Craft of Winemaking', 'James Halliday', 'https://www.amazon.com/Craft-Winemaking-James-Halliday/dp/1742578926', 2),
  ('The Design of Everyday Things', 'Don Norman', 'https://www.amazon.com/Design-Everyday-Things-Revised-Expanded/dp/0465050654', 3),
  ('Thinking in Systems', 'Donella H. Meadows', 'https://www.amazon.com/Thinking-Systems-Donella-H-Meadows/dp/1603580557', 4),
  ('The Pragmatic Programmer', 'David Thomas and Andrew Hunt', 'https://www.amazon.com/Pragmatic-Programmer-journey-mastery-Anniversary/dp/0135957052', 5),
  ('High Output Management', 'Andrew S. Grove', 'https://www.amazon.com/High-Output-Management-Andrew-Grove/dp/0679762884', 6),
  ('Zero to One', 'Peter Thiel', 'https://www.amazon.com/Zero-One-Notes-Startups-Future/dp/0804139296', 7),
  ('The Hard Thing About Hard Things', 'Ben Horowitz', 'https://www.amazon.com/Hard-Thing-About-Things-Building/dp/0062273205', 8),
  ('Meditations', 'Marcus Aurelius', 'https://www.amazon.com/Meditations-Marcus-Aurelius/dp/0812968255', 9),
  ('The Almanack of Naval Ravikant', 'Eric Jorgenson', 'https://www.amazon.com/Almanack-Naval-Ravikant-Wealth-Happiness/dp/1544514212', 10),
  ('Four Thousand Weeks', 'Oliver Burkeman', 'https://www.amazon.com/Four-Thousand-Weeks-Management-Mortals/dp/0374159122', 11)
ON CONFLICT DO NOTHING;

-- Insert links for blogroll
INSERT INTO links (title, url, description, category, "order")
VALUES
  ('Frank Chimero', 'https://www.frankchimero.com', 'Thoughtful essays on design, creativity, and the web.', 'Design & Technology', 1),
  ('Robin Sloan', 'https://www.robinsloan.com', 'Media inventor exploring the intersection of technology and storytelling.', 'Design & Technology', 2),
  ('Craig Mod', 'https://craigmod.com', 'Essays on books, photography, and the future of publishing.', 'Design & Technology', 3),
  ('Stratechery', 'https://stratechery.com', 'Ben Thompson''s analysis of strategy and business in the technology industry.', 'Business & Strategy', 4),
  ('Eugene Wei', 'https://www.eugenewei.com', 'Deep dives into technology, media, and product development.', 'Business & Strategy', 5),
  ('Not Boring', 'https://www.notboring.co', 'Packy McCormick''s entertaining analysis of business strategy and trends.', 'Business & Strategy', 6),
  ('Vinography', 'https://www.vinography.com', 'Alder Yarrow''s respected wine blog, focusing on California wines.', 'Wine & Hospitality', 7),
  ('Terroirist', 'https://www.terroirist.com', 'Daily wine blog featuring news, reviews, and interviews.', 'Wine & Hospitality', 8),
  ('Skift', 'https://skift.com', 'Leading news source for the travel and hospitality industry.', 'Wine & Hospitality', 9),
  ('The Marginalian', 'https://www.brainpickings.org', 'Maria Popova''s deep explorations of creativity, art, and what it means to live a good life.', 'Thinking & Culture', 10),
  ('Ribbonfarm', 'https://www.ribbonfarm.com', 'Venkatesh Rao''s experiments in refactored perception.', 'Thinking & Culture', 11),
  ('The School of Life', 'https://www.theschooloflife.com/articles', 'Essays on emotional intelligence and understanding ourselves better.', 'Thinking & Culture', 12)
ON CONFLICT DO NOTHING;