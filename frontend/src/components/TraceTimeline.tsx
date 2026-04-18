import type { TraceStep } from "../types";

type TraceTimelineProps = {
  steps: TraceStep[];
};

function renderValue(value: unknown) {
  // Strings are shown directly; other payloads are serialized for readability.
  if (typeof value === "string") {
    return value;
  }
  return JSON.stringify(value);
}

export function TraceTimeline({ steps }: TraceTimelineProps) {
  return (
    // The timeline reads like an execution log: input, prompt, tool calls, model call, output.
    <div className="panel trace-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Trace</p>
          <h2>Execution steps and tool activity</h2>
        </div>
      </div>

      <div className="trace-list">
        {steps.map((step, index) => {
          // `type` and `timestamp` are rendered separately as the trace header.
          const entries = Object.entries(step).filter(([key]) => key !== "type" && key !== "timestamp");
          return (
            <article className="trace-step" key={`${step.type}-${index}`}>
              <div className="trace-marker">{index + 1}</div>
              <div className="trace-body">
                <div className="trace-head">
                  <strong>{step.type}</strong>
                  <span>{new Date(step.timestamp).toLocaleString()}</span>
                </div>
                {entries.map(([key, value]) => (
                  <div className="trace-entry" key={key}>
                    <span>{key}</span>
                    <code>{renderValue(value)}</code>
                  </div>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
