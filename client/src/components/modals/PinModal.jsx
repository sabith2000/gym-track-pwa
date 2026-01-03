import React, { useState, useEffect, useRef } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const PinModal = ({ isOpen, onClose, onSuccess }) => {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (isOpen) {
      setPin(['', '', '', '']);
      setError(false);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [isOpen]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; 

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError(false);

    if (value && index < 3) {
      inputRefs.current[index + 1].focus();
    }

    if (index === 3 && value) {
      const fullPin = newPin.join('');
      if (fullPin === '0000') {
        onSuccess();
        onClose();
      } else {
        setError(true);
        setPin(['', '', '', '']);
        inputRefs.current[0].focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      {/* UPDATED: dark:bg-slate-900 */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-xs p-6 transform transition-all scale-100 border border-gray-100 dark:border-slate-800">
        
        <div className="flex justify-between items-center mb-6">
          {/* UPDATED: dark:text-white */}
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Admin Access</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* UPDATED: dark:text-slate-400 */}
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-6 text-center">
          Enter PIN to edit past records.
        </p>

        <div className="flex justify-center gap-3 mb-6">
          {pin.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputRefs.current[idx] = el)}
              type="password"
              inputMode="numeric" 
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className={`
                w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 outline-none transition-all
                /* UPDATED: Dark Mode Styles for Inputs */
                dark:bg-slate-800 dark:text-white
                ${error 
                  ? 'border-red-300 bg-red-50 text-red-600 animate-shake dark:bg-red-900/20 dark:border-red-800 dark:text-red-400' 
                  : 'border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 dark:border-slate-700 dark:focus:border-blue-500 dark:focus:ring-blue-900/30'}
              `}
            />
          ))}
        </div>
        
        {error && (
          <p className="text-center text-red-500 text-sm font-medium animate-pulse">
            Incorrect PIN. Try again.
          </p>
        )}
      </div>
    </div>
  );
};

export default PinModal;