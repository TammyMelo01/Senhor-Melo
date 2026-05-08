import { Member } from "@/lib/types";
export function MemberCard({member}:{member:Member}){return <article className="member-card"><div className="member-avatar" style={{background:member.color}}>{member.name.slice(0,1)}</div><div><strong>{member.name}</strong><span>{member.role}</span><p>{member.whatsapp||"WhatsApp não informado"}</p></div></article>}
