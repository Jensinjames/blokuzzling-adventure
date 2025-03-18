
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Send, UserPlus } from 'lucide-react';
import { useSendGameInvite } from '@/hooks/invite/useSendGameInvite';

interface InviteFormProps {
  gameId: string;
  userId: string | undefined;
}

const InviteForm: React.FC<InviteFormProps> = ({ gameId, userId }) => {
  const [username, setUsername] = useState('');
  const { invitePlayer, inviting } = useSendGameInvite();

  const handleInvitePlayer = async () => {
    if (!username.trim() || !gameId || !userId) return;
    
    const success = await invitePlayer(gameId, username);
    if (success) {
      setUsername('');
    }
  };

  return (
    <>
      <h3 className="font-semibold flex items-center mb-3">
        <UserPlus className="h-5 w-5 mr-2 text-primary" />
        Invite Players
      </h3>

      <div className="flex space-x-2">
        <Input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username"
          disabled={inviting}
        />
        <Button
          onClick={handleInvitePlayer}
          disabled={!username.trim() || inviting}
        >
          {inviting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </>
  );
};

export default InviteForm;
