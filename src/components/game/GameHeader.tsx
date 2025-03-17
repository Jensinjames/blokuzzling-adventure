
import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface GameHeaderProps {
  title: string;
  onBack: () => void;
}

const GameHeader: React.FC<GameHeaderProps> = ({ title, onBack }) => {
  return (
    <header className="flex justify-between items-center mb-4">
      <button 
        onClick={onBack}
        className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back
      </button>
      <h1 className="text-xl font-bold text-center dark:text-white">
        {title}
      </h1>
      <div className="w-6"></div>
    </header>
  );
};

export default GameHeader;
