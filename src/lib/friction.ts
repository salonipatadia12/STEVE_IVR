import type { MenuItem, SystemCharacteristics, Overview, FrictionResult, TreeNode } from './types';

export function calculateFriction(
  university: string,
  menu: MenuItem[],
  overview: Overview[],
  sysChar: SystemCharacteristics[]
): FrictionResult {
  const uniMenu = menu.filter(m => m.university === university);

  // Depth
  const maxDepth = uniMenu.length > 0 ? Math.max(...uniMenu.map(m => m.menu_level)) : 1;
  const depthScore = Math.min(100, Math.max(0, (maxDepth - 3) * 25));

  // Options complexity — count options per menu level
  const levelCounts: Record<number, number> = {};
  for (const item of uniMenu) {
    levelCounts[item.menu_level] = (levelCounts[item.menu_level] || 0) + 1;
  }
  const counts = Object.values(levelCounts);
  const avgOptions = counts.length > 0 ? counts.reduce((a, b) => a + b, 0) / counts.length : 0;
  const optionsScore = Math.min(100, Math.max(0, (avgOptions - 5) * 20));

  // Time estimate
  const estTime = maxDepth * 20 + avgOptions * 3;
  let timeScore = 0;
  if (estTime > 120) timeScore = 100;
  else if (estTime > 60) timeScore = (estTime - 60) * 1.67;
  timeScore = Math.min(100, timeScore);

  // Dead ends
  const totalNodes = Math.max(uniMenu.length, 1);
  const deadEnds = uniMenu.filter(m =>
    ['dead_end', 'closed'].includes(m.type.toLowerCase())
  ).length;
  const voicemails = uniMenu.filter(m => m.type.toLowerCase() === 'voicemail').length;
  const humanCount = uniMenu.filter(m => m.human || m.type.toLowerCase() === 'human' || m.type.toLowerCase() === 'transfer').length;
  const deadEndScore = Math.min(100, ((deadEnds + voicemails * 0.5) / totalNodes) * 100);

  // Agent accessibility
  const agentCoverage = totalNodes > 0 ? (humanCount / totalNodes) * 100 : 0;
  let agentScore = 100 - agentCoverage;
  const uniSysChar = sysChar.find(s => s.university === university);
  const hasOpZero = uniSysChar?.has_operator_zero ?? false;
  if (hasOpZero) agentScore = Math.max(0, agentScore - 20);

  // Clarity
  let clarityScore = 0;
  if (avgOptions > 5) clarityScore += (avgOptions - 5) * 10;
  if (maxDepth > 3) clarityScore += (maxDepth - 3) * 10;
  clarityScore = Math.min(100, Math.max(0, clarityScore));

  // Operator availability
  let operatorScore = 100;
  if (hasOpZero) operatorScore = 0;
  else if (humanCount > 0) operatorScore = 50;

  // Composite
  const totalScore = Math.round(
    (depthScore * 0.15 +
      optionsScore * 0.15 +
      timeScore * 0.20 +
      deadEndScore * 0.15 +
      agentScore * 0.10 +
      clarityScore * 0.15 +
      operatorScore * 0.10) * 100
  ) / 100;

  let grade = 'Poor';
  if (totalScore <= 25) grade = 'Excellent';
  else if (totalScore <= 50) grade = 'Good';
  else if (totalScore <= 75) grade = 'Fair';

  const components: Record<string, number> = {
    'Menu Depth': Math.round(depthScore * 10) / 10,
    'Options Complexity': Math.round(optionsScore * 10) / 10,
    'Time to Resolution': Math.round(timeScore * 10) / 10,
    'Dead Ends': Math.round(deadEndScore * 10) / 10,
    'Agent Accessibility': Math.round(agentScore * 10) / 10,
    'Prompt Clarity': Math.round(clarityScore * 10) / 10,
    'Operator Availability': Math.round(operatorScore * 10) / 10,
  };

  // Auto-generate recommendations
  const recommendations: string[] = [];
  if (components['Menu Depth'] > 25) {
    recommendations.push(`Reduce menu depth from ${maxDepth} levels to 3 or fewer`);
  }
  if (components['Options Complexity'] > 0) {
    recommendations.push(`Simplify menus — average ${avgOptions.toFixed(1)} options per level exceeds the recommended 5`);
  }
  if (components['Dead Ends'] > 10) {
    recommendations.push(`Fix ${deadEnds} dead-end paths that leave callers stuck`);
  }
  if (components['Agent Accessibility'] > 30) {
    recommendations.push("Add 'Press 0 for agent' option to more menu levels");
  }
  if (components['Operator Availability'] > 0) {
    recommendations.push('Enable operator (press 0) access from the main menu');
  }
  if (components['Time to Resolution'] > 30) {
    recommendations.push('Reduce estimated call navigation time by flattening the menu structure');
  }
  if (components['Prompt Clarity'] > 10) {
    recommendations.push('Improve prompt clarity by reducing options per level and simplifying language');
  }
  if (recommendations.length === 0) {
    recommendations.push('IVR system is well-structured. Continue monitoring for changes.');
  }

  const worstComponent = Object.entries(components).sort((a, b) => b[1] - a[1])[0];
  const executiveSummary = `${university} IVR scored ${totalScore}/100 (${grade}). ` +
    `The system has ${maxDepth} menu level(s) with an average of ${avgOptions.toFixed(1)} options per level. ` +
    `${humanCount} path(s) reach a human agent. ` +
    `Biggest concern: ${worstComponent[0]} (${worstComponent[1]}/100).`;

  return {
    total_score: totalScore,
    grade,
    components,
    max_depth: maxDepth,
    avg_options: Math.round(avgOptions * 10) / 10,
    total_nodes: totalNodes,
    dead_end_count: deadEnds,
    voicemail_count: voicemails,
    human_count: humanCount,
    recommendations,
    executive_summary: executiveSummary,
  };
}

export function buildMenuTree(menu: MenuItem[], university: string): TreeNode {
  const uniMenu = menu.filter(m => m.university === university);

  const root: TreeNode = {
    name: university,
    digit: '',
    type: 'root',
    human: false,
    leads_to: '',
    notes: '',
    children: [],
    value: 1,
  };

  // Group by menu level
  const level1 = uniMenu.filter(m => m.menu_level === 1);
  const level2 = uniMenu.filter(m => m.menu_level === 2);

  for (const item of level1) {
    const node: TreeNode = {
      name: item.option_label,
      digit: item.digit,
      type: item.type,
      human: item.human,
      leads_to: item.leads_to,
      notes: item.notes,
      children: [],
      value: 1,
    };

    // If this is a submenu, attach level 2 children
    if (item.type.toLowerCase() === 'submenu' || item.type.toLowerCase() === 'navigation') {
      const children = level2.filter(() => {
        // For now, attach all level 2 items to submenu nodes
        // In a multi-submenu IVR, we'd match by leads_to
        return true;
      });

      // Only attach to the first submenu to avoid duplicates
      if (item === level1.find(l => l.type.toLowerCase() === 'submenu' || l.type.toLowerCase() === 'navigation')) {
        node.children = children.map(child => ({
          name: child.option_label,
          digit: child.digit,
          type: child.type,
          human: child.human,
          leads_to: child.leads_to,
          notes: child.notes,
          children: [],
          value: 1,
        }));
        node.value = node.children.length || 1;
      }
    }

    root.children.push(node);
  }

  root.value = root.children.reduce((s, c) => s + c.value, 0);
  return root;
}

export function getTypeColor(type: string): string {
  switch (type.toLowerCase()) {
    case 'human':
    case 'transfer':
      return '#22c55e'; // green
    case 'submenu':
    case 'navigation':
      return '#3b82f6'; // blue
    case 'information':
    case 'info':
      return '#f59e0b'; // amber
    case 'dead_end':
    case 'closed':
      return '#ef4444'; // red
    case 'voicemail':
      return '#a855f7'; // purple
    case 'function':
      return '#6b7280'; // gray
    default:
      return '#94a3b8'; // slate
  }
}

export function gradeColor(grade: string): string {
  switch (grade) {
    case 'Excellent': return '#22c55e';
    case 'Good': return '#3b82f6';
    case 'Fair': return '#f59e0b';
    case 'Poor': return '#ef4444';
    default: return '#94a3b8';
  }
}

export function toneToNumeric(level: string): number {
  switch (level.toLowerCase()) {
    case 'very low': return 20;
    case 'low': return 40;
    case 'moderate': return 60;
    case 'high': return 80;
    case 'very high': return 100;
    default: return 50;
  }
}

export const COMPONENT_WEIGHTS: Record<string, string> = {
  'Menu Depth': '15%',
  'Options Complexity': '15%',
  'Time to Resolution': '20%',
  'Dead Ends': '15%',
  'Agent Accessibility': '10%',
  'Prompt Clarity': '15%',
  'Operator Availability': '10%',
};

export const EFFORT_MAP: Record<string, number> = {
  'Operator Availability': 20,
  'Agent Accessibility': 20,
  'Dead Ends': 50,
  'Prompt Clarity': 50,
  'Options Complexity': 80,
  'Menu Depth': 80,
  'Time to Resolution': 80,
};
