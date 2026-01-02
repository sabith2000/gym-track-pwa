import React from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { useAttendance } from './hooks/useAttendance';
import { formatDateString } from './utils/dateHelpers';

import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import StatCard from './components/ui/StatCard';
import CalendarGrid from './components/ui/CalendarGrid';
import ActionButtons from './components/ui/ActionButtons';

import { FireIcon, CalendarDaysIcon, ChartBarIcon } from '@heroicons/react/24/solid';

function App() {
  const { history, stats, loading, markToday, refresh } = useAttendance();

  const todayStr = formatDateString(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate()
  );
  const todayStatus = history[todayStr];

  // Manual Refresh Handler
  const handleManualRefresh = async () => {
    await toast.promise(
      refresh(), 
      {
        loading: 'Syncing...',
        success: 'Up to date!',
        error: 'Sync failed.',
      }
    );
  };

  return (
    <ThemeProvider>
      <Toaster position="bottom-center" toastOptions={{ duration: 3000 }} />

      {/* UPDATED BACKGROUND: bg-slate-100 (Cool Professional Gray) */}
      <div className="min-h-screen bg-slate-100 text-gray-900 font-sans">
        
        <Header 
          onRefresh={handleManualRefresh} 
          loading={loading} 
        />

        <main className="max-w-md mx-auto px-4 pt-6 pb-20">
          
          <ActionButtons 
            onMark={markToday} 
            loading={loading} 
            currentStatus={todayStatus} 
          />

          <div className="mb-4">
            <CalendarGrid data={history} />
          </div>

          <div className="grid grid-cols-1 gap-4 mb-8">
            <StatCard 
              title="Total Sessions" 
              value={stats.total} 
              icon={FireIcon} 
              color="text-orange-500 bg-orange-500" 
            />
            <StatCard 
              title="Attendance Rate" 
              value={`${stats.percentage}%`} 
              icon={ChartBarIcon} 
              color="text-blue-500 bg-blue-500" 
            />
            <StatCard 
              title="Current Streak" 
              value="0 Days" 
              icon={CalendarDaysIcon} 
              color="text-emerald-500 bg-emerald-500" 
            />
          </div>

        </main>

        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default App;