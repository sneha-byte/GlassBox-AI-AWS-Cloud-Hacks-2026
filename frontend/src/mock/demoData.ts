import type { AgentRunSummary, AgentTrace, ExecutionResponse } from "../types";

// These constants create a stable demo story that works even before the
// real backend is deployed. The frontend can always render against them.
const executionId = "demo-trip-nyc-2026-04-17";
const timestamp = 1776463200;
const query = "Plan a trip to NYC";

// Each family maps to one agent archetype in the project spec.
const families = [
  { type: "reasoning", names: ["Atlas", "Beacon", "Compass", "Summit"], baseScore: 92, baseLatency: 2.7 },
  { type: "fast", names: ["Flash", "Relay", "Dash", "Spark"], baseScore: 88, baseLatency: 1.2 },
  { type: "tool", names: ["Calculus", "Ledger", "Metrics", "Operator"], baseScore: 90, baseLatency: 1.8 },
  { type: "rag", names: ["Archive", "Compass", "Lens", "Vault"], baseScore: 86, baseLatency: 3.1 },
  { type: "bad", names: ["Chaos", "Mirage", "Static", "Drift"], baseScore: 58, baseLatency: 2.2 },
] as const;

const makeResponse = (type: string, index: number) => {
  // The bad agent intentionally produces a brittle answer so the demo can
  // show ranking penalties and trace-based debugging.
  if (type === "bad" && index === 3) {
    return "Hotel prices are definitely lowest in Times Square during marathon weekend. Book anything; details can be sorted later.";
  }
  if (type === "tool") {
    return "Three-day NYC outline with a budget table, neighborhood split, and daily subway-friendly routing.";
  }
  if (type === "reasoning") {
    return "Balanced NYC itinerary with tradeoffs across budget, pace, weather backups, and transit time.";
  }
  if (type === "rag") {
    return "Grounded NYC itinerary that references likely venue clusters, airport transfer assumptions, and evidence gaps.";
  }
  return "Fast itinerary with the top neighborhoods, quick food picks, and a simple day-by-day plan.";
};

const demoRuns: AgentRunSummary[] = families.flatMap((family) =>
  family.names.map((name, index) => {
    // Scores are pre-shaped so the leaderboard looks believable and varied.
    const rankBias = family.type === "bad" ? -index * 4 : index * 1.5;
    const latency = Number((family.baseLatency + index * 0.18).toFixed(2));
    const score = Number(
      (
        family.baseScore -
        index * (family.type === "bad" ? 8 : 2.1) -
        latency * 1.6 +
        rankBias
      ).toFixed(2),
    );
    const failed = family.type === "bad" && index === 3;

    return {
      agent_id: `${family.type}-${String(index + 1).padStart(2, "0")}`,
      agent_name: `${family.type[0].toUpperCase()}${family.type.slice(1)} ${name}`,
      agent_type: family.type,
      execution_id: executionId,
      timestamp,
      query,
      response_text: failed ? "" : makeResponse(family.type, index),
      latency,
      score: failed ? 22.4 : score,
      anomalies: failed
        ? ["execution_error", "low_reliability_profile"]
        : family.type === "bad"
          ? ["low_reliability_profile"]
          : family.type === "rag" && index >= 2
            ? ["high_latency"]
            : [],
      status: failed ? "failed" : "completed",
      tool_used: family.type === "tool",
      cost_estimate_usd: Number((0.0004 + index * 0.00007 + latency * 0.0001).toFixed(6)),
      fallback_mode: "demo",
      trace_s3_key: `traces/${executionId}/${family.type}-${String(index + 1).padStart(2, "0")}/${timestamp}.json`,
    };
  }),
);

// Sorting once here means all UI consumers see the same leaderboard order.
demoRuns.sort((left, right) => right.score - left.score || left.latency - right.latency);

const demoTraces = Object.fromEntries(
  demoRuns.map((run, index) => {
    // Trace steps mimic the backend trace schema so the detail page does
    // not care whether data came from AWS or the local demo fallback.
    const steps = [
      {
        type: "input",
        timestamp: new Date((timestamp + index) * 1000).toISOString(),
        query,
        agent: run.agent_name,
      },
      {
        type: "prompt",
        timestamp: new Date((timestamp + index + 1) * 1000).toISOString(),
        text: `Agent profile: ${run.agent_name}\nSystem instruction: ${
          run.agent_type === "reasoning"
            ? "Solve step-by-step and surface tradeoffs."
            : run.agent_type === "tool"
              ? "Use calculator output when numbers appear."
              : run.agent_type === "rag"
                ? "Ground the answer in retrieved context."
                : run.agent_type === "bad"
                  ? "Answer fast even when uncertain."
                  : "Respond with the shortest useful answer."
        }\nUser request: ${query}`,
      },
      ...(run.tool_used
        ? [
            {
              type: "tool_call",
              timestamp: new Date((timestamp + index + 2) * 1000).toISOString(),
              tool: "calculator",
              expression: "3 * 220",
              result: 660,
            },
          ]
        : []),
      {
        type: "llm_call",
        timestamp: new Date((timestamp + index + 3) * 1000).toISOString(),
        model_id: "anthropic.claude-3-haiku-20240307-v1:0",
        output:
          run.status === "failed"
            ? "Model invocation timed out after multiple noisy retries."
            : run.response_text,
      },
      ...(run.status === "failed"
        ? [
            {
              type: "error",
              timestamp: new Date((timestamp + index + 4) * 1000).toISOString(),
              message: "The intentionally bad agent produced an unstable output and was marked failed.",
            },
          ]
        : [
            {
              type: "response",
              timestamp: new Date((timestamp + index + 4) * 1000).toISOString(),
              text: run.response_text,
              latency: run.latency,
            },
          ]),
    ];

    const trace: AgentTrace = {
      execution_id: run.execution_id,
      agent_id: run.agent_id,
      agent_type: run.agent_type,
      query: run.query,
      created_at: new Date(timestamp * 1000).toISOString(),
      steps,
      summary: {
        latency: run.latency,
        score: run.score,
        status: run.status,
        anomalies: run.anomalies,
      },
    };

    return [run.agent_id, trace];
  }),
) as Record<string, AgentTrace>;

export const demoExecution: ExecutionResponse = {
  execution_id: executionId,
  status: "demo_loaded",
  agent_count: demoRuns.length,
  query,
  demo: true,
};

export function getDemoRuns(): AgentRunSummary[] {
  return demoRuns;
}

export function getDemoRun(agentId: string): AgentRunSummary | undefined {
  return demoRuns.find((run) => run.agent_id === agentId);
}

export function getDemoTrace(agentId: string): AgentTrace | undefined {
  return demoTraces[agentId];
}
