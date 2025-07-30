import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black text-white">
      <div className="w-full max-w-md mx-4 p-8 bg-gray-900 border border-red-500 rounded-lg">
        <div className="text-center">
          <div className="text-6xl text-red-500 mb-4">404</div>
          <h1 className="text-2xl font-bold text-white mb-4">SYSTEM ACCESS DENIED</h1>
          <p className="text-gray-400 mb-6">
            The requested StormVerse module was not found in the system matrix.
          </p>
          <Link 
            to="/" 
            className="inline-block px-6 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 transition-colors"
          >
            Return to StormVerse
          </Link>
        </div>
        <div className="mt-8 text-center text-xs text-gray-600">
          © 2025 Daniel Guzman - All Rights Reserved
        </div>
      </div>
    </div>
  );
}
