
import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { LogIn, Play, Info, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const redirectAttemptedRef = useRef(false);
  const mountedRef = useRef(true);

  // Track component mounted state to prevent state updates after unmounting
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Memoize navigation functions to prevent unnecessary re-renders
  const navigateToHome = useCallback(() => {
    navigate('/home');
  }, [navigate]);

  const navigateToAuth = useCallback(() => {
    navigate('/auth');
  }, [navigate]);

  const navigateToRules = useCallback(() => {
    navigate('/rules');
  }, [navigate]);

  // Only trigger navigation after initial loading is complete and only once
  useEffect(() => {
    // Skip if still loading, already redirecting, or already attempted
    if (loading || isRedirecting || redirectAttemptedRef.current) {
      return;
    }
    
    // If user is logged in, redirect to home
    if (user) {
      console.log('User is logged in, preparing to redirect to home');
      
      // Mark that we've attempted a redirect to prevent repeated attempts
      redirectAttemptedRef.current = true;
      
      if (mountedRef.current) {
        setIsRedirecting(true);
        
        // Small delay to prevent flash of content
        setTimeout(() => {
          if (mountedRef.current) {
            console.log('Navigating to /home');
            navigate('/home');
          }
        }, 100);
      }
    } else {
      console.log('User is not logged in, staying on landing page');
    }
  }, [user, loading, navigate]);

  // Don't render anything while checking authentication or redirecting
  if (loading || isRedirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-10 w-10 animate-spin text-primary/70" />
          <p className="text-sm text-gray-500">Loading your experience...</p>
        </div>
      </div>
    );
  }

  // Regular render with landing page content
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-blue-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-4">
            BloKu
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            A strategic puzzle game where players take turns placing pieces on the board
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="space-y-4"
        >
          <Button 
            onClick={navigateToAuth}
            className="w-full py-6 text-lg"
          >
            <LogIn className="h-5 w-5 mr-2" />
            Sign In / Sign Up
          </Button>
          
          <div className="flex items-center justify-center">
            <div className="border-t border-gray-300 dark:border-gray-700 flex-grow"></div>
            <span className="px-4 text-gray-500 dark:text-gray-400">or</span>
            <div className="border-t border-gray-300 dark:border-gray-700 flex-grow"></div>
          </div>
          
          <Button 
            variant="outline"
            onClick={navigateToHome}
            className="w-full py-6 text-lg"
          >
            <Play className="h-5 w-5 mr-2" />
            Continue as Guest
          </Button>
          
          <Button 
            variant="link"
            onClick={navigateToRules}
            className="w-full"
          >
            <Info className="h-4 w-4 mr-2" />
            Learn How to Play
          </Button>
        </motion.div>
      </div>
      
      <footer className="mt-auto text-center text-sm text-gray-500 py-4">
        <p>© 2023 BloKu Game - All rights reserved</p>
      </footer>
    </div>
  );
};

export default Index;
