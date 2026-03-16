"use client";

import { useId } from "react";

type TradeGlyphProps = { className?: string };

const ORANGE = "#f7941d";
const ORANGE_SOFT = "#f9a15a";
const SLATE = "#cbd5f5";

function BadgeFrame({
  className,
  gradientId,
  accentId,
  children,
}: {
  className?: string;
  gradientId: string;
  accentId: string;
  children: React.ReactNode;
}) {
  return (
    <svg
      viewBox="0 0 160 160"
      role="img"
      aria-hidden
      className={className}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#0a0f1a" />
        </linearGradient>
        <radialGradient id={accentId} cx="28%" cy="26%" r="70%">
          <stop offset="0%" stopColor="rgba(247,148,29,0.32)" />
          <stop offset="100%" stopColor="rgba(247,148,29,0)" />
        </radialGradient>
      </defs>
      <rect
        x="6"
        y="6"
        width="148"
        height="148"
        rx="22"
        fill={`url(#${gradientId})`}
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="2"
      />
      <rect
        x="6"
        y="6"
        width="148"
        height="148"
        rx="22"
        fill={`url(#${accentId})`}
      />
      {children}
    </svg>
  );
}

export function ConcreteGlyph({ className }: TradeGlyphProps) {
  const gradId = useId();
  const accentId = useId();

  return (
    <BadgeFrame className={className} gradientId={gradId} accentId={accentId}>
      <rect
        x="28"
        y="90"
        width="104"
        height="28"
        rx="7"
        fill="rgba(247,148,29,0.12)"
        stroke={ORANGE}
        strokeWidth="3"
      />
      <path
        d="M44 84 82 58c3-2 7-1 9 2l6 8c2 3 2 7-1 9l-31 24"
        fill="none"
        stroke={SLATE}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M57 96c-6 4-8 11-4 17l4 6"
        fill="none"
        stroke={ORANGE_SOFT}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="102" cy="64" r="8" fill={ORANGE_SOFT} opacity="0.9" />
      <rect
        x="32"
        y="106"
        width="96"
        height="6"
        rx="2"
        fill="rgba(255,255,255,0.08)"
      />
    </BadgeFrame>
  );
}

export function FramingGlyph({ className }: TradeGlyphProps) {
  const gradId = useId();
  const accentId = useId();

  return (
    <BadgeFrame className={className} gradientId={gradId} accentId={accentId}>
      <rect
        x="30"
        y="50"
        width="100"
        height="64"
        rx="10"
        fill="rgba(255,255,255,0.04)"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="2"
      />
      {[0, 22, 44, 66, 88].map((offset) => (
        <path
          key={offset}
          d={`M${42 + offset} 52v60`}
          stroke={offset % 44 === 0 ? ORANGE : SLATE}
          strokeWidth="4"
          strokeLinecap="round"
        />
      ))}
      <path
        d="M38 78h84"
        stroke={ORANGE_SOFT}
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M50 40 80 26c2-1 5-1 7 0l31 14"
        stroke={SLATE}
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="52" cy="126" r="5" fill={ORANGE_SOFT} />
      <circle cx="108" cy="126" r="5" fill={ORANGE_SOFT} />
    </BadgeFrame>
  );
}

export function RoofingGlyph({ className }: TradeGlyphProps) {
  const gradId = useId();
  const accentId = useId();

  return (
    <BadgeFrame className={className} gradientId={gradId} accentId={accentId}>
      <path
        d="M34 98 80 56l46 42"
        fill="rgba(255,255,255,0.03)"
        stroke={SLATE}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M46 92v36h28V98"
        stroke={ORANGE}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="rgba(247,148,29,0.12)"
      />
      <path
        d="M86 78h20v50H74"
        stroke={ORANGE_SOFT}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="rgba(255,255,255,0.04)"
      />
      <path
        d="M54 86h14M92 88h12"
        stroke={SLATE}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <rect
        x="66"
        y="32"
        width="28"
        height="10"
        rx="4"
        fill={ORANGE_SOFT}
      />
      <path
        d="M70 30c-4 0-6-5-3-7l12-10c2-2 5-2 7 0l12 10c3 2 1 7-3 7z"
        fill="rgba(247,148,29,0.14)"
        stroke={ORANGE}
        strokeWidth="2.5"
      />
    </BadgeFrame>
  );
}

export function MechanicalGlyph({ className }: TradeGlyphProps) {
  const gradId = useId();
  const accentId = useId();

  return (
    <BadgeFrame className={className} gradientId={gradId} accentId={accentId}>
      <rect
        x="32"
        y="62"
        width="96"
        height="32"
        rx="10"
        fill="rgba(255,255,255,0.04)"
        stroke={SLATE}
        strokeWidth="4"
      />
      <rect
        x="42"
        y="70"
        width="30"
        height="16"
        rx="5"
        fill="rgba(247,148,29,0.16)"
        stroke={ORANGE}
        strokeWidth="3"
      />
      <rect
        x="88"
        y="70"
        width="28"
        height="16"
        rx="5"
        fill="rgba(249,161,90,0.18)"
        stroke={ORANGE_SOFT}
        strokeWidth="3"
      />
      <path
        d="M32 78h-8c-5 0-8 4-8 8 0 5 3 9 8 9h12m88-17h10c5 0 8 4 8 9 0 5-3 9-8 9h-6"
        stroke={SLATE}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="58" cy="110" r="8" fill={ORANGE_SOFT} />
      <circle cx="108" cy="110" r="8" fill={ORANGE} />
      <path
        d="M54 38h52c6 0 11 5 11 11v6H43v-6c0-6 5-11 11-11z"
        fill="rgba(255,255,255,0.03)"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="3"
      />
    </BadgeFrame>
  );
}

export function FinishGlyph({ className }: TradeGlyphProps) {
  const gradId = useId();
  const accentId = useId();

  return (
    <BadgeFrame className={className} gradientId={gradId} accentId={accentId}>
      <rect
        x="30"
        y="100"
        width="100"
        height="18"
        rx="6"
        fill="rgba(247,148,29,0.16)"
        stroke={ORANGE}
        strokeWidth="3"
      />
      <path
        d="M36 96h88"
        stroke={SLATE}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M48 72h36c4 0 7 3 7 7v14H48z"
        fill="rgba(255,255,255,0.05)"
        stroke={SLATE}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M94 44c-6 0-10 5-9 11l3 16h20l3-16c1-6-3-11-9-11z"
        fill="rgba(249,161,90,0.18)"
        stroke={ORANGE_SOFT}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M88 38c0-6 5-12 12-12s12 6 12 12"
        stroke={ORANGE}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M60 80v13m12-13v13"
        stroke={ORANGE}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </BadgeFrame>
  );
}

export function BusinessGlyph({ className }: TradeGlyphProps) {
  const gradId = useId();
  const accentId = useId();

  return (
    <BadgeFrame className={className} gradientId={gradId} accentId={accentId}>
      <rect
        x="34"
        y="74"
        width="16"
        height="48"
        rx="5"
        fill="rgba(247,148,29,0.14)"
        stroke={ORANGE}
        strokeWidth="3"
      />
      <rect
        x="62"
        y="62"
        width="16"
        height="60"
        rx="5"
        fill="rgba(249,161,90,0.16)"
        stroke={ORANGE_SOFT}
        strokeWidth="3"
      />
      <rect
        x="90"
        y="50"
        width="16"
        height="72"
        rx="5"
        fill="rgba(255,255,255,0.06)"
        stroke={SLATE}
        strokeWidth="3"
      />
      <rect
        x="118"
        y="58"
        width="16"
        height="64"
        rx="5"
        fill="rgba(255,255,255,0.04)"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="3"
      />
      <path
        d="M38 52 70 38c3-1 6-1 8 0l44 18"
        stroke={SLATE}
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M40 120c12 6 26 6 38 1l14-6c12-5 25-4 36 2"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="3"
        fill="none"
      />
      <path
        d="M72 42c0-6 5-12 12-12s12 6 12 12"
        stroke={ORANGE}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </BadgeFrame>
  );
}

export function DefaultGlyph({ className }: TradeGlyphProps) {
  const gradId = useId();
  const accentId = useId();

  return (
    <BadgeFrame className={className} gradientId={gradId} accentId={accentId}>
      <circle
        cx="80"
        cy="80"
        r="34"
        fill="rgba(255,255,255,0.05)"
        stroke={SLATE}
        strokeWidth="4"
      />
      <path
        d="M80 52v20l14 10"
        stroke={ORANGE}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="80" cy="80" r="50" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
    </BadgeFrame>
  );
}

export const tradeGlyphMap: Record<string, React.ComponentType<TradeGlyphProps>> = {
  concrete: ConcreteGlyph,
  framing: FramingGlyph,
  roofing: RoofingGlyph,
  mechanical: MechanicalGlyph,
  finish: FinishGlyph,
  business: BusinessGlyph,
};

export function getTradeGlyph(category: string) {
  return tradeGlyphMap[category] ?? DefaultGlyph;
}
