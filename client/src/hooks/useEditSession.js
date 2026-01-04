import { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';

export const useEditSession = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTimer, setEditTimer] = useState(0); 
  const [touchedDates, setTouchedDates] = useState(new Set());
  const timerRef = useRef(null);

  const startEditSession = () => {
    setIsEditing(true);
    setEditTimer(60);
    setTouchedDates(new Set()); 
    toast.success('Edit Mode Unlocked');

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setEditTimer((prev) => {
        if (prev <= 1) {
          endEditSession(); 
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const endEditSession = () => {
    setIsEditing(false);
    setEditTimer(0);
    setTouchedDates(new Set());
    if (timerRef.current) clearInterval(timerRef.current);
    toast('Edit Mode Locked', { icon: '🔒' });
  };

  const registerTouch = (dateStr) => {
    if (isEditing) {
      setTouchedDates(prev => new Set(prev).add(dateStr));
    }
  };

  return {
    isEditing,
    editTimer,
    touchedDates,
    startEditSession,
    endEditSession,
    registerTouch
  };
};