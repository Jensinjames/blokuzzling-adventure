
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Info, Users, Play, ChevronRight, Settings, UserCircle, Trophy, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useGameSessions } from '@/hooks/useGameSessions';
import { useGameInvites } from '@/hooks/useGameInvites';
import GameList from '@/components/GameList';
import NewGameDialog from '@/components/NewGameDialog';

const Home = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { profile } = useProfile();
  const { activeSessions, userSessions, loading: sessionsLoading } = useGameSessions();
  const { invites, loading: invitesLoading } = useGameInvites();
  const [showNewGameDialog, setShowNewGameDialog] = useState(false);
  
  const handleStartSinglePlayerGame = () => {
    navigate('/game', { state: { numPlayers: 2 } });
  };
  
  const openNewGameDialog = () => {
    setShowNewGameDialog(true);
  };
  
  const closeNewGameDialog = () => {
    setShowNewGameDialog(false);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex-1 flex flex-col p-6">
        <header className="flex justify-between items-center mb-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-left"
          >
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              BloKu
            </h1>
          </motion.div>
          
          {user && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/profile')}
                className="flex items-center"
              >
                <UserCircle className="h-5 w-5 mr-2" />
                <span className="font-medium">{profile?.username || 'Profile'}</span>
              </Button>
            </motion.div>
          )}
        </header>
        
        <div className="max-w-lg mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel mb-6"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Play className="h-5 w-5 mr-2 text-primary" />
              Play BloKu
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button 
                onClick={handleStartSinglePlayerGame}
                className="h-auto py-3 justify-start"
                variant="outline"
              >
                <div className="flex flex-col items-start text-left">
                  <span className="font-semibold">Single Player</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Play against AI
                  </span>
                </div>
              </Button>
              
              <Button 
                onClick={openNewGameDialog}
                className="h-auto py-3 justify-start relative overflow-hidden"
              >
                <div className="flex flex-col items-start text-left">
                  <span className="font-semibold">Multiplayer</span>
                  <span className="text-xs text-primary-foreground/80">
                    Play with friends
                  </span>
                </div>
                {invites.length > 0 && (
                  <div className="absolute top-0 right-0 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full transform translate-x-[-8px] translate-y-[-4px]">
                    {invites.length}
                  </div>
                )}
              </Button>
            </div>
          </motion.div>
          
          {user ? (
            <GameList
              activeSessions={activeSessions}
              userSessions={userSessions}
              invites={invites}
              loading={sessionsLoading || invitesLoading}
            />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-panel text-center py-6 px-4"
            >
              <Trophy className="h-8 w-8 text-primary mx-auto mb-3" />
              <h2 className="text-xl font-semibold mb-2">Unlock Multiplayer</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Sign in to track your progress, play with friends, and compete online.
              </p>
              <Button onClick={() => navigate('/auth')}>
                Sign In / Sign Up
              </Button>
            </motion.div>
          )}
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="mt-8 space-y-3 w-full"
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
          
          <div className="fixed bottom-6 right-6 md:hidden">
            <Button
              size="icon"
              className="h-14 w-14 rounded-full shadow-lg"
              onClick={openNewGameDialog}
            >
              <Plus className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
      
      <footer className="text-center text-sm text-gray-500 py-4">
        <p>© 2023 BloKu Game - All rights reserved</p>
      </footer>
      
      <NewGameDialog 
        isOpen={showNewGameDialog}
        onClose={closeNewGameDialog}
      />
    </div>
  );
};

export default Home;
