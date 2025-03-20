
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

interface ProfilePageContainerProps {
  children: React.ReactNode;
  onBack: () => void;
}

const ProfilePageContainer: React.FC<ProfilePageContainerProps> = ({ 
  children,
  onBack
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950 px-4 py-6">
      <div className="max-w-lg mx-auto">
        <header className="flex justify-between items-center mb-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </motion.button>
          <h1 className="text-xl font-bold text-center dark:text-white">Your Profile</h1>
          <div className="w-6"></div>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="glass-panel space-y-6 overflow-hidden bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 dark:border-gray-700/30"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePageContainer;
