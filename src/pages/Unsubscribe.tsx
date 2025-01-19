import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Check, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

function Unsubscribe() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const token = searchParams.get('token');

  useEffect(() => {
    const handleUnsubscribe = async () => {
      if (!token) {
        setStatus('error');
        return;
      }

      try {
        const { error } = await supabase
          .from('subscribers')
          .update({ 
            unsubscribed_at: new Date().toISOString(),
            verification_token: null
          })
          .eq('verification_token', token)
          .is('unsubscribed_at', null);

        if (error) throw error;
        setStatus('success');
      } catch (error) {
        console.error('Error unsubscribing:', error);
        setStatus('error');
      }
    };

    handleUnsubscribe();
  }, [token]);

  return (
    <div className="min-h-screen flex justify-center px-4 sm:px-6 py-12 sm:py-24">
      <main className="w-full max-w-[460px] space-y-12">
        <Link to="/" className="inline-flex items-center gap-2 nav-link">
          <ArrowLeft className="w-4 h-4" />
          Back home
        </Link>

        <div className="space-y-6">
          {status === 'processing' ? (
            <p className="text-lg">Processing your unsubscribe request...</p>
          ) : status === 'success' ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <Check className="w-5 h-5" />
                <h1 className="text-xl font-medium">Successfully Unsubscribed</h1>
              </div>
              <p className="text-lg">
                You've been unsubscribed from the blog updates. You won't receive any more emails from us.
              </p>
              <p className="text-lg">
                Changed your mind? You can always{' '}
                <Link to="/blog" className="nav-link">
                  subscribe again
                </Link>.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-red-600">
                <XCircle className="w-5 h-5" />
                <h1 className="text-xl font-medium">Unsubscribe Failed</h1>
              </div>
              <p className="text-lg">
                We couldn't process your unsubscribe request. The link may have expired or already been used.
              </p>
              <p className="text-lg">
                Please try clicking the unsubscribe link from your email again, or{' '}
                <a 
                  href="mailto:kylec@unbndl.com" 
                  className="nav-link"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = 'mailto:kylec@unbndl.com';
                  }}
                >contact us</a> for assistance.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Unsubscribe;