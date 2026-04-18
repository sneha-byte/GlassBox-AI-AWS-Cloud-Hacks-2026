// Shared frontend shapes mirror the backend API responses so components can
// stay strongly typed without repeating field names ad hoc.
export type AgentRunSummary = {
  agent_id: string;
  agent_name: string;
  agent_type: string;
  execution_id: string;
  timestamp: number;
  query: string;
  response_text: string;
  latency: number;
  score: number;
  anomalies: string[];
  status: string;
  tool_used: boolean;
  cost_estimate_usd: number;
  fallback_mode: string;
  trace_s3_key?: string | null;
};

export type TraceStep = {
  type: string;
  timestamp: string;
  // Trace steps are intentionally flexible because different step kinds
  // carry different metadata, such as `tool`, `expression`, or `output`.
  [key: string]: unknown;
};

export type AgentTrace = {
  execution_id: string;
  agent_id: string;
  agent_type: string;
  query: string;
  created_at: string;
  steps: TraceStep[];
  summary: {
    latency: number;
    score: number;
    status: string;
    anomalies: string[];
  };
};

export type ExecutionResponse = {
  execution_id: string;
  status: string;
  agent_count: number;
  query: string;
  step_function_execution_arn?: string | null;
  demo?: boolean;
};
