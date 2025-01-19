import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Toast from '../../components/Toast';
import { useSaveShortcut } from '../../hooks/useSaveShortcut';

type Category = {
  id: string;
  name: string;
  order: number;
};

function LinkForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    category_id: '',
    order: 0
  });

  useEffect(() => {
    loadCategories();
    if (id) {
      loadLink();
    }
  }, [id]);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('link_categories')
        .select('*')
        .order('order');

      if (error) throw error;

      if (data) {
        setCategories(data);
        // Set default category if creating new link
        if (!id && data.length > 0) {
          setFormData(prev => ({ ...prev, category_id: data[0].id }));
        }
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      setToast({ message: 'Error loading categories', type: 'error' });
    }
  };

  const loadLink = async () => {
    setLoading(true);
    setLoadingError(null);

    try {
      const { data, error } = await supabase
        .from('links')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setFormData(data);
      } else {
        throw new Error('Link not found');
      }
    } catch (error) {
      console.error('Error loading link:', error);
      setLoadingError(error instanceof Error ? error.message : 'Error loading link');
      setToast({ message: 'Error loading link', type: 'error' });
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
            .from('links')
            .update(formData)
            .eq('id', id)
        : await supabase
            .from('links')
            .insert([formData]);

      if (error) throw error;

      setToast({ 
        message: id ? 'Link updated successfully' : 'Link created successfully', 
        type: 'success' 
      });
      
      setTimeout(() => {
        navigate('/admin/dashboard?tab=links');
      }, 1000);
    } catch (error) {
      console.error('Error saving link:', error);
      setToast({ 
        message: 'Error saving link', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  }, [formData, id, navigate]);

  useSaveShortcut(handleSubmit);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
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
            onClick={() => navigate('/admin/dashboard?tab=links')}
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
          onClick={() => navigate('/admin/dashboard?tab=links')}
          className="inline-flex items-center gap-2 nav-link"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to dashboard
        </button>
        <h1 className="text-2xl font-semibold mt-4">{id ? 'Edit' : 'New'} Link</h1>
      </header>

      {loading && !formData.title ? (
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-gray-200 rounded w-1/2"></div>
          <div className="h-10 bg-gray-200 rounded w-3/4"></div>
          <div className="h-20 bg-gray-200 rounded w-full"></div>
          <div className="h-10 bg-gray-200 rounded w-1/3"></div>
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
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label htmlFor="category_id" className="block text-sm font-medium mb-2">
              Category
            </label>
            <select
              id="category_id"
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
              required
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
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
            {loading ? (id ? 'Saving...' : 'Creating...') : (id ? 'Save Link' : 'Create Link')}
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

export default LinkForm;