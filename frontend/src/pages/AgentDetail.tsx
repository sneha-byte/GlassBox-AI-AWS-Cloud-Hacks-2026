import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";

import { fetchAgent, fetchTrace } from "../api";
import { TraceTimeline } from "../components/TraceTimeline";
import type { AgentRunSummary, AgentTrace } from "../types";

export function AgentDetail() {
  // The route parameter chooses the agent; the query string chooses the exact run timestamp.
  const { agentId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const [run, setRun] = useState<AgentRunSummary | null>(null);
  const [trace, setTrace] = useState<AgentTrace | null>(null);

  useEffect(() => {
    // Load the summary first so the page can render useful metrics quickly.
    fetchAgent(agentId).then(setRun);
  }, [agentId]);

  useEffect(() => {
    const timestamp = Number(searchParams.get("timestamp") ?? 0);
    if (!agentId || !timestamp) {
      return;
    }
    fetchTrace(agentId, timestamp).then(setTrace);
  }, [agentId, searchParams]);

  if (!run) {
    return <div className="panel loading-panel">Loading agent details...</div>;
  }

  // Clamp the progress bar so very small latencies still remain visible.
  const latencyWidth = Math.min(100, Math.max(12, run.latency * 18));

  return (
    <div className="page-shell">
      <Link to="/" className="back-link">
        Back to dashboard
      </Link>

      <section className="detail-hero panel">
        <div>
          <p className="eyebrow">Agent Detail</p>
          <h1>{run.agent_name}</h1>
          <p className="hero-copy">{run.query}</p>
        </div>

        <div className="detail-metrics">
          <div>
            <span>Type</span>
            <strong className={`type-pill type-${run.agent_type}`}>{run.agent_type}</strong>
          </div>
          <div>
            <span>Status</span>
            <strong className={`status-pill status-${run.status}`}>{run.status}</strong>
          </div>
          <div>
            <span>Score</span>
            <strong>{run.score.toFixed(2)}</strong>
          </div>
          <div>
            <span>Cost</span>
            <strong>${run.cost_estimate_usd.toFixed(6)}</strong>
          </div>
        </div>
      </section>

      <section className="detail-grid">
        <div className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Response</p>
              <h2>Observed output</h2>
            </div>
          </div>
          <p className="response-copy">
            {run.response_text || "This run failed intentionally to demonstrate anomaly surfacing and trace review."}
          </p>
          <div className="latency-meter">
            <div className="latency-meter-fill" style={{ width: `${latencyWidth}%` }} />
          </div>
          <div className="metric-row">
            <span>Latency</span>
            <strong>{run.latency.toFixed(2)}s</strong>
          </div>
          <div className="metric-row">
            <span>Fallback</span>
            <strong>{run.fallback_mode}</strong>
          </div>
          <div className="metric-row">
            <span>Timestamp</span>
            <strong>{new Date(run.timestamp * 1000).toLocaleString()}</strong>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Anomalies</p>
              <h2>Signals worth inspecting</h2>
            </div>
          </div>
          <div className="anomaly-list">
            {run.anomalies.length ? (
              run.anomalies.map((anomaly) => (
                <span key={anomaly} className="anomaly-pill">
                  {anomaly}
                </span>
              ))
            ) : (
              <span className="capsule">No anomalies detected</span>
            )}
          </div>
          <p className="detail-note">
            The bad-agent family is intentionally noisy so judges can see failures, trace depth, and scoring
            penalties in one click.
          </p>
        </div>
      </section>

      {trace ? <TraceTimeline steps={trace.steps} /> : <div className="panel loading-panel">Loading trace...</div>}
    </div>
  );
}
