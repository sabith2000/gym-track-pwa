import React from 'react';
import pkg from '../../../package.json'; // Import package.json

const Footer = () => {
  return (
    <footer className="fixed bottom-0 w-full bg-white/90 backdrop-blur-md border-t border-gray-200 z-40">
      <div className="max-w-md mx-auto px-4 py-3 flex justify-between items-center text-xs text-gray-400">
        <p>© 2026 GymTrack</p>
        <p>v{pkg.version}</p>
      </div>
    </footer>
  );
};

export default Footer;