import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="mt-16 sm:mt-24 pb-12">
      <div className="decorative-line mb-8 sm:mb-12" />
      <nav className="text-lg">
        <div className="flex gap-3">
          <Link to="/now" className="nav-link">Now</Link>
          <span className="text-gray-400">·</span>
          <Link to="/about" className="nav-link">About</Link>
          <span className="text-gray-400">·</span>
          <Link to="/blog" className="nav-link">Blog</Link>
        </div>
      </nav>
    </footer>
  );
}

export default Footer;