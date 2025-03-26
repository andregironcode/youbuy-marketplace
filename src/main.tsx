import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from '@/context/AuthContext'
import { CurrencyProvider } from '@/context/CurrencyContext'

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <CurrencyProvider>
      <App />
    </CurrencyProvider>
  </AuthProvider>
);
