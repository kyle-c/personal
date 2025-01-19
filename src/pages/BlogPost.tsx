import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

type BlogPost = {
  title: string;
  date: string;
  content: string;
  slug: string;
  header_image?: string;
};

function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPost = async () => {
      if (!slug) return;

      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single();

      if (error || !data) {
        navigate('/blog');
        return;
      }

      setPost(data);
      setLoading(false);
      document.title = `${data.title} | Kyle Cooney`;
    };

    loadPost();

    // Set up real-time subscription for this post
    const subscription = supabase
      .channel(`blog-post-${slug}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'blog_posts',
          filter: `slug=eq.${slug}`
        },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            navigate('/blog');
          } else if (payload.new) {
            setPost(payload.new as BlogPost);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [slug, navigate]);

  const renderContent = (content: string) => {
    const sections = content.split('\n\n');
    return sections.map((section, index) => {
      // Check if it's an image
      const imageMatch = section.match(/!\[(.*?)\]\((.*?)\)/);
      if (imageMatch) {
        const [, alt, src] = imageMatch;
        return (
          <div key={index} className="my-8">
            <img
              src={src}
              alt={alt}
              className="w-full h-auto rounded-lg"
            />
          </div>
        );
      }

      // Check if it's a heading
      if (section.startsWith('# ')) {
        return (
          <h1 key={index} className="text-2xl font-medium mt-12 mb-6">
            {section.replace('# ', '')}
          </h1>
        );
      }
      if (section.startsWith('## ')) {
        return (
          <h2 key={index} className="text-xl font-medium mt-12 mb-6">
            {section.replace('## ', '')}
          </h2>
        );
      }
      if (section.startsWith('### ')) {
        return (
          <h3 key={index} className="text-lg font-medium mt-12 mb-6">
            {section.replace('### ', '')}
          </h3>
        );
      }

      // Check if it's a list
      if (section.includes('\n- ')) {
        const items = section.split('\n- ').filter(Boolean);
        return (
          <ul key={index} className="list-disc list-inside space-y-2 my-6">
            {items.map((item, i) => (
              <li key={i} className="text-lg leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        );
      }

      // Handle bold and italic text
      const formattedText = section
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');

      // Regular paragraph
      return (
        <p
          key={index}
          className="text-lg leading-relaxed my-6"
          dangerouslySetInnerHTML={{ __html: formattedText }}
        />
      );
    });
  };

  if (loading) {
    return (
      <>
        <Link to="/blog" className="inline-flex items-center gap-2 nav-link">
          <ArrowLeft className="w-4 h-4" />
          Back to blog
        </Link>
        <div className="mt-12 animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </>
    );
  }

  if (!post) {
    return (
      <>
        <Link to="/blog" className="inline-flex items-center gap-2 nav-link">
          <ArrowLeft className="w-4 h-4" />
          Back to blog
        </Link>
        <p className="mt-12 text-lg">Post not found.</p>
      </>
    );
  }

  return (
    <>
      <Link to="/blog" className="inline-flex items-center gap-2 nav-link">
        <ArrowLeft className="w-4 h-4" />
        Back to blog
      </Link>

      <article className="mt-12 space-y-12">
        <header className="space-y-4">
          {post.header_image && (
            <img
              src={post.header_image}
              alt={post.title}
              className="w-full h-auto rounded-lg mb-8"
            />
          )}
          <h1 className="text-[24px] leading-[1.1]">{post.title}</h1>
          <time className="block text-[18px] text-gray-500">
            {new Date(post.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </time>
        </header>

        <div className="prose max-w-none">
          {renderContent(post.content)}
        </div>
      </article>
    </>
  );
}

export default BlogPost;