import React from 'react';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <ThemeProvider>
      <Toaster position="bottom-center" toastOptions={{ duration: 3000 }} />
      <Dashboard />
    </ThemeProvider>
  );
}

export default App;