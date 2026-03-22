"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { routes } from "@routes";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  Check,
  Calculator,
  Crown,
  FileText,
  Users,
} from "lucide-react";

type Props = {
  mode: "owner" | "join";
  nextPath: string;
  setupError: string | null;
  createBusinessAction: (formData: FormData) => Promise<void>;
};

// ─── Owner setup ─────────────────────────────────────────────────────────────

function OwnerSetup({
  nextPath,
  setupError,
  createBusinessAction,
}: {
  nextPath: string;
  setupError: string | null;
  createBusinessAction: (formData: FormData) => Promise<void>;
}) {
  return (
    <div className="w-full max-w-lg">
      {/* Brand header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-600 text-white font-black text-lg shadow-sm">
          P
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
            Pro Construction Calc
          </p>
          <p className="text-sm font-semibold text-slate-700">Business Setup</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-300 bg-orange-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-orange-700">
          <Crown className="h-3 w-3" aria-hidden /> Owner Setup
        </span>
        <h1 className="mt-3 text-2xl font-black uppercase text-slate-900">
          Create Your Business
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          You&apos;re the first one in. Set your business name to start building
          estimates, managing your crew, and running the full calculator suite.
        </p>

        {/* Feature preview */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { icon: Calculator, label: "Calculators" },
            { icon: FileText, label: "Estimates" },
            { icon: Users, label: "Crew" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-3 px-2"
            >
              <Icon className="h-5 w-5 text-orange-600" aria-hidden />
              <p className="text-[11px] font-semibold text-slate-600">{label}</p>
            </div>
          ))}
        </div>

        {setupError && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-300 bg-red-50 px-3 py-2.5">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" aria-hidden />
            <p className="text-sm text-red-700">{setupError}</p>
          </div>
        )}

        <form action={createBusinessAction} className="mt-5 space-y-4">
          <input type="hidden" name="next" value={nextPath} />

          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            Business Name
            <input
              name="businessName"
              type="text"
              required
              autoFocus
              placeholder="Acme Construction Co."
              className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            />
            <span className="text-[11px] font-normal text-slate-400">
              This appears on every estimate you send — keep it professional.
            </span>
          </label>

          <button
            type="submit"
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 text-sm font-black uppercase tracking-[0.08em] text-white shadow-sm transition hover:bg-orange-700"
          >
            Create Business &amp; Enter
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-400">
          Have a join code?{" "}
          <Link
            href={`/onboarding?mode=join`}
            className="font-semibold text-orange-600 hover:text-orange-700"
          >
            Join an existing business instead
          </Link>
        </p>
      </div>
    </div>
  );
}

// ─── Crew join flow ───────────────────────────────────────────────────────────

function CrewJoin({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [state, setState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!trimmed) return;

    setState("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/command-center/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ joinCode: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? "Could not join. Please check the code and try again.");
        setState("error");
        return;
      }
      setState("success");
      setTimeout(() => {
        router.push(nextPath as never);
      }, 1200);
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.");
      setState("error");
    }
  }

  return (
    <div className="w-full max-w-lg">
      {/* Brand header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-600 text-white font-black text-lg shadow-sm">
          P
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
            Pro Construction Calc
          </p>
          <p className="text-sm font-semibold text-slate-700">Crew Onboarding</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-300 bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-blue-700">
          <Users className="h-3 w-3" aria-hidden /> Crew Member
        </span>
        <h1 className="mt-3 text-2xl font-black uppercase text-slate-900">
          Join Your Team
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Enter the invite code your business owner gave you. You&apos;ll be
          added to their workspace and can start running estimates right away.
        </p>

        {/* What you get */}
        <div className="mt-4 space-y-2">
          {[
            { icon: Calculator, text: "Full access to every trade calculator" },
            { icon: FileText, text: "Create and manage your own estimates" },
            { icon: Building2, text: "Work inside your company's workspace" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
              <Icon className="h-4 w-4 shrink-0 text-orange-600" aria-hidden />
              <p className="text-xs font-semibold text-slate-700">{text}</p>
            </div>
          ))}
        </div>

        {state === "success" ? (
          <div className="mt-5 flex items-center gap-2.5 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3.5">
            <Check className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
            <div>
              <p className="text-sm font-bold text-emerald-800">Joined! Redirecting…</p>
              <p className="text-xs text-emerald-700">Welcome to the team.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleJoin} className="mt-5 space-y-4">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
              Invite Code
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                autoFocus
                placeholder="e.g. ABCD1234"
                className="h-11 rounded-xl border border-slate-300 bg-white px-3 font-mono text-base tracking-[0.12em] text-slate-900 placeholder:font-sans placeholder:text-sm placeholder:tracking-normal placeholder:text-slate-400 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              />
              <span className="text-[11px] font-normal text-slate-400">
                6–12 characters, no spaces. Ask your owner if you don&apos;t have one.
              </span>
            </label>

            {(state === "error" || errorMsg) && (
              <div className="flex items-start gap-2 rounded-xl border border-red-300 bg-red-50 px-3 py-2.5">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" aria-hidden />
                <p className="text-sm text-red-700">{errorMsg}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={state === "submitting" || !code.trim()}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 text-sm font-black uppercase tracking-[0.08em] text-white shadow-sm transition hover:bg-orange-700 disabled:opacity-60"
            >
              {state === "submitting" ? "Joining…" : "Join Team"}
              {state !== "submitting" && <ArrowRight className="h-4 w-4" aria-hidden />}
            </button>
          </form>
        )}

        <p className="mt-4 text-center text-xs text-slate-400">
          Are you the business owner?{" "}
          <Link
            href="/onboarding"
            className="font-semibold text-orange-600 hover:text-orange-700"
          >
            Create a new business instead
          </Link>
        </p>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function OnboardingClient({
  mode,
  nextPath,
  setupError,
  createBusinessAction,
}: Props) {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-slate-50 px-4 py-12">
      {mode === "join" ? (
        <CrewJoin nextPath={nextPath} />
      ) : (
        <OwnerSetup
          nextPath={nextPath}
          setupError={setupError}
          createBusinessAction={createBusinessAction}
        />
      )}
    </main>
  );
}
