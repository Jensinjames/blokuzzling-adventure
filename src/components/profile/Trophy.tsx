
import React from 'react';

// This component wraps the Trophy icon from Lucide React
const Trophy: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M8 21h8"></path>
      <path d="M12 17v4"></path>
      <path d="M17 7v8.8a2 2 0 0 1-1.8 2H8.8a2 2 0 0 1-2-1.8V7"></path>
      <path d="M6 2h12v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V2z"></path>
    </svg>
  );
};

export default Trophy;
