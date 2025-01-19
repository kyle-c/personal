import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function Now() {
  const [content, setContent] = useState('');
  const [headerImage, setHeaderImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Get current month and year
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('pages')
        .select('content, header_image')
        .eq('slug', 'now')
        .single();

      if (!error && data) {
        setContent(data.content);
        setHeaderImage(data.header_image);
      } else {
        console.error('Error loading now page:', error);
      }
      setLoading(false);
    };

    loadContent();

    // Set up real-time subscription
    const subscription = supabase
      .channel('now-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pages',
          filter: 'slug=eq.now'
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
              alt="Now header"
              className="w-full h-auto rounded-lg mb-8"
            />
          )}
          <h1 className="text-[24px] leading-[1.1]">Now</h1>
          <p className="text-[18px] leading-relaxed text-gray-500">
            Last updated {formattedDate} from Napa Valley, California
          </p>
        </header>

        <section className="space-y-8">
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          ) : (
            <div className="space-y-6 text-[18px] leading-relaxed">
              {content.split('\n\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          )}
        </section>

        <footer className="pt-8">

        </footer>
      </article>
    </>
  );
}

export default Now;