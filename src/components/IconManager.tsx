import React, { useState } from 'react';
import { Upload, Check, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Toast from './Toast';

function IconManager() {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/svg+xml')) {
      setToast({ message: 'Please upload an SVG file', type: 'error' });
      return;
    }

    setLoading(true);

    try {
      // Read the SVG file content
      const content = await file.text();
      
      // Store the SVG content in the site_settings table
      const { error } = await supabase
        .from('site_settings')
        .upsert({ 
          key: 'site_icon',
          value: content
        }, {
          onConflict: 'key'
        });

      if (error) throw error;

      setToast({ message: 'Icon updated successfully', type: 'success' });
    } catch (error) {
      console.error('Error uploading icon:', error);
      setToast({ message: 'Error uploading icon', type: 'error' });
    } finally {
      setLoading(false);
      if (e.target) e.target.value = ''; // Reset file input
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-gray-900">Site Icon</h3>
          <p className="text-sm text-gray-500 mt-1">
            Upload a new SVG icon to replace the current grape icon
          </p>
        </div>
        <label className={`flex items-center gap-2 px-4 py-2 rounded-md cursor-pointer transition-colors ${
          loading 
            ? 'bg-gray-100 text-gray-400' 
            : 'bg-gray-900 text-white hover:bg-gray-800'
        }`}>
          <Upload className="w-4 h-4" />
          <span className="text-sm">Upload Icon</span>
          <input
            type="file"
            accept=".svg"
            onChange={handleIconUpload}
            disabled={loading}
            className="hidden"
          />
        </label>
      </div>

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

export default IconManager;