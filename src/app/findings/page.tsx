'use client';

import { useState } from 'react';
import { useDashboard } from '@/components/DashboardShell';
import { toneToNumeric } from '@/lib/friction';
import MetricCard from '@/components/MetricCard';
import HealthLight from '@/components/HealthLight';
import ChecklistItem from '@/components/ChecklistItem';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer,
} from 'recharts';

const tabs = ['Overview', 'System Characteristics', 'Tone', 'Script Capture'] as const;
type Tab = typeof tabs[number];

export default function FindingsPage() {
  const { data, selectedUni } = useDashboard();
  const [activeTab, setActiveTab] = useState<Tab>('Overview');

  const uniOverview = data.overview.find(o => o.university === selectedUni);
  const uniSysChar = data.systemCharacteristics.find(s => s.university === selectedUni);
  const uniTone = data.tone.find(t => t.university === selectedUni);
  const uniScript = data.scriptCapture.filter(s => s.university === selectedUni);

  // Health status
  const healthStatus: 'green' | 'yellow' | 'red' = !uniOverview
    ? 'red'
    : uniOverview.Status.toLowerCase() !== 'operational'
    ? 'red'
    : uniOverview.live_operator_available
    ? 'green'
    : 'yellow';

  const healthLabel = !uniOverview
    ? 'No data'
    : healthStatus === 'green'
    ? 'Operational with live operator'
    : healthStatus === 'yellow'
    ? 'Operational but no live operator'
    : 'System issues detected';

  // Tone radar data
  const toneRadar = uniTone
    ? [
        { subject: 'Script Density', value: toneToNumeric(uniTone.script_density) },
        { subject: 'Empathy', value: toneToNumeric(uniTone.empathy_level) },
        { subject: 'Automation', value: toneToNumeric(uniTone.automation_level) },
        { subject: 'Conversational', value: uniTone.conversational ? 80 : 20 },
      ]
    : [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Detailed Findings</h1>
      <p className="text-sm text-gray-500 mb-6">{selectedUni}</p>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'Overview' && (
        <div>
          <div className="mb-6">
            <HealthLight status={healthStatus} label={healthLabel} />
          </div>
          {uniOverview ? (
            <>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <MetricCard label="Status" value={uniOverview.Status} />
                <MetricCard label="Business Hours" value={uniOverview.business_hours || 'Not specified'} />
                <MetricCard label="IVR Depth" value={`${uniOverview.ivr_depth} levels`} />
              </div>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <MetricCard
                  label="Live Operator"
                  value={uniOverview.live_operator_available ? 'Yes' : 'No'}
                  color={uniOverview.live_operator_available ? '#22c55e' : '#ef4444'}
                />
                <MetricCard
                  label="Voicemail Available"
                  value={uniOverview.voicemail_available ? 'Yes' : 'No'}
                  color={uniOverview.voicemail_available ? '#22c55e' : '#f59e0b'}
                />
                <MetricCard
                  label="Closed Hours Loop"
                  value={uniOverview.closed_hours_loop ? 'Yes' : 'No'}
                />
              </div>
              {uniOverview.notes && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-blue-700 uppercase mb-1">Notes</p>
                  <p className="text-sm text-blue-800">{uniOverview.notes}</p>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-400">No overview data available.</p>
          )}
        </div>
      )}

      {/* System Characteristics Tab */}
      {activeTab === 'System Characteristics' && (
        <div>
          {uniSysChar ? (
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-card-bg border border-card-border rounded-xl p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Feature Checklist</h3>
                <div className="space-y-1">
                  <ChecklistItem label="Asks Questions" checked={uniSysChar.asks_questions} description="IVR asks callers questions" />
                  <ChecklistItem label="Collects ID" checked={uniSysChar.collects_id} description="Collects student/caller ID" />
                  <ChecklistItem label="Collects DTMF" checked={uniSysChar.collects_dtmf} description="Accepts keypad input" />
                  <ChecklistItem label="Has Operator Zero" checked={uniSysChar.has_operator_zero} description="Press 0 to reach operator" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-card-bg border border-card-border rounded-xl p-6 shadow-sm">
                  <p className="text-xs text-gray-400 uppercase mb-2">System Type</p>
                  <p className="text-lg font-semibold text-gray-800">{uniSysChar.system_type || 'Unknown'}</p>
                </div>
                <div className="bg-card-bg border border-card-border rounded-xl p-6 shadow-sm">
                  <p className="text-xs text-gray-400 uppercase mb-2">Loop Behavior</p>
                  <p className="text-sm text-gray-700">{uniSysChar.loop_behavior || 'Not detected'}</p>
                </div>
                <div className="bg-card-bg border border-card-border rounded-xl p-6 shadow-sm">
                  <p className="text-xs text-gray-400 uppercase mb-2">Escalation Path</p>
                  <p className="text-sm text-gray-700">{uniSysChar.escalation_path || 'None identified'}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">No system characteristics data available.</p>
          )}
        </div>
      )}

      {/* Tone Tab */}
      {activeTab === 'Tone' && (
        <div>
          {uniTone ? (
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-card-bg border border-card-border rounded-xl p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Tone Profile</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={toneRadar}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: '#64748b' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Radar name="Tone" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-4">
                <div className="bg-card-bg border border-card-border rounded-xl p-6 shadow-sm">
                  <p className="text-xs text-gray-400 uppercase mb-2">Tone</p>
                  <p className="text-lg font-semibold text-gray-800">{uniTone.tone}</p>
                </div>
                <div className="bg-card-bg border border-card-border rounded-xl p-6 shadow-sm">
                  <p className="text-xs text-gray-400 uppercase mb-2">Conversational</p>
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                    uniTone.conversational ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {uniTone.conversational ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Script Density', value: uniTone.script_density },
                    { label: 'Empathy', value: uniTone.empathy_level },
                    { label: 'Automation', value: uniTone.automation_level },
                  ].map(item => (
                    <div key={item.label} className="bg-card-bg border border-card-border rounded-xl p-4 shadow-sm text-center">
                      <p className="text-xs text-gray-400 uppercase">{item.label}</p>
                      <p className="text-sm font-semibold text-gray-800 mt-1">{item.value || 'N/A'}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">No tone data available.</p>
          )}
        </div>
      )}

      {/* Script Capture Tab */}
      {activeTab === 'Script Capture' && (
        <div>
          {uniScript.length > 0 ? (
            <>
              {/* Compliance warnings */}
              {uniScript.some(s => s.compliance_warning) && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                  <p className="text-sm font-semibold text-red-700">Compliance Warnings Detected</p>
                  {uniScript.filter(s => s.compliance_warning).map((s, i) => (
                    <p key={i} className="text-sm text-red-600 mt-1">Digit {s.digit}: {s.key_instructions}</p>
                  ))}
                </div>
              )}

              {/* URLs mentioned */}
              {uniScript.some(s => s.url_mentioned) && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <p className="text-sm font-semibold text-blue-700">URLs Mentioned in IVR</p>
                  {uniScript.filter(s => s.url_mentioned).map((s, i) => (
                    <p key={i} className="text-sm text-blue-600 mt-1">{s.url_mentioned}</p>
                  ))}
                </div>
              )}

              {/* Data table */}
              <div className="bg-card-bg border border-card-border rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        {['Digit', 'Key Instructions', 'Self-Service', 'URL', 'Compliance'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {uniScript.map((item, i) => (
                        <tr key={i} className={item.compliance_warning ? 'bg-red-50' : ''}>
                          <td className="px-4 py-3 font-mono font-bold">{item.digit}</td>
                          <td className="px-4 py-3">{item.key_instructions}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                              item.self_service_level === 'high' ? 'bg-green-100 text-green-700' :
                              item.self_service_level === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>{item.self_service_level}</span>
                          </td>
                          <td className="px-4 py-3 text-blue-600">{item.url_mentioned || '—'}</td>
                          <td className="px-4 py-3">{item.compliance_warning ? '⚠️' : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-400">No script capture data available.</p>
          )}
        </div>
      )}
    </div>
  );
}
