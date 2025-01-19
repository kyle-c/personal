import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

type BlogPost = {
  slug: string;
  title: string;
  date: string;
  content: string;
  published: boolean;
};

function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error loading posts:', error);
      }
      
      if (data) {
        setPosts(data);
      }
      setLoading(false);
    };

    loadPosts();

    // Set up real-time subscription for published blog posts only
    const subscription = supabase
      .channel('blog-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'blog_posts',
          filter: 'published=eq.true'
        },
        (payload) => {
          // Reload posts when there are changes to published posts
          loadPosts();
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
          <h1 className="text-[24px] leading-[1.1]">Writing</h1>
          <p className="text-xl leading-[1.3]">
            Occasional writings on design, technology, and building products.
          </p>
        </header>

        <section className="space-y-12">
          {loading ? (
            <div className="animate-pulse space-y-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          ) : posts.length > 0 ? (
            posts.map((post, index) => (
              <div key={post.slug} className="space-y-6">
                {index !== 0 && <div className="decorative-line my-8" />}
                <div className="space-y-2">
                  <Link 
                    to={`/blog/${post.slug}`}
                    className="block text-lg font-medium nav-link"
                  >
                    {post.title}
                  </Link>
                  <time className="block text-[18px] text-gray-500">
                    {new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                </div>
              </div>
            ))
          ) : (
            <p className="text-lg text-gray-600">No posts available yet.</p>
          )}
        </section>
      </article>
    </>
  );
}

export default Blog;