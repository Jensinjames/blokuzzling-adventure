
import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { GameInvite } from '@/types/database';
import InviteItem from './InviteItem';

interface InvitesSectionProps {
  invites: GameInvite[];
  onRespond: (inviteId: string, accept: boolean) => Promise<void>;
  formatTimeRemaining: (expiresAt: string) => string;
}

const InvitesSection: React.FC<InvitesSectionProps> = ({
  invites,
  onRespond,
  formatTimeRemaining
}) => {
  if (invites.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel"
    >
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <AlertCircle className="h-5 w-5 mr-2 text-yellow-500" />
        Game Invites
      </h2>

      <div className="space-y-3">
        {invites.map((invite) => (
          <InviteItem 
            key={invite.id}
            invite={invite}
            onRespond={onRespond}
            formatTimeRemaining={formatTimeRemaining}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default InvitesSection;
