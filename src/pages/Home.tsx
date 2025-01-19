import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import GrapeIcon from '../components/GrapeIcon';
import { supabase } from '../lib/supabase';
import * as Icons from 'lucide-react';

type SocialLink = {
  title: string;
  url: string;
  icon: string;
};

function Home() {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [bio, setBio] = useState('');

  useEffect(() => {
    const loadSocialLinks = async () => {
      const { data } = await supabase
        .from('social_links')
        .select('*')
        .order('order');
      
      if (data) {
        setSocialLinks(data);
      }
    };

    const loadBio = async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'home_bio')
        .single();
      
      if (data) {
        setBio(data.value);
      }
    };

    loadSocialLinks();
    loadBio();

    // Set up real-time subscription for bio updates
    const subscription = supabase
      .channel('bio-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'site_settings',
          filter: 'key=eq.home_bio'
        },
        (payload) => {
          if (payload.new) {
            setBio((payload.new as any).value);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen flex justify-center px-4 sm:px-6 py-12 sm:py-24">
      <main className="w-full max-w-[414px] space-y-12 sm:space-y-16">
        <section className="space-y-8 sm:space-y-12">
          <GrapeIcon />
          <div className="space-y-6">
            <h1 className="text-[24px] leading-snug">Product designer. Entrepreneur. Hospitalitarian. Occasional Cook.</h1>
            <p className="text-lg leading-normal">
              {bio || "Based in California's world famous Napa Valley. I'm currently building Gleamly.ai, Unbndl, and The Wild Kindness portfolio of vacation rentals in California. In real life, I'm a father of 3 and an enthusiast of EVs and multiethnic democracies."}
            </p>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-[24px] leading-snug">Start here</h2>
          <nav className="space-y-1">
            <Link to="/now" className="block nav-link leading-tight text-[18px]">Now</Link>
            <Link to="/about" className="block nav-link leading-tight text-[18px]">About</Link>
            <Link to="/blog" className="block nav-link leading-tight text-[18px]">Blog</Link>
          </nav>
        </section>

        <section className="space-y-2">
          <h2 className="text-[24px] leading-snug">Browse</h2>
          <nav className="space-y-1">
            <Link to="/blogroll" className="block nav-link leading-tight text-[18px]">Blogroll</Link>
            <Link to="/uses" className="block nav-link leading-tight text-[18px]">Uses</Link>
            <Link to="/books" className="block nav-link leading-tight text-[18px]">Books</Link>
          </nav>
        </section>

        <section className="space-y-4">
          <h2 className="text-[24px] leading-snug">Connect</h2>
          <nav className="space-x-3">
            {socialLinks.map((link, index) => (
              <React.Fragment key={link.title}>
                <a 
                  href={link.url}
                  className="inline-flex items-center gap-1 nav-link leading-tight"
                  target={link.url.startsWith('mailto:') ? undefined : '_blank'}
                  rel={link.url.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                  onClick={(e) => {
                    if (link.url.startsWith('mailto:')) {
                      e.preventDefault();
                      window.location.href = link.url;
                    }
                  }}
                >
                  {React.createElement(
                    Icons[link.icon as keyof typeof Icons] || Icons.Link,
                    { className: 'w-4 h-4' }
                  )}
                  <span>{link.title}</span>
                </a>
                {index < socialLinks.length - 1 && (
                  <span className="text-gray-400">·</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        </section>
      </main>
    </div>
  );
}

export default Home;