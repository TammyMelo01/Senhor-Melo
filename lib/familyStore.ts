import { supabase } from "@/lib/supabaseClient";
import { createInviteCode, FamilySession, saveFamilySession } from "@/lib/familySession";

export type FamilyMemberInput = {
  name: string;
  role: string;
  whatsapp?: string;
};

export type FamilyInvite = {
  id: string;
  family_id: string;
  family_name: string;
  code: string;
  role: string;
  status: string;
};

export async function createFamily({
  familyName,
  ownerName,
  ownerEmail,
  ownerWhatsapp,
  members,
}: {
  familyName: string;
  ownerName: string;
  ownerEmail: string;
  ownerWhatsapp: string;
  members: FamilyMemberInput[];
}) {
  const familyId = crypto.randomUUID();
  const ownerId = crypto.randomUUID();

  const session: FamilySession = {
    familyId,
    familyName,
    memberId: ownerId,
    memberName: ownerName,
    role: "owner",
  };

  saveFamilySession(session);

  if (!supabase) return { session, inviteLinks: [] as string[] };

  await supabase.from("families").upsert({
    id: familyId,
    name: familyName,
    owner_name: ownerName,
    owner_email: ownerEmail,
    owner_whatsapp: ownerWhatsapp,
    updated_at: new Date().toISOString(),
  });

  await supabase.from("family_members").upsert({
    id: ownerId,
    family_id: familyId,
    name: ownerName,
    role: "Responsável",
    color: "#2563eb",
    whatsapp: ownerWhatsapp,
    email: ownerEmail,
    status: "active",
    is_owner: true,
    updated_at: new Date().toISOString(),
  });

  const inviteLinks: string[] = [];

  for (const member of members.filter((item) => item.name.trim())) {
    const inviteCode = createInviteCode(familyId);
    inviteLinks.push(inviteCode);

    await supabase.from("family_invites").insert({
      family_id: familyId,
      family_name: familyName,
      code: inviteCode,
      invited_name: member.name,
      role: member.role,
      whatsapp: member.whatsapp || "",
      status: "pending",
    });
  }

  return { session, inviteLinks };
}

export async function getInvite(code: string): Promise<FamilyInvite | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("family_invites")
    .select("*")
    .eq("code", code)
    .single();

  if (error || !data) return null;

  return data as FamilyInvite;
}

export async function acceptInvite({
  code,
  name,
  whatsapp,
  email,
}: {
  code: string;
  name: string;
  whatsapp: string;
  email: string;
}) {
  const invite = await getInvite(code);
  if (!invite) throw new Error("Convite não encontrado ou expirado.");

  const memberId = crypto.randomUUID();

  const session: FamilySession = {
    familyId: invite.family_id,
    familyName: invite.family_name,
    memberId,
    memberName: name,
    role: "member",
  };

  if (supabase) {
    await supabase.from("family_members").insert({
      id: memberId,
      family_id: invite.family_id,
      name,
      role: invite.role || "Familiar",
      color: "#16a34a",
      whatsapp,
      email,
      status: "active",
      is_owner: false,
      updated_at: new Date().toISOString(),
    });

    await supabase
      .from("family_invites")
      .update({ status: "accepted", accepted_at: new Date().toISOString() })
      .eq("code", code);
  }

  saveFamilySession(session);
  return session;
}
