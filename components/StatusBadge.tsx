import { statusLabel } from "@/lib/status";

export default function StatusBadge({ status, label }: { status: string; label?: string }) {
  return <span className={`status status-${status.toLowerCase()}`}>{label ?? statusLabel(status)}</span>;
}
