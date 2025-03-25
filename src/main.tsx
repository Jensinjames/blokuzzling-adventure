
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Add console message to help with debugging
if (import.meta.env.DEV) {
  console.log('=== BlokU Application Starting in Development Mode ===');
  console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL || 'Using fallback URL');
  console.log('Anon Key Present:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Yes' : 'Using fallback key');
  console.log('==================================================');
}

createRoot(document.getElementById("root")!).render(<App />);
