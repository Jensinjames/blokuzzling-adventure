
import React from 'react';

const LoadingState: React.FC = () => {
  return (
    <div className="glass-panel flex justify-center items-center py-12">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-8 w-28 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        <div className="h-24 w-full max-w-md bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </div>
  );
};

export default LoadingState;
