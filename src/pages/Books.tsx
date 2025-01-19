import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

type Book = {
  id: string;
  title: string;
  author: string;
  url: string;
  order: number;
};

function Books() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBooks = async () => {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('order');

      if (!error && data) {
        setBooks(data);
      }
      setLoading(false);
    };

    loadBooks();

    // Set up real-time subscription for books
    const subscription = supabase
      .channel('books-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'books'
        },
        () => {
          // Reload books when there are changes
          loadBooks();
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
          <h1 className="text-[24px] leading-[1.1]">Books</h1>
          <p className="text-xl leading-relaxed">
            A selection of books that have influenced my thinking.
          </p>
        </header>

        <section className="space-y-2 text-lg">
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-6 bg-gray-200 rounded w-3/4"></div>
              ))}
            </div>
          ) : books.length > 0 ? (
            books.map((book) => (
              <p key={book.id}>
                <a 
                  href={book.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="nav-link"
                >
                  {book.title}
                </a> by {book.author}
              </p>
            ))
          ) : (
            <p className="text-gray-600">No books available yet.</p>
          )}
        </section>

        <footer className="pt-8">
          <p className="text-lg leading-relaxed text-gray-600">
            Have a book recommendation?{' '}
            <a 
              href="mailto:kylec@unbndl.com" 
              className="nav-link"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = 'mailto:kylec@unbndl.com';
              }}
            >Let me know</a>.
          </p>
        </footer>
      </article>
    </>
  );
}

export default Books;