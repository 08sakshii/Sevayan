import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { isSupabaseConfigured } from '@/lib/supabase'
import { SetupRequired } from '@/components/SetupRequired'
import App from './App.tsx'

const root = createRoot(document.getElementById('root')!)
root.render(
  <StrictMode>
    {isSupabaseConfigured() ? <App /> : <SetupRequired />}
  </StrictMode>,
)
