
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthProvider';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { LogIn, Play, Info } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate('/home');
    }
  }, [user, loading, navigate]);

  // If still loading or user is logged in (and being redirected), show nothing
  if (loading || user) {
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
