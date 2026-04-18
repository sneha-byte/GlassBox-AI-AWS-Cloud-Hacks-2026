import { FormEvent, useEffect, useState } from "react";

import { fetchAgents, startExecution } from "../api";
import { LeaderboardTable } from "../components/LeaderboardTable";
import { RunSummaryCard } from "../components/RunSummaryCard";
import type { AgentRunSummary, ExecutionResponse } from "../types";

const DEFAULT_QUERY = "Plan a trip to NYC";

export function Dashboard() {
  // Local component state tracks the current query and the latest leaderboard payload.
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [runs, setRuns] = useState<AgentRunSummary[]>([]);
  const [execution, setExecution] = useState<ExecutionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLaunching, setIsLaunching] = useState(false);

  useEffect(() => {
    // On first load we either fetch real data or fall back to the built-in demo dataset.
    fetchAgents()
      .then(setRuns)
      .finally(() => setIsLoading(false));
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLaunching(true);

    // Starting an execution returns an execution id; then we immediately
    // ask for the leaderboard tied to that run.
    const createdExecution = await startExecution(query);
    setExecution(createdExecution);
    const refreshedRuns = await fetchAgents(createdExecution.execution_id);
    setRuns(refreshedRuns);
    setIsLaunching(false);
  };

  const topScore = runs[0]?.score ?? 0;
  const averageLatency =
    runs.length > 0 ? runs.reduce((total, run) => total + run.latency, 0) / runs.length : 0;
  const failedAgents = runs.filter((run) => run.status !== "completed").length;

  return (
    <div className="page-shell">
      {/* Hero: what the product does and a quick way to trigger the demo flow. */}
      <section className="hero panel">
        <div>
          <p className="eyebrow">AgentScope</p>
          <h1>AWS-native observability for multi-agent orchestration</h1>
          <p className="hero-copy">
            Run 20+ Bedrock-backed agents in parallel, persist full traces, rank them in real time, and
            inspect the exact tool and model steps behind every result.
          </p>
        </div>

        <form className="launch-form" onSubmit={handleSubmit}>
          <label htmlFor="query">Demo prompt</label>
          <textarea
            id="query"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            rows={3}
          />
          <button type="submit" disabled={isLaunching}>
            {isLaunching ? "Launching agents..." : "Run parallel execution"}
          </button>
          <p className="form-note">
            Default demo flow uses <strong>Plan a trip to NYC</strong> and highlights an intentional bad
            agent failure.
          </p>
        </form>
      </section>

      {/* Summary cards surface the metrics most judges or teammates notice first. */}
      <section className="summary-grid">
        <RunSummaryCard label="Fleet Size" value={`${runs.length || 20}`} helper="Prompt/config variants across 5 agent families" />
        <RunSummaryCard
          label="Best Score"
          value={topScore ? topScore.toFixed(2) : "--"}
          tone="accent"
          helper="Latency, response size, and anomaly-aware ranking"
        />
        <RunSummaryCard
          label="Avg Latency"
          value={`${averageLatency.toFixed(2)}s`}
          helper="Mean turnaround for the current leaderboard"
        />
        <RunSummaryCard
          label="Failures"
          value={`${failedAgents}`}
          tone={failedAgents > 0 ? "danger" : "default"}
          helper="Used in demos to show noisy or unstable agents"
        />
      </section>

      {execution ? (
        <section className="execution-banner">
          <span className="capsule">{execution.status}</span>
          <strong>{execution.execution_id}</strong>
          <span>{execution.agent_count} agents queued for the query: "{execution.query}"</span>
        </section>
      ) : null}

      {isLoading ? <div className="panel loading-panel">Loading leaderboard...</div> : <LeaderboardTable runs={runs} />}
    </div>
  );
}
