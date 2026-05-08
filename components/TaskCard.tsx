import { CalendarItem } from "@/lib/types";
export function TaskCard({task}:{task:CalendarItem}){return <article className="task-card"><div><strong>{task.title}</strong><span>{task.priority} • {task.memberName}</span></div><ul>{task.microsteps.map(step=><li key={step}>{step}</li>)}</ul></article>}
