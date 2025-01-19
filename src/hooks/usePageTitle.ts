import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function usePageTitle() {
  const location = useLocation();

  useEffect(() => {
    const getTitle = () => {
      const path = location.pathname;
      let title = 'Kyle Cooney';

      // Add specific page titles
      if (path === '/') {
        title = 'Kyle Cooney | Product Designer & Entrepreneur';
      } else if (path === '/about') {
        title = 'About | Kyle Cooney';
      } else if (path === '/now') {
        title = 'Now | Kyle Cooney';
      } else if (path === '/blog') {
        title = 'Writing | Kyle Cooney';
      } else if (path.startsWith('/blog/')) {
        // For individual blog posts, we'll set this separately
        return;
      } else if (path === '/blogroll') {
        title = 'Blogroll | Kyle Cooney';
      } else if (path === '/books') {
        title = 'Books | Kyle Cooney';
      } else if (path === '/uses') {
        title = 'Uses | Kyle Cooney';
      } else if (path.startsWith('/admin')) {
        title = 'Admin | Kyle Cooney';
      }

      document.title = title;
    };

    getTitle();
  }, [location]);
}