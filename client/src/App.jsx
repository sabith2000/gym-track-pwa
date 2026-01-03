import React from 'react';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <ThemeProvider>
      <Toaster 
        position="bottom-center" 
        toastOptions={{ 
          duration: 3000,
          // UPDATED: This className forces the toast to adapt to Dark Mode
          className: '!bg-white dark:!bg-slate-800 dark:!text-white dark:border dark:border-slate-700 !shadow-lg',
          // Optional: Override success/error icons colors if needed
          success: {
            iconTheme: {
              primary: '#10b981', // Emerald-500
              secondary: 'white',
            },
          },
        }} 
      />
      <Dashboard />
    </ThemeProvider>
  );
}

export default App;