"use client";

import { useState, useCallback, useTransition, useEffect } from "react";
import { UserPlus, Trash2, Users, Shield, AlertCircle } from "lucide-react";
import { inviteTeamMember, removeTeamMember } from "@/app/actions/teamManagement";

type Member = {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string | null;
  role: string;
};

type Props = {
  businessId: string;
  seatLimit: number;
  initialMembers: Member[];
};

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  owner: { label: "Owner", color: "#22c55e" },
  admin: { label: "Admin", color: "#3b82f6" },
  editor: { label: "Editor", color: "#f59e0b" },
  member: { label: "Member", color: "#64748b" },
};

export function TeamLicensingPanel({
  businessId,
  seatLimit,
  initialMembers,
}: Props) {
  const [members, setMembers] = useState(initialMembers);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Auto-clear messages
  useEffect(() => {
    if (!success && !error) return;
    const t = setTimeout(() => {
      setSuccess(null);
      setError(null);
    }, 5000);
    return () => clearTimeout(t);
  }, [success, error]);

  const handleInvite = useCallback(() => {
    if (!email.trim()) return;
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      try {
        const result = await inviteTeamMember(businessId, email.trim(), role);
        setSuccess(result.message);
        setEmail("");
        // Optimistically add to the list
        setMembers((prev) => [
          ...prev,
          {
            id: result.membershipId,
            userId: "",
            userName: email.trim(),
            userEmail: email.trim(),
            role,
          },
        ]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to invite");
      }
    });
  }, [businessId, email, role, startTransition]);

  const handleRemove = useCallback(
    (membershipId: string) => {
      startTransition(async () => {
        try {
          await removeTeamMember(businessId, membershipId);
          setMembers((prev) => prev.filter((m) => m.id !== membershipId));
          setSuccess("Member removed");
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to remove");
        }
      });
    },
    [businessId, startTransition],
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[--color-blue-soft]">
          <Users className="h-4 w-4 text-[--color-blue-brand]" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-800">Team Licensing</h2>
          <p className="text-[10px] text-slate-500">
            {members.length} / {seatLimit} seats used
          </p>
        </div>
      </div>

      {/* Invite Form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
          Add Team Member
        </p>
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="team@example.com"
            className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[--color-blue-brand] focus:outline-none focus:ring-1 focus:ring-[--color-blue-brand]"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-xs text-slate-700 focus:border-[--color-blue-brand] focus:outline-none"
          >
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="member">Member</option>
          </select>
          <button
            onClick={handleInvite}
            disabled={isPending || !email.trim()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[--color-blue-brand] px-3 py-2 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-[--color-blue-dark] disabled:opacity-50"
          >
            <UserPlus className="h-3 w-3" />
            {isPending ? "..." : "Invite"}
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-600">
          <Shield className="h-3.5 w-3.5 shrink-0" />
          {success}
        </div>
      )}

      {/* Members List */}
      <div className="space-y-1.5">
        {members.map((m) => {
          const roleInfo = ROLE_LABELS[m.role] ?? ROLE_LABELS.member;
          return (
            <div
              key={m.id}
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-2.5"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-slate-800">
                  {m.userName || m.userEmail || "Unknown"}
                </p>
                {m.userEmail && m.userName && (
                  <p className="truncate text-[10px] text-slate-400">
                    {m.userEmail}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: `${roleInfo.color}15`,
                    color: roleInfo.color,
                  }}
                >
                  {roleInfo.label}
                </span>
                {m.role !== "owner" && (
                  <button
                    onClick={() => handleRemove(m.id)}
                    disabled={isPending}
                    className="rounded-lg p-1 text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500"
                    aria-label={`Remove ${m.userName || m.userEmail}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
