import React, { useState, useEffect, useCallback } from 'react';
// ... rest of imports

function CategoryForm() {
  // ... existing state and other code ...

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    setLoading(true);

    try {
      const { error } = id
        ? await supabase
            .from('link_categories')
            .update(formData)
            .eq('id', id)
        : await supabase
            .from('link_categories')
            .insert([formData]);

      if (error) throw error;

      setToast({ 
        message: id ? 'Category updated successfully' : 'Category created successfully', 
        type: 'success' 
      });
      
      setTimeout(() => {
        navigate('/admin/dashboard?tab=categories');
      }, 1000);
    } catch (error) {
      console.error('Error saving category:', error);
      setToast({ 
        message: 'Error saving category', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  }, [formData, id, navigate]);

  useSaveShortcut(handleSubmit);

  // ... rest of the component code ...
}

export default CategoryForm;