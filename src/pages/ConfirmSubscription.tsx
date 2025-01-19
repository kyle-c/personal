import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Check, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

function ConfirmSubscription() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const token = searchParams.get('token');

  useEffect(() => {
    const verifySubscription = async () => {
      if (!token) {
        setStatus('error');
        return;
      }

      try {
        const { error } = await supabase
          .from('subscribers')
          .update({ verified: true })
          .eq('verification_token', token)
          .is('verified', false);

        if (error) throw error;
        setStatus('success');
      } catch (error) {
        console.error('Error verifying subscription:', error);
        setStatus('error');
      }
    };

    verifySubscription();
  }, [token]);

  return (
    <div className="min-h-screen flex justify-center px-4 sm:px-6 py-12 sm:py-24">
      <main className="w-full max-w-[460px] space-y-12">
        <Link to="/" className="inline-flex items-center gap-2 nav-link">
          <ArrowLeft className="w-4 h-4" />
          Back home
        </Link>

        <div className="space-y-6">
          {status === 'verifying' ? (
            <p className="text-lg">Verifying your subscription...</p>
          ) : status === 'success' ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <Check className="w-5 h-5" />
                <h1 className="text-xl font-medium">Subscription Confirmed!</h1>
              </div>
              <p className="text-lg">
                Thank you for confirming your subscription. You'll now receive updates when new blog posts are published.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-red-600">
                <XCircle className="w-5 h-5" />
                <h1 className="text-xl font-medium">Verification Failed</h1>
              </div>
              <p className="text-lg">
                We couldn't verify your subscription. The link may have expired or already been used.
                Please try subscribing again.
              </p>
              <Link to="/blog" className="inline-block nav-link">
                Return to blog
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default ConfirmSubscription;