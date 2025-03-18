
import { useFetchGameInvites } from './invite/useFetchGameInvites';
import { useSendGameInvite } from './invite/useSendGameInvite';
import { useRespondToInvite } from './invite/useRespondToInvite';

export function useGameInvites() {
  const { invites, loading, fetchGameInvites } = useFetchGameInvites();
  const { invitePlayer } = useSendGameInvite();
  const { respondToInvite } = useRespondToInvite();
  
  return {
    invites,
    loading,
    invitePlayer,
    respondToInvite,
    fetchGameInvites
  };
}
