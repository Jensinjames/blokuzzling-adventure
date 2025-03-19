
import { useState, useEffect, useRef } from 'react';
import { supabase, safeDataCast } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { GameInvite } from '@/types/database';

export function useFetchGameInvites() {
  const { user } = useAuth();
  const [invites, setInvites] = useState<GameInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const inviteChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Fetch game invites
  const fetchGameInvites = async () => {
    if (!user) return;

    try {
      setLoading(true);
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

    // Clean up previous channel if exists
    if (inviteChannelRef.current) {
      supabase.removeChannel(inviteChannelRef.current);
      inviteChannelRef.current = null;
    }
    
    // Create a unique channel name
    const channelName = `game-invites-${user.id}-${Date.now()}`;

    // Subscribe to invites
    const inviteChannel = supabase
      .channel(channelName)
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
      .subscribe((status) => {
        console.log(`Invite channel subscription status: ${status}`);
        if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to game invite changes');
        }
      });
    
    inviteChannelRef.current = inviteChannel;

    return () => {
      if (inviteChannelRef.current) {
        console.log('Cleaning up invite channel subscription');
        supabase.removeChannel(inviteChannelRef.current);
        inviteChannelRef.current = null;
      }
    };
  }, [user]);

  return {
    invites,
    loading,
    fetchGameInvites
  };
}
