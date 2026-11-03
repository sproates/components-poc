export interface SpinnerProps {
  label?: string;
  size?: "small" | "medium";
}
export function Spinner({ label = "Loading", size = "medium" }: SpinnerProps) {
  return (
    <span role="status" className={`ds-progress ds-progress--${size}`}>
      <span className="ds-spinner" aria-hidden="true" />
      <span className="ds-sr-only">{label}</span>
    </span>
  );
}
