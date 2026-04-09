'use client';

import { useState } from 'react';
import { useDashboard } from '@/components/DashboardShell';
import { buildMenuTree, getTypeColor } from '@/lib/friction';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import type { TreeNode } from '@/lib/types';

function flattenForTreemap(node: TreeNode, depth = 0): Array<{ name: string; size: number; type: string; digit: string; color: string; depth: number }> {
  if (node.children.length === 0) {
    return [{ name: `[${node.digit}] ${node.name}`, size: 1, type: node.type, digit: node.digit, color: getTypeColor(node.type), depth }];
  }
  return node.children.flatMap(child => flattenForTreemap(child, depth + 1));
}

interface TreemapContentProps {
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
  color: string;
}

const TreemapContent = ({ x, y, width, height, name, color }: TreemapContentProps) => {
  if (width < 40 || height < 30) return null;
  const displayName = name.length > (width / 7) ? name.slice(0, Math.floor(width / 7)) + '...' : name;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={color} stroke="#fff" strokeWidth={2} rx={4} opacity={0.85} />
      <text x={x + width / 2} y={y + height / 2} textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize={11} fontWeight={600}>
        {displayName}
      </text>
    </g>
  );
};

export default function TreePage() {
  const { data, selectedUni } = useDashboard();
  const [selectedDigit, setSelectedDigit] = useState<string | null>(null);

  const tree = buildMenuTree(data.menuMapping, selectedUni);
  const uniMenu = data.menuMapping.filter(m => m.university === selectedUni);
  const treemapData = flattenForTreemap(tree);

  const selectedItem = selectedDigit ? uniMenu.find(m => String(m.digit) === selectedDigit) : null;
  const selectedScript = selectedDigit ? data.scriptCapture.find(
    s => s.university === selectedUni && String(s.digit) === selectedDigit
  ) : null;

  // Color legend
  const typeColors = [
    { type: 'Human/Transfer', color: '#22c55e' },
    { type: 'Submenu/Navigation', color: '#3b82f6' },
    { type: 'Information', color: '#f59e0b' },
    { type: 'Dead End', color: '#ef4444' },
    { type: 'Voicemail', color: '#a855f7' },
    { type: 'Function', color: '#6b7280' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">IVR Menu Tree</h1>
      <p className="text-sm text-gray-500 mb-6">{selectedUni} — {uniMenu.length} menu options mapped</p>

      {/* Color Legend */}
      <div className="flex flex-wrap gap-4 mb-6">
        {typeColors.map(tc => (
          <div key={tc.type} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: tc.color }} />
            <span className="text-xs text-gray-600">{tc.type}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Treemap */}
        <div className="col-span-2 bg-card-bg border border-card-border rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Menu Structure</h3>
          {treemapData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <Treemap
                data={treemapData}
                dataKey="size"
                aspectRatio={4 / 3}
                stroke="#fff"
                content={<TreemapContent x={0} y={0} width={0} height={0} name="" color="" />}
              >
                <Tooltip />
              </Treemap>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm">No menu data available.</p>
          )}
        </div>

        {/* Detail Panel */}
        <div className="bg-card-bg border border-card-border rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Option Detail</h3>
          <select
            value={selectedDigit || ''}
            onChange={(e) => setSelectedDigit(e.target.value || null)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a digit...</option>
            {uniMenu.map((item, i) => (
              <option key={i} value={String(item.digit)}>
                [{item.digit}] {item.option_label}
              </option>
            ))}
          </select>

          {selectedItem ? (
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400 uppercase">Option</p>
                <p className="text-sm font-medium">{selectedItem.option_label}</p>
              </div>
              <div className="flex gap-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase">Digit</p>
                  <p className="text-sm font-mono font-bold">{selectedItem.digit}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase">Level</p>
                  <p className="text-sm">{selectedItem.menu_level}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase">Type</p>
                <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded-full text-white mt-1"
                  style={{ backgroundColor: getTypeColor(selectedItem.type) }}>
                  {selectedItem.type}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase">Leads To</p>
                <p className="text-sm">{selectedItem.leads_to || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase">Human Reachable</p>
                <p className="text-sm">{selectedItem.human ? '✓ Yes' : '✕ No'}</p>
              </div>
              {selectedItem.notes && (
                <div>
                  <p className="text-xs text-gray-400 uppercase">Notes</p>
                  <p className="text-sm text-gray-600">{selectedItem.notes}</p>
                </div>
              )}

              {/* Script Capture detail */}
              {selectedScript && (
                <div className="border-t border-gray-100 pt-3 mt-3">
                  <p className="text-xs text-gray-400 uppercase mb-2">Script Capture</p>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-400">Key Instructions</p>
                      <p className="text-sm">{selectedScript.key_instructions || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Self-Service Level</p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        selectedScript.self_service_level === 'high' ? 'bg-green-100 text-green-700' :
                        selectedScript.self_service_level === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>{selectedScript.self_service_level}</span>
                    </div>
                    {selectedScript.url_mentioned && (
                      <div>
                        <p className="text-xs text-gray-400">URL Mentioned</p>
                        <p className="text-sm text-blue-600">{selectedScript.url_mentioned}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Select a menu option to view details.</p>
          )}
        </div>
      </div>

      {/* Raw Data Table */}
      <div className="mt-8 bg-card-bg border border-card-border rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-card-border">
          <h3 className="text-sm font-semibold text-gray-700">Raw Menu Data</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Digit', 'Level', 'Option', 'Type', 'Leads To', 'Human'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {uniMenu.map((item, i) => (
                <tr key={i} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedDigit(String(item.digit))}>
                  <td className="px-4 py-3 font-mono font-bold">{item.digit}</td>
                  <td className="px-4 py-3">{item.menu_level}</td>
                  <td className="px-4 py-3">{item.option_label}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full text-white"
                      style={{ backgroundColor: getTypeColor(item.type) }}>
                      {item.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{item.leads_to}</td>
                  <td className="px-4 py-3">{item.human ? '✓' : '✕'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
