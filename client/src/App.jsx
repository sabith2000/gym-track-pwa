import React from 'react';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { useAttendance } from './hooks/useAttendance';
import { formatDateString } from './utils/dateHelpers';

// Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import StatCard from './components/ui/StatCard';
import CalendarGrid from './components/ui/CalendarGrid';
import ActionButtons from './components/ui/ActionButtons';

// Icons
import { FireIcon, CalendarDaysIcon, ChartBarIcon } from '@heroicons/react/24/solid';

function App() {
  const { history, stats, loading, markToday } = useAttendance();

  const todayStr = formatDateString(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate()
  );
  const todayStatus = history[todayStr];

  return (
    <ThemeProvider>
      <Toaster position="bottom-center" toastOptions={{ duration: 3000 }} />

      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        <Header />

        <main className="max-w-md mx-auto px-4 pt-6 pb-20">
          
          {/* 1. Action Buttons (Top Priority) */}
          <ActionButtons 
            onMark={markToday} 
            loading={loading} 
            currentStatus={todayStatus} 
          />

          {/* 2. Calendar (Moved Up) */}
          <div className="mb-4">
            <CalendarGrid data={history} />
          </div>

          {/* 3. Stats Grid (Moved Down) */}
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