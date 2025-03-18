
import React from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut } from 'lucide-react';

interface BoardControlsProps {
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

const BoardControls: React.FC<BoardControlsProps> = ({
  zoomLevel,
  onZoomIn,
  onZoomOut
}) => {
  return (
    <div className="flex space-x-2 mb-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onZoomOut}
        className="h-8 w-8 p-0"
        disabled={zoomLevel <= 0.75}
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onZoomIn}
        className="h-8 w-8 p-0"
        disabled={zoomLevel >= 2}
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default BoardControls;
