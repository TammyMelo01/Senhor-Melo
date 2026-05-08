import { ReactNode } from "react";

export function DashboardCard({
  title,
  value,
  subtitle,
  icon,
  tone = "blue",
  onClick,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: ReactNode;
  tone?: "blue" | "green" | "red" | "yellow";
  onClick?: () => void;
}) {
  return (
    <button className="metric-card" onClick={onClick}>
      <div className={`metric-icon ${tone}`}>{icon}</div>
      <div>
        <span>{title}</span>
        <strong>{value}</strong>
        <p>{subtitle}</p>
      </div>
    </button>
  );
}
