'use client';

import { useState, createContext, useContext } from 'react';
import Sidebar from './Sidebar';
import { useSheetData } from '@/hooks/useSheetData';
import type { SheetData } from '@/lib/types';

interface DashboardContextType {
  data: SheetData;
  selectedUni: string;
}

const DashboardContext = createContext<DashboardContextType | null>(null);

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard must be used within DashboardShell');
  return ctx;
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const { data, loading, error, lastUpdated, refresh, autoRefresh, setAutoRefresh } = useSheetData();
  const [selectedUni, setSelectedUni] = useState('');

  // Set default university once data loads
  if (data && !selectedUni && data.universities.length > 0) {
    setSelectedUni(data.universities[0]);
  }

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500 text-sm">Loading IVR data...</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-lg font-semibold text-gray-800">Failed to Load Data</h2>
          <p className="text-sm text-gray-500 mt-2">{error}</p>
          <p className="text-xs text-gray-400 mt-4">
            Make sure the Google Sheet is published to the web:
            <br />File → Share → Publish to web → Entire Document
          </p>
          <button
            onClick={refresh}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <DashboardContext.Provider value={{ data, selectedUni }}>
      <div className="flex min-h-screen">
        <Sidebar
          universities={data.universities}
          selectedUni={selectedUni}
          onSelectUni={setSelectedUni}
          lastUpdated={lastUpdated}
          onRefresh={refresh}
          autoRefresh={autoRefresh}
          onToggleAutoRefresh={setAutoRefresh}
        />
        <main className="flex-1 bg-background overflow-auto">
          <div className="p-8 max-w-7xl mx-auto">
            {loading && (
              <div className="fixed top-4 right-4 bg-blue-500 text-white text-xs px-3 py-1.5 rounded-full shadow-lg animate-pulse z-50">
                Refreshing...
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </DashboardContext.Provider>
  );
}
