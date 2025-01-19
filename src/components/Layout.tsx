import React from 'react';
import { useLocation } from 'react-router-dom';
import Footer from './Footer';

type LayoutProps = {
  children: React.ReactNode;
};

function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen flex justify-center px-4 sm:px-6 py-12 sm:py-24">
      <main className="w-full max-w-[460px]">
        {children}
        {!isHomePage && <Footer />}
      </main>
    </div>
  );
}

export default Layout;