
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { GameSession } from '@/types/database';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Gamepad, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { deleteGameSession } from '@/context/AuthOperations';
import { useAuth } from '@/context/AuthProvider';

interface GameHistoryProps {
  games: GameSession[];
  loading: boolean;
  onGameDeleted?: () => void;
}

const GameHistory: React.FC<GameHistoryProps> = ({ games, loading, onGameDeleted }) => {
  const { user } = useAuth();
  
  const handleDeleteGame = async (gameId: string) => {
    if (confirm('Are you sure you want to delete this game?')) {
      const { error } = await deleteGameSession(gameId);
      if (!error && onGameDeleted) {
        onGameDeleted();
      }
    }
  };
  
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Loading your game history...</p>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="text-center py-10 space-y-3">
        <Gamepad className="h-12 w-12 mx-auto text-gray-400" />
        <p className="text-gray-500 dark:text-gray-400">No games played yet</p>
        <p className="text-sm text-gray-400 dark:text-gray-500">Your game history will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium flex items-center text-gray-900 dark:text-white">
        <Gamepad className="h-5 w-5 mr-2 text-indigo-500" />
        Recent Games
      </h3>
      
      <Table>
        <TableCaption>Your recent game history</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Players</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Result</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {games.slice(0, 5).map((game) => (
            <TableRow key={game.id}>
              <TableCell className="font-medium">
                {formatDistanceToNow(new Date(game.created_at), { addSuffix: true })}
              </TableCell>
              <TableCell>{game.current_players}/{game.max_players}</TableCell>
              <TableCell>
                <GameStatusBadge status={game.status} />
              </TableCell>
              <TableCell>
                {game.winner_id ? (
                  <span className="text-yellow-500 font-medium">{game.winner_id ? "Win" : "Loss"}</span>
                ) : (
                  <span className="text-gray-500">-</span>
                )}
              </TableCell>
              <TableCell>
                {/* Only show delete button for games created by the current user */}
                {user && game.creator_id === user.id && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-gray-500 hover:text-red-500"
                    onClick={() => handleDeleteGame(game.id)}
                    title="Delete game"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const GameStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  switch (status) {
    case 'waiting':
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">Waiting</Badge>;
    case 'playing':
      return <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300">In Progress</Badge>;
    case 'finished':
    case 'completed':
      return <Badge variant="outline" className="bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">Completed</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default GameHistory;
