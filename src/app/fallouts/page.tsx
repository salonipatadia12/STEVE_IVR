'use client';

import { useDashboard } from '@/components/DashboardShell';
import { getTypeColor } from '@/lib/friction';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, PieLabelRenderProps } from 'recharts';

export default function FalloutsPage() {
  const { data, selectedUni } = useDashboard();

  const uniMenu = data.menuMapping.filter(m => m.university === selectedUni);
  const uniScript = data.scriptCapture.filter(s => s.university === selectedUni);

  const totalPaths = uniMenu.length || 1;
  const humanPaths = uniMenu.filter(m => m.human || m.type.toLowerCase() === 'human' || m.type.toLowerCase() === 'transfer').length;
  const deadEnds = uniMenu.filter(m => ['dead_end', 'closed'].includes(m.type.toLowerCase())).length;
  const humanPct = Math.round((humanPaths / totalPaths) * 100);

  // Outcome distribution
  const typeCounts: Record<string, number> = {};
  for (const item of uniMenu) {
    const t = item.type.toLowerCase();
    typeCounts[t] = (typeCounts[t] || 0) + 1;
  }
  const outcomeData = Object.entries(typeCounts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color: getTypeColor(name),
  }));

  // Self-service level distribution
  const sslCounts: Record<string, number> = {};
  for (const item of uniScript) {
    const level = item.self_service_level || 'unknown';
    sslCounts[level] = (sslCounts[level] || 0) + 1;
  }
  const sslData = Object.entries(sslCounts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color: name === 'high' ? '#22c55e' : name === 'medium' ? '#f59e0b' : name === 'low' ? '#ef4444' : '#94a3b8',
  }));

  // Sankey-like flow: Level 1 entries → Outcome types
  const level1 = uniMenu.filter(m => m.menu_level === 1);
  const flowData = level1.map(item => ({
    source: `[${item.digit}] ${item.option_label}`,
    target: item.type,
    targetColor: getTypeColor(item.type),
  }));

  // Friction hotspot table
  const hotspots = uniMenu
    .map(item => {
      let risk = 0;
      if (['dead_end', 'closed'].includes(item.type.toLowerCase())) risk += 50;
      if (item.type.toLowerCase() === 'voicemail') risk += 30;
      if (!item.human && !['submenu', 'navigation'].includes(item.type.toLowerCase())) risk += 20;
      if (item.menu_level > 2) risk += 10;
      return { ...item, risk };
    })
    .sort((a, b) => b.risk - a.risk);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Fallout Analysis</h1>
      <p className="text-sm text-gray-500 mb-6">{selectedUni} — Where callers get stuck</p>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-card-bg border border-card-border rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Menu Paths</p>
          <p className="text-3xl font-bold mt-1">{totalPaths}</p>
        </div>
        <div className="bg-card-bg border border-card-border rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Reach a Human</p>
          <p className="text-3xl font-bold mt-1" style={{ color: humanPct > 0 ? '#22c55e' : '#ef4444' }}>
            {humanPct}%
          </p>
          <p className="text-xs text-gray-400">{humanPaths} of {totalPaths} paths</p>
        </div>
        <div className="bg-card-bg border border-card-border rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Dead Ends</p>
          <p className="text-3xl font-bold mt-1" style={{ color: deadEnds > 0 ? '#ef4444' : '#22c55e' }}>
            {deadEnds}
          </p>
        </div>
        <div className="bg-card-bg border border-card-border rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Menu Options Tracked</p>
          <p className="text-3xl font-bold mt-1">{uniScript.length}</p>
          <p className="text-xs text-gray-400">Script captures</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Outcome Distribution */}
        <div className="bg-card-bg border border-card-border rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Outcome Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={outcomeData}
                cx="50%" cy="50%"
                innerRadius={60} outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                label={(props: PieLabelRenderProps) => `${props.name ?? ''} (${(((props.percent as number) ?? 0) * 100).toFixed(0)}%)`}
              >
                {outcomeData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Self-Service Level */}
        <div className="bg-card-bg border border-card-border rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Self-Service Level</h3>
          {sslData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={sslData}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={(props: PieLabelRenderProps) => `${props.name ?? ''} (${(((props.percent as number) ?? 0) * 100).toFixed(0)}%)`}
                >
                  {sslData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400">No script capture data available.</p>
          )}
        </div>
      </div>

      {/* Call Flow */}
      <div className="bg-card-bg border border-card-border rounded-xl p-6 shadow-sm mb-8">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Call Flow — Level 1 Options → Outcomes</h3>
        <div className="space-y-2">
          {flowData.map((flow, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="flex-1 text-sm font-medium text-gray-700 text-right pr-2 truncate">{flow.source}</div>
              <div className="w-24 h-2 rounded-full bg-gray-100 relative overflow-hidden">
                <div className="absolute inset-0 rounded-full" style={{ backgroundColor: flow.targetColor, opacity: 0.7 }} />
              </div>
              <div className="flex-1">
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full text-white"
                  style={{ backgroundColor: flow.targetColor }}>
                  {flow.target}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Friction Hotspot Table */}
      <div className="bg-card-bg border border-card-border rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-card-border">
          <h3 className="text-sm font-semibold text-gray-700">Friction Hotspots</h3>
          <p className="text-xs text-gray-400 mt-1">Menu options ranked by friction risk</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Risk', 'Digit', 'Level', 'Option', 'Type', 'Human', 'Leads To'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {hotspots.map((item, i) => (
                <tr key={i} className={item.risk >= 50 ? 'bg-red-50' : item.risk >= 20 ? 'bg-amber-50' : ''}>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                      item.risk >= 50 ? 'bg-red-100 text-red-700' : item.risk >= 20 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {item.risk}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono font-bold">{item.digit}</td>
                  <td className="px-4 py-3">{item.menu_level}</td>
                  <td className="px-4 py-3">{item.option_label}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full text-white"
                      style={{ backgroundColor: getTypeColor(item.type) }}>
                      {item.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">{item.human ? '✓' : '✕'}</td>
                  <td className="px-4 py-3 text-gray-600">{item.leads_to}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
