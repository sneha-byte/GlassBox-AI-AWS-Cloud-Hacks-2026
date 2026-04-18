type RunSummaryCardProps = {
  label: string;
  value: string;
  tone?: "default" | "accent" | "danger";
  helper: string;
};

export function RunSummaryCard({ label, value, tone = "default", helper }: RunSummaryCardProps) {
  return (
    // A tiny reusable card keeps the dashboard metrics consistent.
    <div className={`summary-card tone-${tone}`}>
      <p className="eyebrow">{label}</p>
      <strong>{value}</strong>
      <span>{helper}</span>
    </div>
  );
}
