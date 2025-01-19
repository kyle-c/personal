import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Bold, Italic, List, Heading1, Heading2, Heading3, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Toast from '../../components/Toast';
import { useSaveShortcut } from '../../hooks/useSaveShortcut';

function BlogPostForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    published: false,
    header_image: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [inlineImageLoading, setInlineImageLoading] = useState(false);
  const inlineImageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (id) {
      loadPost();
    }
  }, [id]);

  useEffect(() => {
    if (formData.header_image) {
      setImagePreview(formData.header_image);
    }
  }, [formData.header_image]);

  const loadPost = async () => {
    setLoading(true);
    setLoadingError(null);

    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setFormData(data);
      } else {
        throw new Error('Post not found');
      }
    } catch (error) {
      console.error('Error loading post:', error);
      setLoadingError(error instanceof Error ? error.message : 'Error loading post');
      setToast({ message: 'Error loading post', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('blog-images')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      setToast({ message: 'Error uploading image', type: 'error' });
      return null;
    }

    const { data } = supabase.storage
      .from('blog-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleInlineImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setInlineImageLoading(true);
    const imageUrl = await uploadImage(file);
    setInlineImageLoading(false);

    if (imageUrl) {
      const textarea = document.getElementById('content') as HTMLTextAreaElement;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;

      const imageMarkdown = `\n![${file.name}](${imageUrl})\n`;
      const newContent = text.substring(0, start) + imageMarkdown + text.substring(end);
      
      setFormData(prev => ({ ...prev, content: newContent }));

      // Reset file input
      if (inlineImageInputRef.current) {
        inlineImageInputRef.current.value = '';
      }

      // Set cursor position after the inserted image
      setTimeout(() => {
        textarea.focus();
        const newPosition = start + imageMarkdown.length;
        textarea.setSelectionRange(newPosition, newPosition);
      }, 0);
    }
  };

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    setLoading(true);

    try {
      let imageUrl = formData.header_image;

      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }

      const postData = {
        ...formData,
        header_image: imageUrl
      };

      const { data: savedPost, error } = id
        ? await supabase
            .from('blog_posts')
            .update(postData)
            .eq('id', id)
            .select()
            .single()
        : await supabase
            .from('blog_posts')
            .insert([postData])
            .select()
            .single();

      if (error) throw error;

      // If the post is being published for the first time, send emails
      if (savedPost && savedPost.published && (!id || !formData.published)) {
        try {
          await supabase.functions.invoke('send-blog-post-email', {
            body: { post: savedPost }
          });
        } catch (emailError) {
          console.error('Error sending blog post emails:', emailError);
          // Don't throw here - we still want to show success for the post save
        }
      }

      setToast({ 
        message: id ? 'Post updated successfully' : 'Post created successfully', 
        type: 'success' 
      });
      
      setTimeout(() => {
        navigate('/admin/dashboard?tab=blog_posts');
      }, 1000);
    } catch (error) {
      console.error('Error saving post:', error);
      setToast({ 
        message: 'Error saving post', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  }, [formData, id, imageFile, navigate]);

  useSaveShortcut(handleSubmit);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }));
  };

  const insertFormatting = (format: string) => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    let formattedText = '';
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText || 'bold text'}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText || 'italic text'}*`;
        break;
      case 'h1':
        formattedText = `\n# ${selectedText || 'Heading 1'}\n`;
        break;
      case 'h2':
        formattedText = `\n## ${selectedText || 'Heading 2'}\n`;
        break;
      case 'h3':
        formattedText = `\n### ${selectedText || 'Heading 3'}\n`;
        break;
      case 'list':
        formattedText = selectedText
          ? selectedText.split('\n').map(line => `- ${line}`).join('\n')
          : '\n- List item\n';
        break;
      case 'image':
        if (inlineImageInputRef.current) {
          inlineImageInputRef.current.click();
        }
        return;
      default:
        return;
    }

    const newContent = text.substring(0, start) + formattedText + text.substring(end);
    setFormData(prev => ({ ...prev, content: newContent }));

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + formattedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  if (loadingError) {
    return (
      <div className="min-h-screen p-6">
        <header className="mb-8">
          <button
            onClick={() => navigate('/admin/dashboard?tab=blog_posts')}
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
          onClick={() => navigate('/admin/dashboard?tab=blog_posts')}
          className="inline-flex items-center gap-2 nav-link"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to dashboard
        </button>
        <h1 className="text-2xl font-semibold mt-4">{id ? 'Edit' : 'New'} Blog Post</h1>
      </header>

      {loading && !formData.title ? (
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-gray-200 rounded w-1/2"></div>
          <div className="h-10 bg-gray-200 rounded w-3/4"></div>
          <div className="h-40 bg-gray-200 rounded w-full"></div>
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Header Image
            </label>
            <div className="space-y-4">
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Header preview"
                  className="w-[460px] h-auto rounded-lg"
                />
              )}
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200">
                  <ImageIcon className="w-4 h-4" />
                  <span className="text-sm">Choose image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                {imagePreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview('');
                      setImageFile(null);
                      setFormData(prev => ({ ...prev, header_image: '' }));
                    }}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Remove image
                  </button>
                )}
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleTitleChange}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium mb-2">
              Slug
            </label>
            <input
              type="text"
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium mb-2">
              Content
            </label>
            <div className="mb-2 flex gap-2">
              <button
                type="button"
                onClick={() => insertFormatting('h1')}
                className="p-2 border rounded hover:bg-gray-100"
                title="Heading 1"
              >
                <Heading1 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('h2')}
                className="p-2 border rounded hover:bg-gray-100"
                title="Heading 2"
              >
                <Heading2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('h3')}
                className="p-2 border rounded hover:bg-gray-100"
                title="Heading 3"
              >
                <Heading3 className="w-4 h-4" />
              </button>
              <div className="w-px bg-gray-200" />
              <button
                type="button"
                onClick={() => insertFormatting('bold')}
                className="p-2 border rounded hover:bg-gray-100"
                title="Bold"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('italic')}
                className="p-2 border rounded hover:bg-gray-100"
                title="Italic"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('list')}
                className="p-2 border rounded hover:bg-gray-100"
                title="Bullet List"
              >
                <List className="w-4 h-4" />
              </button>
              <div className="w-px bg-gray-200" />
              <button
                type="button"
                onClick={() => insertFormatting('image')}
                className="p-2 border rounded hover:bg-gray-100"
                title="Insert Image"
                disabled={inlineImageLoading}
              >
                <ImageIcon className="w-4 h-4" />
              </button>
              <input
                type="file"
                accept="image/*"
                onChange={handleInlineImageUpload}
                ref={inlineImageInputRef}
                className="hidden"
              />
            </div>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={15}
              className="w-full px-3 py-2 border rounded-md font-mono text-sm"
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="published"
              name="published"
              checked={formData.published}
              onChange={handleChange}
              className="rounded border-gray-300"
            />
            <label htmlFor="published" className="text-sm font-medium">
              Published
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? (id ? 'Saving...' : 'Creating...') : (id ? 'Save Post' : 'Create Post')}
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

export default BlogPostForm;