import React from 'react';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import Dashboard from './pages/Dashboard';
import ReloadPrompt from './components/ui/ReloadPrompt'; // <--- Import it

function App() {
  return (
    <ThemeProvider>
      {/* 1. Global Toast Config */}
      <Toaster 
        position="bottom-center" 
        toastOptions={{ 
          duration: 3000,
          className: '!bg-white dark:!bg-slate-800 dark:!text-white dark:border dark:border-slate-700 !shadow-lg',
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: 'white',
            },
          },
        }} 
      />
      
      {/* 2. The Dashboard Page */}
      <Dashboard />
      
      {/* 3. The PWA Update Listener (Invisible until update available) */}
      <ReloadPrompt />
      
    </ThemeProvider>
  );
}

export default App;