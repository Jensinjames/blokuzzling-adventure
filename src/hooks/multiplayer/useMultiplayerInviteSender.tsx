
import { useGameInvites } from '@/hooks/useGameInvites';

export function useMultiplayerInviteSender() {
  const { invitePlayer } = useGameInvites();
  
  return {
    invitePlayer
  };
}
