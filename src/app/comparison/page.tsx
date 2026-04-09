'use client';

import { useDashboard } from '@/components/DashboardShell';
import { calculateFriction, gradeColor } from '@/lib/friction';
import GradeBadge from '@/components/GradeBadge';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
} from 'recharts';

const RADAR_COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6'];

export default function ComparisonPage() {
  const { data } = useDashboard();

  const universities = data.universities;

  // Calculate friction for all universities
  const allFriction = universities.map(uni => {
    const frictionRow = data.frictionScore.find(f => f.university === uni);
    if (frictionRow && frictionRow.total_score) {
      return {
        university: uni,
        total_score: frictionRow.total_score,
        grade: frictionRow.grade,
        components: {
          'Menu Depth': frictionRow.depth_score,
          'Options Complexity': frictionRow.options_score,
          'Time to Resolution': frictionRow.time_score,
          'Dead Ends': frictionRow.dead_end_score,
          'Agent Accessibility': frictionRow.agent_access_score,
          'Prompt Clarity': frictionRow.clarity_score,
          'Operator Availability': frictionRow.operator_score,
        },
        max_depth: frictionRow.max_depth,
        avg_options: frictionRow.avg_options,
        dead_end_count: frictionRow.dead_end_count,
        human_count: frictionRow.human_reachable_count,
      };
    }
    const calc = calculateFriction(uni, data.menuMapping, data.overview, data.systemCharacteristics);
    return {
      university: uni,
      total_score: calc.total_score,
      grade: calc.grade,
      components: calc.components,
      max_depth: calc.max_depth,
      avg_options: calc.avg_options,
      dead_end_count: calc.dead_end_count,
      human_count: calc.human_count,
    };
  }).sort((a, b) => a.total_score - b.total_score);

  // Bar chart data
  const barData = allFriction.map(f => ({
    name: f.university.length > 20 ? f.university.slice(0, 20) + '...' : f.university,
    score: f.total_score,
    grade: f.grade,
  }));

  // Radar overlay data
  const componentNames = ['Menu Depth', 'Options Complexity', 'Time to Resolution', 'Dead Ends', 'Agent Accessibility', 'Prompt Clarity', 'Operator Availability'];
  const radarData = componentNames.map(comp => {
    const entry: Record<string, unknown> = { subject: comp.replace('Operator Availability', 'Operator').replace('Agent Accessibility', 'Agent Access') };
    allFriction.forEach(f => {
      entry[f.university] = f.components[comp] || 0;
    });
    return entry;
  });

  // Heatmap data
  const heatmapUnis = allFriction;

  if (universities.length < 2) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">University Comparison</h1>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center mt-8">
          <p className="text-4xl mb-4">📊</p>
          <h3 className="text-lg font-semibold text-blue-800">Need More Data</h3>
          <p className="text-sm text-blue-600 mt-2">
            Comparison requires data from at least 2 universities.
            <br />Currently {universities.length} {universities.length === 1 ? 'university has' : 'universities have'} been scraped.
          </p>
          <p className="text-xs text-blue-400 mt-4">Run STEVE against more universities to unlock this view.</p>
        </div>

        {/* Still show the single university stats */}
        {allFriction.length === 1 && (
          <div className="mt-8 bg-card-bg border border-card-border rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Current Data — {allFriction[0].university}</h3>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-400">Score</p>
                <p className="text-2xl font-bold" style={{ color: gradeColor(allFriction[0].grade) }}>{allFriction[0].total_score}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Grade</p>
                <GradeBadge grade={allFriction[0].grade} />
              </div>
              <div>
                <p className="text-xs text-gray-400">Depth</p>
                <p className="text-xl font-bold">{allFriction[0].max_depth}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Human Paths</p>
                <p className="text-xl font-bold">{allFriction[0].human_count}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">University Comparison</h1>
      <p className="text-sm text-gray-500 mb-6">{universities.length} universities compared</p>

      {/* Score Bar Chart */}
      <div className="bg-card-bg border border-card-border rounded-xl p-6 shadow-sm mb-8">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Friction Scores</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData}>
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="score" radius={[4, 4, 0, 0]}>
              {barData.map((entry, i) => (
                <Cell key={i} fill={gradeColor(entry.grade)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Radar Overlay */}
      <div className="bg-card-bg border border-card-border rounded-xl p-6 shadow-sm mb-8">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Component Overlay</h3>
        <ResponsiveContainer width="100%" height={350}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748b' }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
            {allFriction.map((f, i) => (
              <Radar
                key={f.university}
                name={f.university}
                dataKey={f.university}
                stroke={RADAR_COLORS[i % RADAR_COLORS.length]}
                fill={RADAR_COLORS[i % RADAR_COLORS.length]}
                fillOpacity={0.1}
                strokeWidth={2}
              />
            ))}
          </RadarChart>
        </ResponsiveContainer>
        <div className="flex gap-4 justify-center mt-2">
          {allFriction.map((f, i) => (
            <div key={f.university} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: RADAR_COLORS[i % RADAR_COLORS.length] }} />
              <span className="text-xs text-gray-500">{f.university}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Component Heatmap */}
      <div className="bg-card-bg border border-card-border rounded-xl shadow-sm overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-card-border">
          <h3 className="text-sm font-semibold text-gray-700">Component Heatmap</h3>
          <p className="text-xs text-gray-400 mt-1">Green = low friction, Red = high friction</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">University</th>
                {componentNames.map(c => (
                  <th key={c} className="px-3 py-3 text-center text-xs font-semibold text-gray-500">{c.split(' ').slice(0, 2).join(' ')}</th>
                ))}
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {heatmapUnis.map(uni => (
                <tr key={uni.university}>
                  <td className="px-4 py-3 font-medium">{uni.university}</td>
                  {componentNames.map(comp => {
                    const val = uni.components[comp] || 0;
                    const bg = val <= 10 ? '#dcfce7' : val <= 40 ? '#fef9c3' : val <= 70 ? '#fed7aa' : '#fecaca';
                    const text = val <= 10 ? '#166534' : val <= 40 ? '#854d0e' : val <= 70 ? '#9a3412' : '#991b1b';
                    return (
                      <td key={comp} className="px-3 py-3 text-center">
                        <span className="px-2 py-1 rounded text-xs font-bold" style={{ backgroundColor: bg, color: text }}>
                          {val}
                        </span>
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 text-center">
                    <span className="font-bold" style={{ color: gradeColor(uni.grade) }}>{uni.total_score}</span>
                    <GradeBadge grade={uni.grade} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ranked Table */}
      <div className="bg-card-bg border border-card-border rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-card-border">
          <h3 className="text-sm font-semibold text-gray-700">Rankings</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Rank', 'University', 'Score', 'Grade', 'Depth', 'Avg Options', 'Dead Ends', 'Human Paths', 'Worst Area'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {allFriction.map((f, i) => {
                const worst = Object.entries(f.components).sort((a, b) => (b[1] as number) - (a[1] as number))[0];
                return (
                  <tr key={f.university}>
                    <td className="px-4 py-3 font-bold text-gray-400">#{i + 1}</td>
                    <td className="px-4 py-3 font-medium">{f.university}</td>
                    <td className="px-4 py-3 font-bold" style={{ color: gradeColor(f.grade) }}>{f.total_score}</td>
                    <td className="px-4 py-3"><GradeBadge grade={f.grade} size="sm" /></td>
                    <td className="px-4 py-3">{f.max_depth}</td>
                    <td className="px-4 py-3">{f.avg_options}</td>
                    <td className="px-4 py-3">{f.dead_end_count}</td>
                    <td className="px-4 py-3">{f.human_count}</td>
                    <td className="px-4 py-3 text-red-600 text-xs">{worst[0]}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
