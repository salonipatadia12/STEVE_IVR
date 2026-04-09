'use client';

import { useDashboard } from '@/components/DashboardShell';
import { calculateFriction, COMPONENT_WEIGHTS } from '@/lib/friction';
import MetricCard from '@/components/MetricCard';
import GradeBadge from '@/components/GradeBadge';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  RadialBarChart, RadialBar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
} from 'recharts';

export default function OverviewPage() {
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
        max_depth: frictionRow.max_depth,
        avg_options: frictionRow.avg_options,
        total_nodes: frictionRow.total_nodes,
        dead_end_count: frictionRow.dead_end_count,
        human_count: frictionRow.human_reachable_count,
        recommendations: frictionRow.recommendations ? frictionRow.recommendations.split(' | ') : [],
        executive_summary: frictionRow.executive_summary,
      }
    : calculateFriction(selectedUni, data.menuMapping, data.overview, data.systemCharacteristics);

  const score = fd.total_score;
  const grade = fd.grade;

  // Gauge data
  const gaugeData = [{ name: 'Score', value: score, fill: getGaugeColor(score) }];

  // Radar data
  const radarData = Object.entries(fd.components).map(([key, value]) => ({
    subject: key.replace('Operator Availability', 'Operator').replace('Agent Accessibility', 'Agent Access'),
    value: value as number,
    fullMark: 100,
  }));

  // Component bar data
  const barData = Object.entries(fd.components).map(([key, value]) => ({
    name: key,
    score: value as number,
    weight: COMPONENT_WEIGHTS[key],
  }));

  // Top 3 worst components
  const worst3 = [...barData].sort((a, b) => b.score - a.score).slice(0, 3);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{selectedUni}</h1>
          <p className="text-sm text-gray-500 mt-1">IVR Friction Report</p>
        </div>
        <GradeBadge grade={grade} size="lg" />
      </div>

      {/* Score + Metrics Row */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        {/* Gauge */}
        <div className="col-span-2 bg-card-bg border border-card-border rounded-xl p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-2">Friction Score</p>
          <ResponsiveContainer width="100%" height={200}>
            <RadialBarChart
              cx="50%" cy="50%"
              innerRadius="60%" outerRadius="90%"
              startAngle={180} endAngle={0}
              barSize={20}
              data={gaugeData}
            >
              <RadialBar dataKey="value" cornerRadius={10} background={{ fill: '#f1f5f9' }} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="text-center -mt-16">
            <span className="text-4xl font-bold" style={{ color: getGaugeColor(score) }}>{score}</span>
            <span className="text-gray-400 text-sm">/100</span>
          </div>
          <p className="text-center text-xs text-gray-400 mt-6">0 = No friction, 100 = Maximum friction</p>
        </div>

        {/* Metric cards */}
        <MetricCard label="IVR Depth" value={`${fd.max_depth} levels`} subtitle="Menu depth" />
        <MetricCard label="Human Paths" value={fd.human_count} subtitle="Paths reaching a person" color={fd.human_count > 0 ? '#22c55e' : '#ef4444'} />
        <MetricCard label="Dead Ends" value={fd.dead_end_count} subtitle="Paths leading nowhere" color={fd.dead_end_count > 0 ? '#ef4444' : '#22c55e'} />
      </div>

      {/* Radar + Component Breakdown */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Radar */}
        <div className="bg-card-bg border border-card-border rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Friction Profile</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748b' }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Radar name="Score" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Bar chart */}
        <div className="bg-card-bg border border-card-border rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Component Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData} layout="vertical" margin={{ left: 120 }}>
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={110} />
              <Tooltip
                formatter={(value) => [`${value}`, 'Score']}
              />
              <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                {barData.map((entry, i) => (
                  <Cell key={i} fill={entry.score <= 10 ? '#22c55e' : entry.score <= 40 ? '#f59e0b' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top 3 Problem Areas */}
      {worst3.some(w => w.score > 0) && (
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Top Problem Areas</h3>
          <div className="grid grid-cols-3 gap-4">
            {worst3.map((item, i) => (
              <div
                key={item.name}
                className={`rounded-xl p-4 border ${
                  item.score > 40 ? 'bg-red-50 border-red-200' : item.score > 10 ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-gray-400">#{i + 1}</span>
                  <span className="text-sm font-semibold text-gray-800">{item.name}</span>
                </div>
                <p className="text-2xl font-bold" style={{ color: item.score > 40 ? '#ef4444' : item.score > 10 ? '#f59e0b' : '#22c55e' }}>
                  {item.score}
                </p>
                <p className="text-xs text-gray-500 mt-1">Weight: {item.weight}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Executive Summary */}
      <div className="bg-card-bg border border-card-border rounded-xl p-6 shadow-sm mb-8">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Executive Summary</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{fd.executive_summary}</p>
      </div>

      {/* Recommendations Preview */}
      <div className="bg-card-bg border border-card-border rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Key Recommendations</h3>
        <ul className="space-y-2">
          {fd.recommendations.slice(0, 3).map((rec, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
              <span className="text-blue-500 mt-0.5">→</span>
              {rec}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function getGaugeColor(score: number): string {
  if (score <= 25) return '#22c55e';
  if (score <= 50) return '#3b82f6';
  if (score <= 75) return '#f59e0b';
  return '#ef4444';
}
