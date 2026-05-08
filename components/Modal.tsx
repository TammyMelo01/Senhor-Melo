export function Modal({ title, open, onClose, children }: {title:string; open:boolean; onClose:()=>void; children:React.ReactNode}) {
 if(!open) return null;
 return <div className="modal-backdrop"><div className="modal-card"><div className="modal-head"><h2>{title}</h2><button onClick={onClose}>×</button></div>{children}</div></div>;
}
