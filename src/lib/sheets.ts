import type { SheetData, Overview, MenuItem, ScriptCapture, SystemCharacteristics, Tone, FrictionScore } from './types';

function parseBool(val: unknown): boolean {
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string') return val.toLowerCase() === 'true';
  return false;
}

function parseNum(val: unknown, fallback = 0): number {
  const n = Number(val);
  return isNaN(n) ? fallback : n;
}

function parseOverview(raw: Record<string, unknown>[]): Overview[] {
  return raw.map(r => ({
    callId: String(r.callId || ''),
    parent_call_id: String(r.parent_call_id || ''),
    university: String(r.university || ''),
    Status: String(r.Status || r.status || ''),
    business_hours: String(r.business_hours || ''),
    live_operator_available: parseBool(r.live_operator_available),
    voicemail_available: parseBool(r.voicemail_available),
    ivr_depth: parseNum(r.ivr_depth),
    closed_hours_loop: parseBool(r.closed_hours_loop),
    notes: String(r.notes || ''),
  }));
}

function parseMenu(raw: Record<string, unknown>[]): MenuItem[] {
  return raw.map(r => ({
    callId: String(r.callId || ''),
    parent_call_id: String(r.parent_call_id || ''),
    university: String(r.university || ''),
    digit: String(r.digit || ''),
    menu_level: parseNum(r.menu_level, 1),
    option_label: String(r.option_label || ''),
    type: String(r.type || ''),
    leads_to: String(r.leads_to || ''),
    human: parseBool(r.human),
    notes: String(r.notes || ''),
  }));
}

function parseScriptCapture(raw: Record<string, unknown>[]): ScriptCapture[] {
  return raw.map(r => ({
    callId: String(r.callId || ''),
    parent_call_id: String(r.parent_call_id || ''),
    university: String(r.university || ''),
    digit: String(r.digit || r.option_digit || ''),
    key_instructions: String(r.key_instructions || ''),
    url_mentioned: String(r.url_mentioned || ''),
    compliance_warning: parseBool(r.compliance_warning),
    self_service_level: String(r.self_service_level || ''),
  }));
}

function parseSysChar(raw: Record<string, unknown>[]): SystemCharacteristics[] {
  return raw.map(r => ({
    callId: String(r.callId || ''),
    parent_call_id: String(r.parent_call_id || ''),
    university: String(r.university || ''),
    asks_questions: parseBool(r.asks_questions),
    collects_id: parseBool(r.collects_id),
    collects_dtmf: parseBool(r.collects_dtmf),
    has_operator_zero: parseBool(r.has_operator_zero),
    loop_behavior: String(r.loop_behavior || ''),
    escalation_path: String(r.escalation_path || ''),
    system_type: String(r.system_type || ''),
  }));
}

function parseTone(raw: Record<string, unknown>[]): Tone[] {
  return raw.map(r => ({
    callId: String(r.callId || ''),
    parent_call_id: String(r.parent_call_id || ''),
    university: String(r.university || ''),
    tone: String(r.tone || ''),
    conversational: parseBool(r.conversational),
    script_density: String(r.script_density || ''),
    empathy_level: String(r.empathy_level || ''),
    automation_level: String(r.automation_level || ''),
  }));
}

function parseFriction(raw: Record<string, unknown>[]): FrictionScore[] {
  return raw.map(r => ({
    parent_call_id: String(r.parent_call_id || ''),
    university: String(r.university || ''),
    total_score: parseNum(r.total_score),
    grade: String(r.grade || ''),
    depth_score: parseNum(r.depth_score),
    options_score: parseNum(r.options_score),
    time_score: parseNum(r.time_score),
    dead_end_score: parseNum(r.dead_end_score),
    agent_access_score: parseNum(r.agent_access_score),
    clarity_score: parseNum(r.clarity_score),
    operator_score: parseNum(r.operator_score),
    max_depth: parseNum(r.max_depth),
    avg_options: parseNum(r.avg_options),
    total_nodes: parseNum(r.total_nodes),
    dead_end_count: parseNum(r.dead_end_count),
    voicemail_count: parseNum(r.voicemail_count),
    human_reachable_count: parseNum(r.human_reachable_count),
    worst_component: String(r.worst_component || ''),
    recommendations: String(r.recommendations || ''),
    executive_summary: String(r.executive_summary || ''),
    scored_at: String(r.scored_at || ''),
  }));
}

export async function fetchAllSheets(): Promise<SheetData> {
  // Try local API route first (dev), fall back to static data.json (GitHub Pages)
  let sheets: Record<string, Record<string, unknown>[]>;
  try {
    const res = await fetch('/api/sheets', { cache: 'no-store' });
    if (res.ok) {
      sheets = await res.json();
    } else {
      throw new Error('API route unavailable');
    }
  } catch {
    // Static mode: read pre-built data.json (GitHub Pages / static export)
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
    const res = await fetch(`${basePath}/data.json`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load data. Ensure data.json exists in public/.');
    sheets = await res.json();
  }

  const overview = parseOverview(sheets['Overview'] || []);
  const menuMapping = parseMenu(sheets['Menu Mapping'] || []);
  const scriptCapture = parseScriptCapture(sheets['Script Capture'] || []);
  const systemCharacteristics = parseSysChar(sheets['System Characteristics'] || []);
  const tone = parseTone(sheets['Tone'] || []);
  const frictionScore = parseFriction(sheets['Friction Score'] || []);

  const universities = [...new Set(menuMapping.map(m => m.university).filter(Boolean))].sort();

  return { overview, menuMapping, scriptCapture, systemCharacteristics, tone, frictionScore, universities };
}
