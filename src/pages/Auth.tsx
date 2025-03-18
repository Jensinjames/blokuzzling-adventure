
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the return URL from query parameters
  const searchParams = new URLSearchParams(location.search);
  const returnTo = searchParams.get('returnTo') || '/home';

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      console.log(`[Auth Debug] User already authenticated, redirecting to ${returnTo}`);
      navigate(returnTo);
    }
  }, [user, navigate, returnTo]);

  const validateForm = () => {
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!password.trim()) {
      setError('Password is required');
      return false;
    }
    if (!isLogin && password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);

    try {
      console.log(`[Auth Debug] Attempting to ${isLogin ? 'sign in' : 'sign up'} with email: ${email}`);
      
      if (isLogin) {
        const result = await signIn(email, password);
        if (result.error) {
          console.error('[Auth Debug] Sign in error:', result.error);
          setError(result.error.message || 'Invalid login credentials');
          toast.error(`Sign in failed: ${result.error.message || 'Invalid login credentials'}`);
        } else {
          console.log('[Auth Debug] Sign in successful');
          // Navigation handled by auth state change listener
        }
      } else {
        const result = await signUp(email, password);
        if (result.error) {
          console.error('[Auth Debug] Sign up error:', result.error);
          
          if (result.error.message?.includes('already registered')) {
            setError('This email is already registered. Please sign in instead.');
            toast.error('This email is already registered');
          } else if (result.error.message?.includes('users') && result.error.message?.includes('exist')) {
            // Handle database setup issues
            setError('Server configuration error. Please contact support.');
            toast.error('Server configuration error');
            console.error('[Auth Debug] Database configuration error:', result.error);
          } else {
            setError(result.error.message || 'An error occurred during sign up');
            toast.error(`Sign up failed: ${result.error.message || 'An unknown error occurred'}`);
          }
        } else {
          console.log('[Auth Debug] Sign up successful');
          toast.success('Account created! Check your email for confirmation.');
          setIsLogin(true);
        }
      }
    } catch (error: any) {
      console.error('[Auth Debug] Authentication error:', error);
      setError(error.message || 'An unexpected error occurred');
      toast.error(`Authentication error: ${error.message || 'An unexpected error occurred'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
          BloKu
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-md">
          A strategic puzzle game where players take turns placing pieces on the board
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="glass-panel w-full max-w-sm bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 dark:border-gray-700/30 p-6"
      >
        <h2 className="text-xl font-semibold mb-6 text-center">
          {isLogin ? 'Sign In' : 'Create Account'}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-300 text-sm flex items-start">
            <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your.email@example.com"
              disabled={loading}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              disabled={loading}
              className="w-full"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isLogin ? 'Signing in...' : 'Signing up...'}
              </>
            ) : (
              <>{isLogin ? 'Sign In' : 'Sign Up'}</>
            )}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            disabled={loading}
          >
            {isLogin
              ? "Don't have an account? Sign Up"
              : 'Already have an account? Sign In'}
          </button>
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate('/')}
          >
            Continue as Guest
          </Button>
        </div>
      </motion.div>
      
      {/* Debug information in development mode */}
      {import.meta.env.DEV && (
        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 max-w-md text-center">
          <p>Debug: Supabase URL: {import.meta.env.VITE_SUPABASE_URL || 'Using fallback URL'}</p>
          <p>Debug: Anon Key is {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'set' : 'using fallback'}</p>
        </div>
      )}
    </div>
  );
};

export default Auth;
