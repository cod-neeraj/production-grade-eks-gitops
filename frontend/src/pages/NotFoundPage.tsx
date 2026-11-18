import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <span className="text-8xl font-black text-indigo-600">404</span>
      <h1 className="text-3xl font-bold text-gray-900 mt-4">Page Not Found</h1>
      <p className="text-gray-500 text-sm mt-2 max-w-md">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition shadow-sm"
        >
          <Home size={18} /> Back to Home
        </Link>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition"
        >
          <ArrowLeft size={18} /> Browse Catalog
        </Link>
      </div>
    </div>
  );
};
