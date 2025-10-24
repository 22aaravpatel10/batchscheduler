'use client';

import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Text */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-slate-200">404</h1>
          <div className="relative -mt-12">
            <h2 className="text-3xl font-bold text-black mb-3">Page Not Found</h2>
            <p className="text-slate-600">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 font-medium transition-colors"
          >
            <Home className="w-4 h-4 mr-2" />
            Go to Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-12 pt-8 border-t border-slate-100">
          <p className="text-sm text-slate-500">
            If you believe this is an error, please contact your system administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
