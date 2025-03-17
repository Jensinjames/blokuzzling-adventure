
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MultiplayerHeaderProps {
  onHome: () => void;
}

const MultiplayerHeader: React.FC<MultiplayerHeaderProps> = ({ onHome }) => {
  return (
    <header className="flex justify-between items-center mb-4">
      <button 
        onClick={onHome}
        className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back
      </button>
      <h1 className="text-xl font-bold text-center dark:text-white">Multiplayer Game</h1>
      <div className="w-6"></div>
    </header>
  );
};

export default MultiplayerHeader;
