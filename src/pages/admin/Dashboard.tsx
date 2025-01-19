import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { PlusCircle, Edit, Trash2, Eye, ExternalLink, Link as LinkIcon } from 'lucide-react';
import IconManager from '../../components/IconManager';
import Toast from '../../components/Toast';

type Category = {
  id: string;
  name: string;
  order: number;
};

function Dashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'blog_posts');
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [bio, setBio] = useState('');
  const [editingBio, setEditingBio] = useState(false);
  const bioTextareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);

  const loadItems = async () => {
    if (activeTab === 'pages') return; // Pages are handled separately
    
    setLoading(true);
    let query = supabase.from(activeTab).select('*');

    // Add specific ordering for different tabs
    switch (activeTab) {
      case 'blog_posts':
        query = query.order('date', { ascending: false });
        break;
      case 'links':
        query = query.order('order');
        break;
      case 'social_links':
        query = query.order('order');
        break;
      case 'books':
        query = query.order('order');
        break;
      default:
        query = query.order('title');
    }

    const { data, error } = await query;

    if (error) {
      console.error(`Error loading ${activeTab}:`, error);
      setToast({ message: `Error loading ${activeTab}`, type: 'error' });
    }

    if (data) {
      setItems(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
    loadItems();
    if (activeTab === 'pages') {
      loadBio();
    }
    if (activeTab === 'links') {
      loadCategories();
    }
  }, [activeTab]);

  useEffect(() => {
    // Update URL when tab changes
    navigate(`/admin/dashboard?tab=${activeTab}`, { replace: true });
  }, [activeTab, navigate]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/admin');
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/admin');
    } catch (error) {
      console.error('Error signing out:', error);
      setToast({ message: 'Error signing out', type: 'error' });
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

  const saveBio = async () => {
    const { error } = await supabase
      .from('site_settings')
      .upsert({ 
        key: 'home_bio',
        value: bio,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'key'
      });

    if (!error) {
      setToast({ message: 'Bio updated successfully', type: 'success' });
      setEditingBio(false);
    } else {
      setToast({ message: 'Error updating bio', type: 'error' });
    }
  };

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('link_categories')
        .select('*')
        .order('order');

      if (error) throw error;

      if (data) {
        setCategories(data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      setToast({ message: 'Error loading categories', type: 'error' });
    }
  };

  const handleDelete = async (id: string, type: 'link' | 'category' = 'link') => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      const { error } = await supabase
        .from(type === 'category' ? 'link_categories' : activeTab)
        .delete()
        .eq('id', id);

      if (!error) {
        setToast({ message: 'Item deleted successfully', type: 'success' });
        if (type === 'category') {
          loadCategories();
        } else {
          loadItems();
        }
      } else {
        setToast({ message: 'Error deleting item', type: 'error' });
      }
    }
  };

  const handleBioTextSelect = () => {
    if (bioTextareaRef.current) {
      setSelectionStart(bioTextareaRef.current.selectionStart);
      setSelectionEnd(bioTextareaRef.current.selectionEnd);
    }
  };

  const insertLink = () => {
    if (!linkUrl) {
      setToast({ message: 'Please enter a URL', type: 'error' });
      return;
    }

    const text = linkText || linkUrl;
    const markdown = `[${text}](${linkUrl})`;
    const newBio = bio.substring(0, selectionStart) + markdown + bio.substring(selectionEnd);
    setBio(newBio);
    setShowLinkDialog(false);
    setLinkUrl('');
    setLinkText('');

    // Reset focus to textarea
    if (bioTextareaRef.current) {
      bioTextareaRef.current.focus();
      const newPosition = selectionStart + markdown.length;
      bioTextareaRef.current.setSelectionRange(newPosition, newPosition);
    }
  };

  const getViewPath = (item: any) => {
    switch (activeTab) {
      case 'blog_posts':
        return `/blog/${item.slug}`;
      case 'pages':
        return `/${item.slug}`;
      case 'books':
        return '/books';
      case 'links':
        return item.url;
      case 'social_links':
        return '/';
      default:
        return '/';
    }
  };

  const tabs = ['blog_posts', 'books', 'links', 'pages', 'social_links'];

  return (
    <div className="min-h-screen p-6">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <button
            onClick={handleSignOut}
            className="text-sm nav-link"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="mb-8">
        <IconManager />
      </div>

      <nav className="mb-8">
        <div className="border-b border-gray-200">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 text-sm font-medium ${
                  activeTab === tab
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main>
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-medium">
            {activeTab.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </h2>
          <Link
            to={`/admin/${activeTab}/new`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
          >
            <PlusCircle className="w-4 h-4" />
            New {activeTab.replace('_', ' ').slice(0, -1)}
          </Link>
        </div>

        {activeTab === 'pages' && (
          <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium">Home Page Bio</h3>
              {!editingBio ? (
                <button
                  onClick={() => setEditingBio(true)}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingBio(false)}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveBio}
                    className="text-sm text-gray-900 font-medium"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>
            {editingBio ? (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowLinkDialog(true)}
                    className="p-2 border rounded hover:bg-gray-100"
                    title="Insert Link"
                  >
                    <LinkIcon className="w-4 h-4" />
                  </button>
                </div>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  onSelect={handleBioTextSelect}
                  ref={bioTextareaRef}
                  className="w-full h-32 p-3 border rounded-md font-mono text-sm"
                  placeholder="Enter your bio here..."
                />
              </div>
            ) : (
              <div className="prose max-w-none">
                {bio.split('\n').map((paragraph, i) => (
                  <p key={i} className="text-gray-600">{paragraph}</p>
                ))}
              </div>
            )}

            {/* Link Dialog */}
            {showLinkDialog && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                  <h3 className="text-lg font-medium mb-4">Insert Link</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">URL</label>
                      <input
                        type="url"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="https://"
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Text (optional)</label>
                      <input
                        type="text"
                        value={linkText}
                        onChange={(e) => setLinkText(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="Link text"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowLinkDialog(false)}
                        className="px-4 py-2 text-gray-600 hover:text-gray-900"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={insertLink}
                        className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
                      >
                        Insert
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'links' && (
          <div className="mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Categories</h3>
                <Link
                  to="/admin/categories/new"
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-900 rounded-md hover:bg-gray-200 text-sm"
                >
                  <PlusCircle className="w-4 h-4" />
                  New Category
                </Link>
              </div>
              <div className="space-y-3">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <span className="text-gray-900">{category.name}</span>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/admin/categories/${category.id}`}
                        className="p-1.5 text-gray-600 hover:text-gray-900"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(category.id, 'category')}
                        className="p-1.5 text-gray-600 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm"
              >
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/admin/${activeTab}/${item.id}`}
                    className="block group"
                  >
                    <h3 className="font-medium text-gray-900 group-hover:text-gray-600 transition-colors">
                      {item.title || item.name}
                    </h3>
                    {item.url && (
                      <p className="text-sm text-gray-500 truncate">{item.url}</p>
                    )}
                  </Link>
                </div>
                <div className="flex items-center gap-4 ml-4">
                  {activeTab === 'links' ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-600 hover:text-gray-900"
                      title="Open link"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : activeTab !== 'categories' && (
                    <Link
                      to={getViewPath(item)}
                      className="p-2 text-gray-600 hover:text-gray-900"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  )}
                  <Link
                    to={`/admin/${activeTab}/${item.id}`}
                    className="p-2 text-gray-600 hover:text-gray-900"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-gray-600 hover:text-red-600"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No items found.</p>
        )}
      </main>

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

export default Dashboard;