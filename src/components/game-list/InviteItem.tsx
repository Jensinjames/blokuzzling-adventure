
import React from 'react';
import { Button } from '@/components/ui/button';
import { Clock, Info, X, Check } from 'lucide-react';
import { GameInvite } from '@/types/database';
import { motion } from 'framer-motion';

interface InviteItemProps {
  invite: GameInvite;
  onRespond: (inviteId: string, accept: boolean) => Promise<void>;
  formatTimeRemaining: (expiresAt: string) => string;
}

const InviteItem: React.FC<InviteItemProps> = ({
  invite,
  onRespond,
  formatTimeRemaining
}) => {
  return (
    <div
      key={invite.id}
      className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-yellow-200 dark:border-yellow-900"
    >
      <div className="flex justify-between items-center">
        <div>
          <p className="font-medium">{invite.sender?.username} invited you to a game</p>
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
            <Clock className="h-3 w-3 inline mr-1" />
            <span className="mr-2">{new Date(invite.created_at).toLocaleString()}</span>
            
            {invite.expires_at && (
              <span className="flex items-center">
                <Info className="h-3 w-3 mr-1" />
                <span className={`${
                  new Date(invite.expires_at).getTime() - Date.now() < 3600000 
                    ? 'text-orange-500' 
                    : 'text-gray-500'
                }`}>
                  Expires in: {formatTimeRemaining(invite.expires_at)}
                </span>
              </span>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onRespond(invite.id, false)}
            className="h-8 px-2 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900"
          >
            <X className="h-4 w-4 mr-1" />
            Decline
          </Button>
          <Button
            size="sm"
            onClick={() => onRespond(invite.id, true)}
            className="h-8 px-2"
          >
            <Check className="h-4 w-4 mr-1" />
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InviteItem;
