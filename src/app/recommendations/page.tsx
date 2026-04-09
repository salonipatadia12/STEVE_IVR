'use client';

import { useDashboard } from '@/components/DashboardShell';
import { calculateFriction, EFFORT_MAP, gradeColor } from '@/lib/friction';
import GradeBadge from '@/components/GradeBadge';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine, Label } from 'recharts';

export default function RecommendationsPage() {
  const { data, selectedUni } = useDashboard();

  const frictionRow = data.frictionScore.find(f => f.university === selectedUni);
  const fd = frictionRow && frictionRow.total_score
    ? {
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
        recommendations: frictionRow.recommendations ? frictionRow.recommendations.split(' | ') : [],
        executive_summary: frictionRow.executive_summary,
      }
    : (() => {
        const calc = calculateFriction(selectedUni, data.menuMapping, data.overview, data.systemCharacteristics);
        return {
          total_score: calc.total_score,
          grade: calc.grade,
          components: calc.components,
          recommendations: calc.recommendations,
          executive_summary: calc.executive_summary,
        };
      })();

  // Priority matrix data
  const matrixData = Object.entries(fd.components).map(([name, impact]) => ({
    name,
    effort: EFFORT_MAP[name] || 50,
    impact: impact as number,
    quadrant: (impact as number) > 40 && (EFFORT_MAP[name] || 50) <= 50
      ? 'Quick Win'
      : (impact as number) > 40
      ? 'Strategic'
      : (EFFORT_MAP[name] || 50) <= 50
      ? 'Easy Fix'
      : 'Low Priority',
  }));

  const quickWins = matrixData.filter(d => d.quadrant === 'Quick Win');
  const strategic = matrixData.filter(d => d.quadrant === 'Strategic');

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recommendations</h1>
          <p className="text-sm text-gray-500 mt-1">{selectedUni} — Prioritized improvements</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold" style={{ color: gradeColor(fd.grade) }}>{fd.total_score}</span>
          <GradeBadge grade={fd.grade} size="lg" />
        </div>
      </div>

      {/* Priority Matrix */}
      <div className="bg-card-bg border border-card-border rounded-xl p-6 shadow-sm mb-8">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Priority Matrix — Impact vs Effort</h3>
        <ResponsiveContainer width="100%" height={350}>
          <ScatterChart margin={{ top: 20, right: 40, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis type="number" dataKey="effort" domain={[0, 100]} tick={{ fontSize: 11 }}
              label={{ value: 'Effort to Fix →', position: 'bottom', fontSize: 12, fill: '#94a3b8' }} />
            <YAxis type="number" dataKey="impact" domain={[0, 100]} tick={{ fontSize: 11 }}
              label={{ value: '← Friction Impact', angle: -90, position: 'left', fontSize: 12, fill: '#94a3b8' }} />
            <ReferenceLine x={50} stroke="#e2e8f0" strokeDasharray="3 3">
              <Label value="Easy | Hard" position="top" fontSize={10} fill="#94a3b8" />
            </ReferenceLine>
            <ReferenceLine y={40} stroke="#e2e8f0" strokeDasharray="3 3">
              <Label value="Low Impact | High Impact" position="right" fontSize={10} fill="#94a3b8" />
            </ReferenceLine>
            <Tooltip
              formatter={(value) => [String(value), '']}
              labelFormatter={(_label, payload) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const item = (payload as any)?.[0]?.payload;
                return item ? `${item.name} (${item.quadrant})` : '';
              }}
            />
            <Scatter data={matrixData} name="Components">
              {matrixData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={
                    entry.quadrant === 'Quick Win' ? '#22c55e' :
                    entry.quadrant === 'Strategic' ? '#f59e0b' :
                    entry.quadrant === 'Easy Fix' ? '#3b82f6' :
                    '#94a3b8'
                  }
                  r={8}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
        <div className="flex gap-6 justify-center mt-2">
          {[
            { label: 'Quick Win', color: '#22c55e' },
            { label: 'Strategic', color: '#f59e0b' },
            { label: 'Easy Fix', color: '#3b82f6' },
            { label: 'Low Priority', color: '#94a3b8' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: l.color }} />
              <span className="text-xs text-gray-500">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Wins */}
      {quickWins.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-green-700 mb-3">Quick Wins — High Impact, Low Effort</h3>
          <div className="grid grid-cols-2 gap-4">
            {quickWins.map(item => (
              <div key={item.name} className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-green-800">{item.name}</p>
                <p className="text-xs text-green-600 mt-1">Impact: {item.impact}/100 | Effort: Easy</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strategic */}
      {strategic.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-amber-700 mb-3">Strategic — High Impact, Higher Effort</h3>
          <div className="grid grid-cols-2 gap-4">
            {strategic.map(item => (
              <div key={item.name} className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-amber-800">{item.name}</p>
                <p className="text-xs text-amber-600 mt-1">Impact: {item.impact}/100 | Effort: Significant</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Recommendations */}
      <div className="bg-card-bg border border-card-border rounded-xl p-6 shadow-sm mb-8">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">All Recommendations</h3>
        <ul className="space-y-3">
          {fd.recommendations.map((rec, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-sm text-gray-700">{rec}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Executive Summary */}
      {fd.executive_summary && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Executive Summary</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{fd.executive_summary}</p>
        </div>
      )}
    </div>
  );
}
