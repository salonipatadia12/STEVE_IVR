'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/overview', label: 'Overview', icon: '📊' },
  { href: '/tree', label: 'IVR Tree', icon: '🌳' },
  { href: '/fallouts', label: 'Fallout Analysis', icon: '🚨' },
  { href: '/findings', label: 'Detailed Findings', icon: '🔍' },
  { href: '/recommendations', label: 'Recommendations', icon: '💡' },
  { href: '/comparison', label: 'Comparison', icon: '⚖️' },
];

interface SidebarProps {
  universities: string[];
  selectedUni: string;
  onSelectUni: (uni: string) => void;
  lastUpdated: Date | null;
  onRefresh: () => void;
  autoRefresh: boolean;
  onToggleAutoRefresh: (on: boolean) => void;
}

export default function Sidebar({
  universities,
  selectedUni,
  onSelectUni,
  lastUpdated,
  onRefresh,
  autoRefresh,
  onToggleAutoRefresh,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-sidebar-bg text-sidebar-text flex flex-col shrink-0">
      {/* Brand */}
      <div className="px-5 py-6 border-b border-white/10">
        <h1 className="text-xl font-bold tracking-tight">STEVE</h1>
        <p className="text-xs text-sidebar-text/60 mt-0.5">IVR Intelligence Dashboard</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-sidebar-active text-white'
                  : 'text-sidebar-text/80 hover:bg-sidebar-hover hover:text-white'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* University selector */}
      <div className="px-4 py-3 border-t border-white/10">
        <label className="text-xs font-medium text-sidebar-text/60 uppercase tracking-wider">University</label>
        <select
          value={selectedUni}
          onChange={(e) => onSelectUni(e.target.value)}
          className="mt-1.5 w-full bg-sidebar-hover border border-white/10 rounded-md px-2.5 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-sidebar-active"
        >
          {universities.map((uni) => (
            <option key={uni} value={uni}>
              {uni}
            </option>
          ))}
        </select>
      </div>

      {/* Refresh controls */}
      <div className="px-4 py-3 border-t border-white/10 space-y-2">
        <button
          onClick={onRefresh}
          className="w-full bg-sidebar-hover hover:bg-sidebar-active text-sm font-medium py-2 rounded-md transition-colors"
        >
          ⟳ Refresh Now
        </button>
        <label className="flex items-center gap-2 text-xs text-sidebar-text/60 cursor-pointer">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => onToggleAutoRefresh(e.target.checked)}
            className="rounded accent-sidebar-active"
          />
          Auto-refresh (5 min)
        </label>
        {lastUpdated && (
          <p className="text-xs text-sidebar-text/40">
            Last: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/10">
        <p className="text-xs text-sidebar-text/40">
          {universities.length} {universities.length === 1 ? 'university' : 'universities'} tracked
        </p>
      </div>
    </aside>
  );
}
