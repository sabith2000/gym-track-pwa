import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAttendance } from '../hooks/useAttendance';
import { formatDateString } from '../utils/dateHelpers';

import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import CalendarGrid from '../components/ui/CalendarGrid';
import ActionButtons from '../components/ui/ActionButtons';
import StatusBanner from '../components/ui/StatusBanner';
import EditStatusModal from '../components/modals/EditStatusModal';
import StatsGrid from '../components/dashboard/StatsGrid';
import TodayStatusCard from '../components/dashboard/TodayStatusCard'; 

const Dashboard = () => {
  const { 
    history, stats, loading, markAttendance, refresh,
    isEditing, startEditSession, endEditSession, editTimer, touchedDates
  } = useAttendance();

  const [selectedDate, setSelectedDate] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false); 
  const announcement = ""; 

  const todayStr = formatDateString(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate()
  );
  const todayStatus = history[todayStr];

  const showActionButtons = !todayStatus || isRetrying;

  useEffect(() => {
    if (todayStatus) {
      setIsRetrying(false);
    }
  }, [todayStatus]);

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

    // 1. Future Check
    if (clickedDate > today) {
      toast('Cannot mark future dates!', { icon: '🔮' });
      return;
    }
    
    // 2. Today Check
    if (clickedDate.getTime() === today.getTime()) {
      
      // --- NEW: Block Today interaction if in Past Edit Mode ---
      if (isEditing) {
        toast('Exit Edit Mode to update Today.', { icon: '🔒' });
        return; // Stop here. Do not scroll up.
      }
      // --------------------------------------------------------

      if (todayStatus) {
        if (!isRetrying) {
          setIsRetrying(true);
          toast('Update your status above', { icon: '👆' });
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        toast('Use the big buttons above!', { icon: '👆' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    // 3. Past Date Logic
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
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-gray-900 dark:text-white font-sans transition-colors duration-300">
      
      <Header 
        onRefresh={handleManualRefresh} 
        loading={loading}
        isEditing={isEditing}
        onUnlock={startEditSession} 
        onLock={endEditSession}     
      />

      <main className="flex-grow w-full max-w-md mx-auto px-4 pt-6 pb-8">
        
        <StatusBanner 
          isEditing={isEditing} 
          timer={editTimer} 
          customMessage={announcement} 
        />

        {/* --- ANIMATED TOGGLE SECTION --- */}
        <div className="mb-6 min-h-[140px] flex flex-col justify-center">
          {showActionButtons ? (
            <div key="buttons" className="animate-[fade-in_0.3s_ease-out]">
              <ActionButtons 
                onMark={(status) => markAttendance(status, null)} 
                onCancel={isRetrying ? () => setIsRetrying(false) : null}
                loading={loading} 
                currentStatus={todayStatus} 
                disabled={isEditing} 
              />
            </div>
          ) : (
            <div key="card" className="animate-[fade-in_0.3s_ease-out]">
              <TodayStatusCard 
                status={todayStatus} 
                onEdit={() => setIsRetrying(true)} 
              />
            </div>
          )}
        </div>

        <div className="mb-4">
          <CalendarGrid 
            data={history} 
            isEditing={isEditing}
            onDateClick={handleDateClick}
          />
        </div>

        <StatsGrid stats={stats} />

      </main>

      <Footer />

      <EditStatusModal 
        isOpen={!!selectedDate}
        dateStr={selectedDate}
        onClose={() => setSelectedDate(null)}
        onConfirm={confirmEdit}
      />
    </div>
  );
};

export default Dashboard;