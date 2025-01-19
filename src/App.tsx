import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { usePageTitle } from './hooks/usePageTitle';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Now from './pages/Now';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Blogroll from './pages/Blogroll';
import Books from './pages/Books';
import Uses from './pages/Uses';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import BlogPostForm from './pages/admin/BlogPostForm';
import PageForm from './pages/admin/PageForm';
import BookForm from './pages/admin/BookForm';
import LinkForm from './pages/admin/LinkForm';
import CategoryForm from './pages/admin/CategoryForm';
import SocialLinkForm from './pages/admin/SocialLinkForm';

function AppRoutes() {
  usePageTitle();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/about" element={<Layout><About /></Layout>} />
      <Route path="/now" element={<Layout><Now /></Layout>} />
      <Route path="/blog" element={<Layout><Blog /></Layout>} />
      <Route path="/blog/:slug" element={<Layout><BlogPost /></Layout>} />
      <Route path="/blogroll" element={<Layout><Blogroll /></Layout>} />
      <Route path="/books" element={<Layout><Books /></Layout>} />
      <Route path="/uses" element={<Layout><Uses /></Layout>} />

      {/* Admin routes */}
      <Route path="/admin" element={<Login />} />
      <Route path="/admin/dashboard" element={<Dashboard />} />
      <Route path="/admin/blog_posts/new" element={<BlogPostForm />} />
      <Route path="/admin/blog_posts/:id" element={<BlogPostForm />} />
      <Route path="/admin/pages/new" element={<PageForm />} />
      <Route path="/admin/pages/:id" element={<PageForm />} />
      <Route path="/admin/books/new" element={<BookForm />} />
      <Route path="/admin/books/:id" element={<BookForm />} />
      <Route path="/admin/links/new" element={<LinkForm />} />
      <Route path="/admin/links/:id" element={<LinkForm />} />
      <Route path="/admin/categories/new" element={<CategoryForm />} />
      <Route path="/admin/categories/:id" element={<CategoryForm />} />
      <Route path="/admin/social_links/new" element={<SocialLinkForm />} />
      <Route path="/admin/social_links/:id" element={<SocialLinkForm />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;