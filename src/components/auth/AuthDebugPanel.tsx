
import React from 'react';
import { useAuth } from '@/context/AuthProvider';

interface AuthDebugPanelProps {
  show?: boolean;
}

/**
 * A component that displays authentication debugging information
 * Only visible in development mode and when explicitly enabled
 */
const AuthDebugPanel: React.FC<AuthDebugPanelProps> = ({ show = false }) => {
  const { user, session, loading, subscription } = useAuth();
  
  if (!import.meta.env.DEV || !show) {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg opacity-80 hover:opacity-100 transition-opacity z-50 max-w-md overflow-auto max-h-96 text-xs">
      <h3 className="font-bold mb-2 border-b border-gray-700 pb-1">Auth Debug</h3>
      
      <div className="space-y-2">
        <div>
          <p className="font-semibold">Status:</p>
          <p>Loading: {loading ? 'Yes' : 'No'}</p>
          <p>Authenticated: {user ? 'Yes' : 'No'}</p>
          <p>Session Valid: {session ? 'Yes' : 'No'}</p>
        </div>
        
        {user && (
          <div>
            <p className="font-semibold">User:</p>
            <p>ID: {user.id}</p>
            <p>Email: {user.email}</p>
            <p>Created: {new Date(user.created_at).toLocaleString()}</p>
          </div>
        )}
        
        {session && (
          <div>
            <p className="font-semibold">Session:</p>
            <p>Expires At: {new Date(session.expires_at! * 1000).toLocaleString()}</p>
            <p>
              Status: {
                new Date(session.expires_at! * 1000) > new Date() 
                  ? 'Valid' 
                  : 'Expired'
              }
            </p>
          </div>
        )}
        
        <div>
          <p className="font-semibold">Subscription:</p>
          <p>Tier: {subscription.tier || 'None'}</p>
          <p>Active: {subscription.isActive ? 'Yes' : 'No'}</p>
        </div>
        
        <div>
          <p className="font-semibold">Environment:</p>
          <p>URL: {window.location.href}</p>
          <p>Path: {window.location.pathname}</p>
          <p>
            Supabase URL: {
              import.meta.env.VITE_SUPABASE_URL 
                ? 'Set' 
                : 'Using fallback'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthDebugPanel;
