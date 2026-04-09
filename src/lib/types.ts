export interface Overview {
  callId: string;
  parent_call_id: string;
  university: string;
  Status: string;
  business_hours: string;
  live_operator_available: boolean;
  voicemail_available: boolean;
  ivr_depth: number;
  closed_hours_loop: boolean;
  notes: string;
}

export interface MenuItem {
  callId: string;
  parent_call_id: string;
  university: string;
  digit: string;
  menu_level: number;
  option_label: string;
  type: string;
  leads_to: string;
  human: boolean;
  notes: string;
}

export interface ScriptCapture {
  callId: string;
  parent_call_id: string;
  university: string;
  digit: string;
  key_instructions: string;
  url_mentioned: string;
  compliance_warning: boolean;
  self_service_level: string;
}

export interface SystemCharacteristics {
  callId: string;
  parent_call_id: string;
  university: string;
  asks_questions: boolean;
  collects_id: boolean;
  collects_dtmf: boolean;
  has_operator_zero: boolean;
  loop_behavior: string;
  escalation_path: string;
  system_type: string;
}

export interface Tone {
  callId: string;
  parent_call_id: string;
  university: string;
  tone: string;
  conversational: boolean;
  script_density: string;
  empathy_level: string;
  automation_level: string;
}

export interface FrictionScore {
  parent_call_id: string;
  university: string;
  total_score: number;
  grade: string;
  depth_score: number;
  options_score: number;
  time_score: number;
  dead_end_score: number;
  agent_access_score: number;
  clarity_score: number;
  operator_score: number;
  max_depth: number;
  avg_options: number;
  total_nodes: number;
  dead_end_count: number;
  voicemail_count: number;
  human_reachable_count: number;
  worst_component: string;
  recommendations: string;
  executive_summary: string;
  scored_at: string;
}

export interface SheetData {
  overview: Overview[];
  menuMapping: MenuItem[];
  scriptCapture: ScriptCapture[];
  systemCharacteristics: SystemCharacteristics[];
  tone: Tone[];
  frictionScore: FrictionScore[];
  universities: string[];
}

export interface FrictionResult {
  total_score: number;
  grade: string;
  components: Record<string, number>;
  max_depth: number;
  avg_options: number;
  total_nodes: number;
  dead_end_count: number;
  voicemail_count: number;
  human_count: number;
  recommendations: string[];
  executive_summary: string;
}

export interface TreeNode {
  name: string;
  digit: string;
  type: string;
  human: boolean;
  leads_to: string;
  notes: string;
  children: TreeNode[];
  value: number;
}
