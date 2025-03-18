
import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ title, subtitle, children }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
          {title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-md">
          {subtitle}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="glass-panel w-full max-w-sm bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 dark:border-gray-700/30 p-6"
      >
        {children}

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

export default AuthLayout;
