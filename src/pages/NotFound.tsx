
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Home, Frown } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-slate-100 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-panel text-center max-w-md py-10 px-6"
      >
        <Frown className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h1 className="text-3xl font-bold mb-2">404</h1>
        <p className="text-xl text-gray-600 mb-6">Oops! Page not found</p>
        <p className="text-gray-500 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button 
          onClick={() => navigate('/')}
          size="lg"
          className="transition-all duration-200 hover:scale-105"
        >
          <Home className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
      </motion.div>
    </div>
  );
};

export default NotFound;
