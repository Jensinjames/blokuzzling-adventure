
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Info, Users, Play, ChevronRight, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const Home = () => {
  const navigate = useNavigate();
  const [playerCount, setPlayerCount] = useState(2);
  
  const handleStartGame = () => {
    navigate('/game', { state: { numPlayers: playerCount } });
  };
  
  const handlePlayerCountChange = (count: number) => {
    setPlayerCount(count);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-slate-100">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
            BloKu
          </h1>
          <p className="text-gray-600 max-w-md mx-auto">
            A strategic puzzle game where players take turns placing pieces on the board to claim territory
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="glass-panel w-full max-w-sm"
        >
          <div className="space-y-6">
            <div className="space-y-3">
              <h2 className="text-lg font-medium">Players</h2>
              <div className="flex justify-between gap-2">
                {[2, 3, 4].map((count) => (
                  <button
                    key={count}
                    onClick={() => handlePlayerCountChange(count)}
                    className={cn(
                      "flex-1 py-3 rounded-lg transition-all duration-200 border",
                      playerCount === count 
                        ? "bg-primary text-white border-primary shadow-md" 
                        : "bg-white hover:bg-gray-50 border-gray-200"
                    )}
                  >
                    <div className="flex items-center justify-center">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{count}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <Button 
              onClick={handleStartGame}
              className="w-full h-12 text-lg"
            >
              <Play className="h-5 w-5 mr-2" />
              Start Game
            </Button>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="mt-8 space-y-3 w-full max-w-sm"
        >
          <Button 
            variant="outline" 
            className="w-full justify-between group"
            onClick={() => navigate('/rules')}
          >
            <div className="flex items-center">
              <Info className="h-4 w-4 mr-2" />
              Game Rules
            </div>
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-between group"
            onClick={() => navigate('/settings')}
          >
            <div className="flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </div>
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </div>
      
      <footer className="text-center text-sm text-gray-500 py-4">
        <p>© 2023 BloKu Game - All rights reserved</p>
      </footer>
    </div>
  );
};

export default Home;
