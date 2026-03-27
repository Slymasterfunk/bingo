'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function UnauthorizedContent() {
  const searchParams = useSearchParams();
  const blockedIP = searchParams.get('ip') || 'unknown';

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 to-gray-900 flex items-center justify-center p-4">
      <main className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Icon */}
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-12 h-12 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Access Denied
        </h1>

        {/* Message */}
        <div className="mb-8">
          <p className="text-lg text-gray-700 mb-4">
            Your IP address is not authorized to access the admin panel.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600 mb-1">Your IP Address:</p>
            <code className="text-lg font-mono font-semibold text-red-600">
              {blockedIP}
            </code>
          </div>
          <p className="text-sm text-gray-600">
            If you believe this is an error, please contact the system administrator
            to add your IP address to the whitelist.
          </p>
        </div>

        {/* Information box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold text-blue-900 mb-2">For Administrators:</h3>
          <p className="text-sm text-blue-800 mb-2">
            To whitelist an IP address, add it to the <code className="bg-blue-100 px-1 rounded">ADMIN_IP_WHITELIST</code> environment variable:
          </p>
          <ol className="text-sm text-blue-800 space-y-1 ml-4 list-decimal">
            <li>Go to your Vercel project settings</li>
            <li>Navigate to Environment Variables</li>
            <li>Add the IP address to <code className="bg-blue-100 px-1 rounded">ADMIN_IP_WHITELIST</code></li>
            <li>Separate multiple IPs with commas (e.g., "192.168.1.1,203.0.113.0")</li>
            <li>Redeploy the application</li>
          </ol>
        </div>

        {/* Back button */}
        <a
          href="/"
          className="inline-block px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
        >
          ← Back to Home
        </a>
      </main>
    </div>
  );
}

export default function Unauthorized() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-red-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    }>
      <UnauthorizedContent />
    </Suspense>
  );
}
