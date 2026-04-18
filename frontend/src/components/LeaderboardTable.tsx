import { Link } from "react-router-dom";

import type { AgentRunSummary } from "../types";

type LeaderboardTableProps = {
  runs: AgentRunSummary[];
};

export function LeaderboardTable({ runs }: LeaderboardTableProps) {
  return (
    // This table is the dashboard's main comparison view across the agent fleet.
    <div className="panel leaderboard-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Leaderboard</p>
          <h2>Agent ranking by score, latency, and efficiency</h2>
        </div>
        <span className="capsule">{runs.length} agents</span>
      </div>

      <div className="table-shell">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Agent</th>
              <th>Type</th>
              <th>Score</th>
              <th>Latency</th>
              <th>Status</th>
              <th>Trace</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((run, index) => (
              // Failed rows get a visual treatment so weak agents stand out quickly.
              <tr key={run.agent_id} className={run.status !== "completed" ? "is-failed" : undefined}>
                <td>{index + 1}</td>
                <td>
                  <strong>{run.agent_name}</strong>
                  <div className="table-subtext">{run.agent_id}</div>
                </td>
                <td>
                  <span className={`type-pill type-${run.agent_type}`}>{run.agent_type}</span>
                </td>
                <td>{run.score.toFixed(2)}</td>
                <td>{run.latency.toFixed(2)}s</td>
                <td>
                  <span className={`status-pill status-${run.status}`}>{run.status}</span>
                </td>
                <td>
                  <Link to={`/agents/${run.agent_id}?timestamp=${run.timestamp}`} className="trace-link">
                    Open trace
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
