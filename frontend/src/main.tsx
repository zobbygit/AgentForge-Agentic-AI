import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, staleTime: 30000, refetchOnWindowFocus: false },
    mutations: { retry: 0 },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#0f1629', border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0' },
          success: { iconTheme: { primary: '#6366f1', secondary: '#e2e8f0' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#e2e8f0' } },
        }}
      />
    </QueryClientProvider>
  </React.StrictMode>
);
