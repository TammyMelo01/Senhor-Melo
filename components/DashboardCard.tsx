import { ReactNode } from "react";
export function DashboardCard({ title, value, subtitle, icon, tone="blue" }: {title:string; value:string; subtitle:string; icon:ReactNode; tone?:"blue"|"green"|"red"|"yellow"}) {
 return <div className="metric-card"><div className={`metric-icon ${tone}`}>{icon}</div><div><span>{title}</span><strong>{value}</strong><p>{subtitle}</p></div></div>;
}
