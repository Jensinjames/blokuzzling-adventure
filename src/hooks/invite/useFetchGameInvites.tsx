
import { useState, useEffect } from 'react';
import { supabase, safeDataCast } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { GameInvite } from '@/types/database';

export function useFetchGameInvites() {
  const { user } = useAuth();
  const [invites, setInvites] = useState<GameInvite[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch game invites
  const fetchGameInvites = async () => {
    if (!user) return;

    try {
      // Fetch pending invites for the user
      const { data, error } = await supabase
        .from('game_invites')
        .select(`
          *,
          sender:profiles!game_invites_sender_id_fkey(id, username, avatar_url)
        `)
        .eq('recipient_id', user.id)
        .eq('status', 'pending')
        .lt('expires_at', new Date(Date.now() + 10000).toISOString()) // Only get non-expired invites
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setInvites(safeDataCast<GameInvite>(data));
    } catch (error) {
      console.error('Error fetching game invites:', error);
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to invites
  useEffect(() => {
    if (!user) return;

    fetchGameInvites();

    // Subscribe to invites
    const inviteChannel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_invites',
          filter: `recipient_id=eq.${user.id}`
        },
        () => {
          // Refresh invites when there's a change
          fetchGameInvites();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(inviteChannel);
    };
  }, [user]);

  return {
    invites,
    loading,
    fetchGameInvites
  };
}
