import { TaskCard } from "@/components/TaskCard";
import { initialEvents } from "@/lib/mockData";
export default function TarefasPage(){return <><section className="hero-section"><span className="badge">Tarefas e microetapas</span><h1>Grandes atividades viram passos simples.</h1></section><section className="quick-grid">{initialEvents.map(task=><TaskCard key={task.id} task={task}/>)}</section></>}
