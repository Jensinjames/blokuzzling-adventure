
import { useAuth as useAuthContext } from '@/context/AuthProvider';

// Re-export the hook from the context to maintain backwards compatibility
export const useAuth = useAuthContext;

export default useAuth;
