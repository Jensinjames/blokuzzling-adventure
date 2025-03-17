
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Puzzle, SquareCheck, Move } from 'lucide-react';

const Rules = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-slate-100 px-4 py-6">
      <div className="max-w-lg mx-auto">
        <header className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/')}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Game Rules</h1>
        </header>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="glass-panel mb-4"
        >
          <div className="flex items-center mb-3">
            <Puzzle className="h-5 w-5 text-primary mr-2" />
            <h2 className="text-lg font-medium">Objective</h2>
          </div>
          <p className="text-gray-700">
            BloKu is a strategic board game where players take turns placing pieces on the board. 
            The goal is to place as many of your pieces as possible while blocking opponents.
            The player who places the most pieces wins.
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="glass-panel mb-4"
        >
          <div className="flex items-center mb-3">
            <SquareCheck className="h-5 w-5 text-primary mr-2" />
            <h2 className="text-lg font-medium">Game Setup</h2>
          </div>
          <ul className="space-y-2 text-gray-700 list-disc pl-5">
            <li>Each player has their own set of uniquely shaped pieces</li>
            <li>The game is played on a square grid</li>
            <li>Each player starts from a designated corner of the board</li>
            <li>Players take turns placing one piece at a time</li>
          </ul>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="glass-panel mb-4"
        >
          <div className="flex items-center mb-3">
            <Move className="h-5 w-5 text-primary mr-2" />
            <h2 className="text-lg font-medium">Placement Rules</h2>
          </div>
          <ul className="space-y-2 text-gray-700 list-disc pl-5">
            <li>Your first piece must cover your designated corner</li>
            <li>Subsequent pieces must touch at least one of your existing pieces, but only at the corners (diagonal touch)</li>
            <li>Your pieces cannot share edges with your own pieces</li>
            <li>Pieces can be rotated and flipped before placement</li>
            <li>If you cannot place any more pieces, your turn is skipped</li>
          </ul>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="glass-panel mb-6"
        >
          <h2 className="text-lg font-medium mb-3">Scoring</h2>
          <ul className="space-y-2 text-gray-700 list-disc pl-5">
            <li>Players earn points for each square of the pieces they successfully place</li>
            <li>The game ends when no player can place any more pieces</li>
            <li>The player with the highest score wins</li>
          </ul>
        </motion.div>
        
        <div className="flex justify-center mb-8">
          <Button 
            onClick={() => navigate('/')}
            size="lg"
            className="transition-all duration-200 hover:scale-105"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Rules;
