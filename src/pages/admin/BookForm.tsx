import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Toast from '../../components/Toast';
import { useSaveShortcut } from '../../hooks/useSaveShortcut';

function BookForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    url: '',
    order: 0
  });

  useEffect(() => {
    if (id) {
      loadBook();
    }
  }, [id]);

  const loadBook = async () => {
    setLoading(true);
    setLoadingError(null);

    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setFormData(data);
      } else {
        throw new Error('Book not found');
      }
    } catch (error) {
      console.error('Error loading book:', error);
      setLoadingError(error instanceof Error ? error.message : 'Error loading book');
      setToast({ message: 'Error loading book', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    setLoading(true);

    try {
      const { error } = id
        ? await supabase
            .from('books')
            .update(formData)
            .eq('id', id)
        : await supabase
            .from('books')
            .insert([formData]);

      if (error) throw error;

      setToast({ 
        message: id ? 'Book updated successfully' : 'Book created successfully', 
        type: 'success' 
      });
      
      setTimeout(() => {
        navigate('/admin/dashboard?tab=books');
      }, 1000);
    } catch (error) {
      console.error('Error saving book:', error);
      setToast({ 
        message: 'Error saving book', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  }, [formData, id, navigate]);

  useSaveShortcut(handleSubmit);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value
    }));
  };

  if (loadingError) {
    return (
      <div className="min-h-screen p-6">
        <header className="mb-8">
          <button
            onClick={() => navigate('/admin/dashboard?tab=books')}
            className="inline-flex items-center gap-2 nav-link"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to dashboard
          </button>
        </header>
        <div className="bg-red-50 text-red-800 p-4 rounded-lg">
          <p>{loadingError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <header className="mb-8">
        <button
          onClick={() => navigate('/admin/dashboard?tab=books')}
          className="inline-flex items-center gap-2 nav-link"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to dashboard
        </button>
        <h1 className="text-2xl font-semibold mt-4">{id ? 'Edit' : 'New'} Book</h1>
      </header>

      {loading && !formData.title ? (
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-gray-200 rounded w-1/2"></div>
          <div className="h-10 bg-gray-200 rounded w-3/4"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
          <div className="h-10 bg-gray-200 rounded w-1/4"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label htmlFor="author" className="block text-sm font-medium mb-2">
              Author
            </label>
            <input
              type="text"
              id="author"
              name="author"
              value={formData.author}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label htmlFor="url" className="block text-sm font-medium mb-2">
              URL
            </label>
            <input
              type="url"
              id="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label htmlFor="order" className="block text-sm font-medium mb-2">
              Order
            </label>
            <input
              type="number"
              id="order"
              name="order"
              value={formData.order}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? (id ? 'Saving...' : 'Creating...') : (id ? 'Save Book' : 'Create Book')}
          </button>
        </form>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default BookForm;