import { MemberCard } from "@/components/MemberCard";
import { initialMembers } from "@/lib/mockData";
export default function MembrosPage(){return <><section className="hero-section"><span className="badge">Perfis individuais</span><h1>Todos com sua própria agenda e finanças.</h1><p className="lead">Perfis preparados para login, preferências, permissões, WhatsApp, moeda, idioma e tema.</p></section><section className="members-grid">{initialMembers.map(member=><MemberCard key={member.id} member={member}/>)}</section></>}
