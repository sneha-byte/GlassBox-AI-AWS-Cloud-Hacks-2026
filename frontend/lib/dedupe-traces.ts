import type { Trace } from "./types"

/** Keep the first occurrence of each `trace_id` (order preserved). */
export function dedupeTracesById(traces: Trace[]): Trace[] {
  const seen = new Set<string>()
  const out: Trace[] = []
  for (const t of traces) {
    if (seen.has(t.trace_id)) continue
    seen.add(t.trace_id)
    out.push(t)
  }
  return out
}
