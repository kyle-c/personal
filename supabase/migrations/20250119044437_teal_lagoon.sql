/*
  # CMS Schema Setup

  1. New Tables
    - `pages`
      - `id` (uuid, primary key)
      - `slug` (text, unique)
      - `title` (text)
      - `content` (text)
      - `updated_at` (timestamp)
    - `blog_posts`
      - `id` (uuid, primary key)
      - `slug` (text, unique)
      - `title` (text)
      - `content` (text)
      - `date` (date)
      - `published` (boolean)
      - `created_at` (timestamp)
    - `books`
      - `id` (uuid, primary key)
      - `title` (text)
      - `author` (text)
      - `url` (text)
      - `order` (integer)
    - `links`
      - `id` (uuid, primary key)
      - `title` (text)
      - `url` (text)
      - `description` (text, nullable)
      - `category` (text)
      - `order` (integer)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Pages table for static content
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS pages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug text UNIQUE NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    updated_at timestamptz DEFAULT now()
  );
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'pages' AND policyname = 'Allow authenticated users to manage pages'
  ) THEN
    ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Allow authenticated users to manage pages"
      ON pages
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Blog posts table
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS blog_posts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug text UNIQUE NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    date date NOT NULL DEFAULT CURRENT_DATE,
    published boolean NOT NULL DEFAULT false,
    created_at timestamptz DEFAULT now()
  );
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'blog_posts' AND policyname = 'Allow authenticated users to manage blog posts'
  ) THEN
    ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Allow authenticated users to manage blog posts"
      ON blog_posts
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Books table
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS books (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    author text NOT NULL,
    url text NOT NULL,
    "order" integer NOT NULL DEFAULT 0
  );
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'books' AND policyname = 'Allow authenticated users to manage books'
  ) THEN
    ALTER TABLE books ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Allow authenticated users to manage books"
      ON books
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Links table for blogroll
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS links (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    url text NOT NULL,
    description text,
    category text NOT NULL,
    "order" integer NOT NULL DEFAULT 0
  );
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'links' AND policyname = 'Allow authenticated users to manage links'
  ) THEN
    ALTER TABLE links ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Allow authenticated users to manage links"
      ON links
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Create indexes for frequently accessed columns
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'pages_slug_idx') THEN
    CREATE INDEX pages_slug_idx ON pages (slug);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'blog_posts_slug_idx') THEN
    CREATE INDEX blog_posts_slug_idx ON blog_posts (slug);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'blog_posts_date_idx') THEN
    CREATE INDEX blog_posts_date_idx ON blog_posts (date);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'links_category_idx') THEN
    CREATE INDEX links_category_idx ON links (category);
  END IF;
END $$;