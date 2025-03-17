
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMultiplayer } from '@/hooks/useMultiplayer';

interface NewGameDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewGameDialog: React.FC<NewGameDialogProps> = ({ isOpen, onClose }) => {
  const [playerCount, setPlayerCount] = useState(2);
  const { createGameSession } = useMultiplayer();
  const [creating, setCreating] = useState(false);

  const handleStartGame = async () => {
    setCreating(true);
    await createGameSession(playerCount);
    setCreating(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="glass-panel w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Create New Game</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Number of Players
            </label>
            
            <div className="grid grid-cols-3 gap-2">
              {[2, 3, 4].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setPlayerCount(count)}
                  className={`py-3 rounded-lg transition-all duration-200 border ${
                    playerCount === count
                      ? 'bg-primary text-white border-primary shadow-md'
                      : 'bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{count}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex space-x-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleStartGame}
              disabled={creating}
            >
              {creating ? 'Creating...' : 'Create Game'}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default NewGameDialog;
