import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

function GrapeIcon() {
  const [customIcon, setCustomIcon] = useState<string | null>(null);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const loadCustomIcon = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'site_icon')
          .maybeSingle();

        if (!error && data) {
          setCustomIcon(data.value);
        }
      } catch (err) {
        console.error('Error loading custom icon:', err);
        setError(true);
      }
    };

    loadCustomIcon();
  }, []);

  // If there's an error or no custom icon, show the default pineapple icon
  if (error || !customIcon) {
    return (
      <svg
        width="48"
        height="48"
        viewBox="0 0 700 700"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-[#333333]"
      >
        {/* Crown leaves */}
        <path
          d="M350 50C350 50 300 120 250 120C200 120 250 50 250 50"
          stroke="currentColor"
          strokeWidth="20"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="hand-drawn"
        />
        <path
          d="M350 50C350 50 400 120 450 120C500 120 450 50 450 50"
          stroke="currentColor"
          strokeWidth="20"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="hand-drawn"
        />
        <path
          d="M350 50C350 50 350 100 350 150"
          stroke="currentColor"
          strokeWidth="20"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="hand-drawn"
        />
        
        {/* Pineapple body */}
        <path
          d="M250 200C250 200 200 300 200 450C200 550 350 650 350 650C350 650 500 550 500 450C500 300 450 200 450 200C450 200 400 150 350 150C300 150 250 200 250 200Z"
          stroke="currentColor"
          strokeWidth="20"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="hand-drawn"
        />
        
        {/* Diamond pattern - horizontal lines */}
        <path
          d="M220 250L480 250M220 350L480 350M220 450L480 450M220 550L480 550"
          stroke="currentColor"
          strokeWidth="20"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="hand-drawn"
        />
        
        {/* Diamond pattern - diagonal lines */}
        <path
          d="M280 150L280 600M350 150L350 650M420 150L420 600"
          stroke="currentColor"
          strokeWidth="20"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="hand-drawn"
        />
      </svg>
    );
  }

  // Show the custom icon if it exists
  return <div dangerouslySetInnerHTML={{ __html: customIcon }} />;
}

export default GrapeIcon;