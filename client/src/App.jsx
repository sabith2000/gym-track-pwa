import React, { useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { useAttendance } from './hooks/useAttendance';
import { formatDateString } from './utils/dateHelpers';

import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import StatCard from './components/ui/StatCard';
import CalendarGrid from './components/ui/CalendarGrid';
import ActionButtons from './components/ui/ActionButtons';
import StatusBanner from './components/ui/StatusBanner'; // NEW IMPORT
import EditStatusModal from './components/modals/EditStatusModal';

import { FireIcon, CalendarDaysIcon, ChartBarIcon } from '@heroicons/react/24/solid';

function App() {
  const { 
    history, stats, loading, markAttendance, refresh,
    isEditing, startEditSession, endEditSession, editTimer, touchedDates
  } = useAttendance();

  const [selectedDate, setSelectedDate] = useState(null);

  // --- CONFIGURATION: Your Custom Message ---
  // Leave empty ("") to hide the card.
  // Write text here (e.g., "Gym Closed on Friday!") to show the blue card.
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
          // Timer removed from here
        />

        <main className="max-w-md mx-auto px-4 pt-6 pb-20">
          
          {/* NEW: The Status/Notification Area */}
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

          <div className="grid grid-cols-1 gap-4 mb-8">
            <StatCard title="Total Sessions" value={stats.total} icon={FireIcon} color="text-orange-500 bg-orange-500" />
            <StatCard title="Attendance Rate" value={`${stats.percentage}%`} icon={ChartBarIcon} color="text-blue-500 bg-blue-500" />
            <StatCard title="Current Streak" value="0 Days" icon={CalendarDaysIcon} color="text-emerald-500 bg-emerald-500" />
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