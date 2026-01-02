import React, { useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { useAttendance } from './hooks/useAttendance';
import { formatDateString } from './utils/dateHelpers';

// Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import StatCard from './components/ui/StatCard';
import CalendarGrid from './components/ui/CalendarGrid';
import ActionButtons from './components/ui/ActionButtons';
import StatusBanner from './components/ui/StatusBanner';
import EditStatusModal from './components/modals/EditStatusModal';

// Icons
import { FireIcon, CalendarDaysIcon, ChartBarIcon } from '@heroicons/react/24/solid';

function App() {
  const { 
    history, stats, loading, markAttendance, refresh,
    isEditing, startEditSession, endEditSession, editTimer, touchedDates
  } = useAttendance();

  const [selectedDate, setSelectedDate] = useState(null);

  // Config: Custom Message Banner
  const announcement = ""; 

  const todayStr = formatDateString(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate()
  );
  const todayStatus = history[todayStr];

  const handleManualRefresh = async () => {
    await toast.promise(refresh(), {
      loading: 'Syncing...',
      success: 'Up to date!',
      error: 'Sync failed.',
    });
  };

  const handleDateClick = (dateStr) => {
    const clickedDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0,0,0,0);
    clickedDate.setHours(0,0,0,0);

    if (clickedDate > today) {
      toast('Cannot mark future dates!', { icon: '🔮' });
      return;
    }
    if (clickedDate.getTime() === today.getTime()) {
      toast('Use the big buttons above for Today!', { icon: '👇' });
      return;
    }
    if (touchedDates.has(dateStr)) {
      toast.error('Session Locked: Date already modified.');
      return;
    }
    setSelectedDate(dateStr);
  };

  const confirmEdit = (status) => {
    if (selectedDate) {
      markAttendance(status, selectedDate);
      setSelectedDate(null);
      toast.success('History Updated');
    }
  };

  return (
    <ThemeProvider>
      <Toaster position="bottom-center" toastOptions={{ duration: 3000 }} />

      <div className="min-h-screen bg-slate-100 text-gray-900 font-sans">
        
        <Header 
          onRefresh={handleManualRefresh} 
          loading={loading}
          isEditing={isEditing}
          onUnlock={startEditSession} 
          onLock={endEditSession}     
        />

        <main className="max-w-md mx-auto px-4 pt-6 pb-20">
          
          <StatusBanner 
            isEditing={isEditing} 
            timer={editTimer} 
            customMessage={announcement} 
          />

          <ActionButtons 
            onMark={(status) => markAttendance(status, null)} 
            loading={loading} 
            currentStatus={todayStatus} 
            disabled={isEditing} 
          />

          <div className="mb-4">
            <CalendarGrid 
              data={history} 
              isEditing={isEditing}
              onDateClick={handleDateClick}
            />
          </div>

          {/* --- NEW STATS SECTION --- */}
          <div className="grid grid-cols-1 gap-4 mb-8">
            
            {/* 1. STREAK CARD */}
            <StatCard 
              title="Current Streak" 
              icon={CalendarDaysIcon} 
              color="text-emerald-500 bg-emerald-500"
              badge={`Best: ${stats.bestStreak}`} // Shows "Best: 5" badge
            >
              <div className="flex flex-col">
                <span className="text-3xl font-extrabold leading-none text-gray-900">
                  {stats.streak} {stats.streak === 1 ? 'Day' : 'Days'}
                </span>
                <span className="text-xs font-bold text-emerald-600 mt-1 animate-pulse">
                  {stats.streakMsg}
                </span>
              </div>
            </StatCard>

            {/* 2. ATTENDANCE RATE (Split View) */}
            <StatCard 
              title="Attendance Rate" 
              icon={ChartBarIcon} 
              color="text-blue-500 bg-blue-500"
            >
              <div className="flex items-center justify-between divide-x divide-gray-200">
                <div className="pr-4">
                  <span className="block text-2xl font-bold text-gray-900">{stats.month.percentage}%</span>
                  <span className="text-[10px] text-gray-400 uppercase font-bold">This Month</span>
                </div>
                <div className="pl-4">
                  <span className="block text-2xl font-bold text-gray-400">{stats.total.percentage}%</span>
                  <span className="text-[10px] text-gray-400 uppercase font-bold">Lifetime</span>
                </div>
              </div>
            </StatCard>

            {/* 3. ACTIVITY LOG (Renamed, Split View) */}
            <StatCard 
              title="Activity Log" 
              icon={FireIcon} 
              color="text-orange-500 bg-orange-500"
            >
              <div className="space-y-2 mt-1">
                {/* Monthly Row */}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-medium">Month:</span>
                  <div className="space-x-2">
                    <span className="font-bold text-emerald-600">{stats.month.present} P</span>
                    <span className="text-gray-300">|</span>
                    <span className="font-bold text-rose-500">{stats.month.absent} A</span>
                  </div>
                </div>
                {/* Total Row */}
                <div className="flex justify-between text-sm border-t border-gray-100 pt-1">
                  <span className="text-gray-500 font-medium">Lifetime:</span>
                  <div className="space-x-2">
                    <span className="font-bold text-emerald-600">{stats.total.present} P</span>
                    <span className="text-gray-300">|</span>
                    <span className="font-bold text-rose-500">{stats.total.absent} A</span>
                  </div>
                </div>
              </div>
            </StatCard>

          </div>
        </main>

        <Footer />

        <EditStatusModal 
          isOpen={!!selectedDate}
          dateStr={selectedDate}
          onClose={() => setSelectedDate(null)}
          onConfirm={confirmEdit}
        />
      </div>
    </ThemeProvider>
  );
}

export default App;