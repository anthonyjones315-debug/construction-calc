import { CheckCircle2, Circle, XCircle } from "lucide-react";
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  getPasswordPolicyChecks,
} from "@/lib/security/password-policy";

type PasswordRequirementsProps = {
  password: string;
  confirmPassword?: string;
  showMatchRule?: boolean;
  className?: string;
};

type RequirementItem = {
  key: string;
  label: string;
  satisfied: boolean;
  active: boolean;
};

export function PasswordRequirements({
  password,
  confirmPassword,
  showMatchRule = false,
  className = "",
}: PasswordRequirementsProps) {
  const checks = getPasswordPolicyChecks(password);
  const hasStarted = password.length > 0;
  const confirmStarted = typeof confirmPassword === "string" && confirmPassword.length > 0;

  const items: RequirementItem[] = [
    {
      key: "length",
      label: `Use ${PASSWORD_MIN_LENGTH}-${PASSWORD_MAX_LENGTH} characters`,
      satisfied: checks.length,
      active: hasStarted,
    },
    {
      key: "uppercase",
      label: "Include at least one uppercase letter",
      satisfied: checks.uppercase,
      active: hasStarted,
    },
    {
      key: "lowercase",
      label: "Include at least one lowercase letter",
      satisfied: checks.lowercase,
      active: hasStarted,
    },
    {
      key: "number",
      label: "Include at least one number",
      satisfied: checks.number,
      active: hasStarted,
    },
    {
      key: "special",
      label: "Include at least one special character",
      satisfied: checks.special,
      active: hasStarted,
    },
    {
      key: "noSpaces",
      label: "Do not use spaces",
      satisfied: checks.noSpaces,
      active: hasStarted,
    },
  ];

  if (showMatchRule) {
    items.push({
      key: "match",
      label: "Passwords must match",
      satisfied:
        typeof confirmPassword === "string" &&
        confirmPassword.length > 0 &&
        password === confirmPassword,
      active: Boolean(confirmStarted),
    });
  }

  return (
    <div className={`rounded-xl border border-[--color-border] bg-[--color-surface-alt] px-4 py-3 ${className}`}>
      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[--color-ink-dim]">
        Password Requirements
      </p>
      <ul className="space-y-1.5 text-xs text-[--color-ink-dim]">
        {items.map((item) => {
          const Icon = item.satisfied ? CheckCircle2 : item.active ? XCircle : Circle;
          const iconClassName = item.satisfied
            ? "text-emerald-500"
            : item.active
              ? "text-red-500"
              : "text-slate-500";

          return (
            <li key={item.key} className="flex items-center gap-2">
              <Icon className={`h-4 w-4 shrink-0 ${iconClassName}`} aria-hidden />
              <span>{item.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
