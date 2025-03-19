import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { LogIn, Play, Info } from 'lucide-react';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { toast } from 'sonner';

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuthCheck({ skip: true });
  const { signInWithGoogle, loading: googleLoading } = useGoogleAuth();

  useEffect(() => {
    if (!isLoading && user) {
      navigate('/home');
    }
  }, [user, isLoading, navigate]);

  const handleGoogleSignIn = async () => {
    await signInWithGoogle('/home');
  };

  if (isLoading || user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-pulse h-10 w-10 rounded-full bg-primary/50"></div>
      </div>
    );
  }

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
            onClick={() => navigate('/auth')}
            className="w-full py-6 text-lg"
          >
            <LogIn className="h-5 w-5 mr-2" />
            Sign In / Sign Up
          </Button>
          
          <Button 
            variant="outline"
            onClick={handleGoogleSignIn}
            className="w-full py-6 text-lg"
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Sign In with Google
          </Button>
          
          <div className="flex items-center justify-center">
            <div className="border-t border-gray-300 dark:border-gray-700 flex-grow"></div>
            <span className="px-4 text-gray-500 dark:text-gray-400">or</span>
            <div className="border-t border-gray-300 dark:border-gray-700 flex-grow"></div>
          </div>
          
          <Button 
            variant="outline"
            onClick={() => navigate('/home')}
            className="w-full py-6 text-lg"
          >
            <Play className="h-5 w-5 mr-2" />
            Continue as Guest
          </Button>
          
          <Button 
            variant="link"
            onClick={() => navigate('/rules')}
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
