import React from 'react';

const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 shadow-xl rounded-2xl p-8 border border-gray-100 dark:border-slate-800 text-center">
        
        {/* Icon */}
        <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
          <span className="text-3xl">⚠️</span>
        </div>

        {/* Text */}
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3">
          Something went wrong
        </h2>
        <p className="text-gray-500 dark:text-slate-400 mb-6 text-sm">
          Gym-Log encountered an unexpected error. Don't worry, your data is safe.
        </p>

        {/* Technical Error (Optional - good for debugging) */}
        <pre className="text-[10px] text-left bg-gray-100 dark:bg-slate-950 p-3 rounded-lg text-red-600 overflow-auto max-h-20 mb-6">
          {error.message}
        </pre>

        {/* Reload Button */}
        <button
          onClick={resetErrorBoundary}
          className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-transform active:scale-95 shadow-lg shadow-emerald-200 dark:shadow-none"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

export default ErrorFallback;