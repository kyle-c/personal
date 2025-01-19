import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function About() {
  const [content, setContent] = useState('');
  const [headerImage, setHeaderImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('pages')
        .select('content, header_image')
        .eq('slug', 'about')
        .single();

      if (!error && data) {
        setContent(data.content);
        setHeaderImage(data.header_image);
      } else {
        console.error('Error loading about page:', error);
      }
      setLoading(false);
    };

    loadContent();

    // Set up real-time subscription
    const subscription = supabase
      .channel('about-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pages',
          filter: 'slug=eq.about'
        },
        (payload) => {
          if (payload.new) {
            setContent(payload.new.content);
            setHeaderImage((payload.new as any).header_image);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <>
      <Link to="/" className="inline-flex items-center gap-2 nav-link">
        <ArrowLeft className="w-4 h-4" />
        Back home
      </Link>

      <article className="mt-12 space-y-12">
        <header className="space-y-6">
          {headerImage && (
            <img
              src={headerImage}
              alt="About header"
              className="w-full h-auto rounded-lg mb-8"
            />
          )}
          <h1 className="text-[24px] leading-[1.1]">About</h1>
        </header>

        <section className="space-y-8">
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          ) : (
            <div className="space-y-6 text-lg leading-relaxed">
              {content.split('\n\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          )}
        </section>
      </article>
    </>
  );
}

export default About;