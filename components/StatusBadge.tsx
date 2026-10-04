import { statusLabel } from "@/lib/status";

export default function StatusBadge({ status }: { status: string }) {
  return <span className={`status status-${status.toLowerCase()}`}>{statusLabel(status)}</span>;
}
