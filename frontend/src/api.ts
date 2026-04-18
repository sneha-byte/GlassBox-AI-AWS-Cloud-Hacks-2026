import { demoExecution, getDemoRun, getDemoRuns, getDemoTrace } from "./mock/demoData";
import type { AgentRunSummary, AgentTrace, ExecutionResponse } from "./types";

async function readJson<T>(response: Response): Promise<T> {
  // Centralizing the status check keeps the fetch helpers below small and consistent.
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return (await response.json()) as T;
}

export async function fetchAgents(executionId?: string): Promise<AgentRunSummary[]> {
  const endpoint = executionId ? `/api/agents?execution_id=${executionId}` : "/api/agents";
  try {
    const payload = await readJson<{ items: AgentRunSummary[] }>(await fetch(endpoint));
    return payload.items;
  } catch {
    // Demo data lets the UI stay usable before AWS infrastructure is live.
    return getDemoRuns();
  }
}

export async function fetchAgent(agentId: string): Promise<AgentRunSummary> {
  try {
    return await readJson<AgentRunSummary>(await fetch(`/api/agents/${agentId}`));
  } catch {
    const demo = getDemoRun(agentId);
    if (!demo) {
      throw new Error(`Unknown agent ${agentId}`);
    }
    return demo;
  }
}

export async function fetchTrace(agentId: string, timestamp: number): Promise<AgentTrace> {
  try {
    return await readJson<AgentTrace>(await fetch(`/api/agents/${agentId}/trace?timestamp=${timestamp}`));
  } catch {
    const demo = getDemoTrace(agentId);
    if (!demo) {
      throw new Error(`Unknown trace for ${agentId}`);
    }
    return demo;
  }
}

export async function startExecution(query: string): Promise<ExecutionResponse> {
  try {
    return await readJson<ExecutionResponse>(
      await fetch("/api/executions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      }),
    );
  } catch {
    // Falling back here makes the "Run parallel execution" button work in local demos.
    return {
      ...demoExecution,
      query,
    };
  }
}
