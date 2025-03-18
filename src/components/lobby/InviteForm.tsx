
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Send, UserPlus } from 'lucide-react';
import { useSendGameInvite } from '@/hooks/invite/useSendGameInvite';
import { Label } from '@/components/ui/label';

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

      <div className="flex flex-col space-y-2">
        <div className="flex space-x-2">
          <div className="flex-grow">
            <Label htmlFor="username-input" className="sr-only">Username</Label>
            <Input
              id="username-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              disabled={inviting}
            />
          </div>
          <Button
            onClick={handleInvitePlayer}
            disabled={!username.trim() || inviting}
            aria-label="Send invite"
          >
            {inviting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </>
  );
};

export default InviteForm;
