import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

type Link = {
  title: string;
  url: string;
  description: string | null;
  category_id: string;
  order: number;
  link_categories: {
    name: string;
  } | null;
};

function Blogroll() {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLinks = async () => {
      const { data, error } = await supabase
        .from('links')
        .select(`
          *,
          link_categories(name)
        `)
        .order('link_categories(name)')
        .order('order');

      if (!error && data) {
        setLinks(data);
      }
      setLoading(false);
    };

    loadLinks();

    // Set up real-time subscription for links
    const subscription = supabase
      .channel('links-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'links'
        },
        () => {
          // Reload links when there are changes
          loadLinks();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Group links by category
  const linksByCategory = links.reduce((acc, link) => {
    const categoryName = link.link_categories?.name || 'Uncategorized';
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(link);
    return acc;
  }, {} as Record<string, Link[]>);

  return (
    <>
      <Link to="/" className="inline-flex items-center gap-2 nav-link">
        <ArrowLeft className="w-4 h-4" />
        Back home
      </Link>

      <article className="mt-12 space-y-12">
        <header className="space-y-6">
          <h1 className="text-[24px] leading-[1.1]">Blogroll</h1>
          <p className="text-xl leading-relaxed">
            A collection of thought-provoking blogs and online publications I regularly read.
          </p>
        </header>

        {loading ? (
          <div className="animate-pulse space-y-12">
            {[1, 2, 3].map((i) => (
              <section key={i} className="space-y-8">
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="space-y-6">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="space-y-2">
                      <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : Object.entries(linksByCategory).length > 0 ? (
          Object.entries(linksByCategory).map(([category, categoryLinks]) => (
            <section key={category} className="space-y-8">
              <h2 className="text-[20px] leading-snug">{category}</h2>
              <div className="space-y-6 text-lg leading-relaxed">
                {categoryLinks.map((link) => (
                  <div key={link.title}>
                    <a 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-medium nav-link"
                    >
                      {link.title}
                    </a>
                    {link.description && (
                      <p className="mt-1">{link.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))
        ) : (
          <p className="text-lg text-gray-600">No links available yet.</p>
        )}

        <footer className="pt-8">
          <p className="text-lg leading-relaxed text-gray-600">
            Found an interesting blog I might enjoy? Feel free to{' '}
            <a 
              href="mailto:kylec@unbndl.com" 
              className="nav-link"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = 'mailto:kylec@unbndl.com';
              }}
            >share it with me</a>.
          </p>
        </footer>
      </article>
    </>
  );
}

export default Blogroll;