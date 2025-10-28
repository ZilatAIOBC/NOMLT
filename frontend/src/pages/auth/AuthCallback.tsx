import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient';
import { toast } from 'react-hot-toast';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    const processAuth = async () => {
      try {
        // Check if we have a hash with tokens
        const hash = location.hash || window.location.hash;
        
        // If Supabase redirected back with an error in the URL, surface it
        if (hash && hash.includes('error')) {
          const params = new URLSearchParams(hash.replace(/^#/, ''));
          const errorDescription = params.get('error_description') || 'Authentication failed';
          toast.error(errorDescription);
          navigate('/signin');
          return;
        }

        toast.loading('Completing sign-in...');

        // If we have a hash with tokens, trigger session exchange
        if (hash && hash.includes('access_token')) {
          const { data, error } = await supabase.auth.getSession();
          if (error) {
            // Handle error silently
          }
        }

        // Get the session (Supabase should have processed the hash by now)
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData.session?.access_token || null;
        const refreshToken = sessionData.session?.refresh_token || null;

        if (!accessToken) {
          toast.dismiss();
          toast.error('Sign-in session not found. Please try again.');
          navigate('/signin');
          return;
        }

        // Persist tokens for our API usage
        try {
          localStorage.setItem('accessToken', accessToken);
          if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
          if (sessionData.session) {
            localStorage.setItem('supabaseSession', JSON.stringify(sessionData.session));
          }
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('loggedInAt', new Date().toISOString());
        } catch {}

        // Fetch user info/role from backend using the token
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${baseUrl}/auth/user-info`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!res.ok) {
          toast.dismiss();
          toast.error('Could not complete sign-in. Please try again.');
          navigate('/signin');
          return;
        }

        const user = await res.json();
        try {
          localStorage.setItem('authUser', JSON.stringify(user));
        } catch {}

        // Redirect based on role
        toast.dismiss();
        toast.success('Signed in successfully');

        if (user.role === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } catch {
        toast.dismiss();
        toast.error('Authentication failed. Please try again.');
        navigate('/signin');
      }
    };

    processAuth();
  }, [navigate, location.hash]);

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center px-4 sm:px-6 lg:px-8" style={{ backgroundImage: 'url(/authbg.png)' }}>
      <div className="max-w-md w-full">
        <div className="bg-black/20 backdrop-blur-md border rounded-2xl p-8 shadow-[0_0_30px_rgba(138,63,252,0.4)]" style={{ borderColor: '#8A3FFC' }}>
          <div className="text-center text-white">Completing sign-in...</div>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;


