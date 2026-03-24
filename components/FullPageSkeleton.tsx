import React from 'react';

export const FullPageSkeleton = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header Skeleton */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo skeleton */}
            <div className="flex items-center">
              <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* Navigation skeleton - desktop */}
            <div className="hidden md:flex space-x-8">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-4 w-16 bg-gray-200 rounded animate-pulse"
                ></div>
              ))}
            </div>

            {/* Mobile menu button skeleton */}
            <div className="md:hidden">
              <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className="flex-1 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero section skeleton */}
          <div className="text-center mb-16">
            <div className="h-12 w-96 bg-gray-200 rounded mx-auto mb-4 animate-pulse"></div>
            <div className="h-6 w-64 bg-gray-200 rounded mx-auto mb-8 animate-pulse"></div>
            <div className="flex justify-center space-x-4">
              <div className="h-12 w-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-12 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Content cards skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6">
                <div className="h-6 w-3/4 bg-gray-200 rounded mb-4 animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-4/6 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer Skeleton */}
      <footer className="bg-gray-900 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <div className="h-6 w-24 bg-gray-700 rounded mb-4 animate-pulse"></div>
                <div className="space-y-2">
                  {[...Array(4)].map((_, j) => (
                    <div
                      key={j}
                      className="h-4 w-20 bg-gray-700 rounded animate-pulse"
                    ></div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t border-gray-700">
            <div className="h-4 w-64 bg-gray-700 rounded mx-auto animate-pulse"></div>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Skeleton */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col items-center py-2">
              <div className="h-6 w-6 bg-gray-200 rounded animate-pulse mb-1"></div>
              <div className="h-3 w-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
