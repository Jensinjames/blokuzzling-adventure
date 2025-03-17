
import React from 'react';
import { Button } from '@/components/ui/button';

interface PowerupActiveIndicatorProps {
  isActive: boolean;
  isMyTurn: boolean;
  powerupType: string | null;
  onCancel: () => void;
}

const PowerupActiveIndicator: React.FC<PowerupActiveIndicatorProps> = ({
  isActive,
  isMyTurn,
  powerupType,
  onCancel
}) => {
  if (!isActive || !isMyTurn) return null;

  return (
    <div className="flex justify-center mb-4">
      <Button 
        variant="destructive"
        size="sm"
        className="flex items-center gap-2"
        onClick={onCancel}
      >
        Cancel {powerupType} Powerup
      </Button>
    </div>
  );
};

export default PowerupActiveIndicator;
