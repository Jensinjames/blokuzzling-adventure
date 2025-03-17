
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Send, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface InviteFormProps {
  gameId: string;
  userId: string | undefined;
}

const InviteForm: React.FC<InviteFormProps> = ({ gameId, userId }) => {
  const [username, setUsername] = useState('');
  const [inviting, setInviting] = useState(false);

  const handleInvitePlayer = async () => {
    if (!username.trim() || !gameId || !userId) return;
    
    setInviting(true);
    try {
      // Find the user by username
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .ilike('username', username)
        .single();

      if (userError || !userData) {
        toast.error('User not found');
        return;
      }

      // Create invite
      const { error: inviteError } = await supabase
        .from('game_invites')
        .insert([{
          game_id: gameId,
          sender_id: userId,
          recipient_id: userData.id,
          status: 'pending'
        }]);

      if (inviteError) throw inviteError;

      toast.success(`Invite sent to ${username}`);
      setUsername('');
    } catch (error) {
      console.error('Error inviting player:', error);
      toast.error('Failed to invite player');
    } finally {
      setInviting(false);
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
