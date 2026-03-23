"use client";

import Image from "next/image";
import React from "react";

// Import images statically for automatic width/height and blur placeholders
import concreteImg from "../../../../public/images/trades/concrete.png";
import framingImg from "../../../../public/images/trades/framing.png";
import roofingImg from "../../../../public/images/trades/roofing.png";
import mechanicalImg from "../../../../public/images/trades/mechanical.png";
import finishImg from "../../../../public/images/trades/finish.png";
import businessImg from "../../../../public/images/trades/business.png";
import defaultImg from "../../../../public/images/trades/default.png";

type TradeGlyphProps = { className?: string };

import { StaticImageData } from "next/image";

// Helper to wrap the image and simulate the old BadgeFrame behavior
function ImageFrame({
  src,
  alt,
  className,
}: {
  src: StaticImageData;
  alt: string;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "22px",
        height: "100%", // ensuring it fills caller's container
        width: "100%",
        boxShadow: "0 0 0 1px rgba(0,0,0,0.05)",
      }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        style={{ objectFit: "cover" }}
        sizes="(max-width: 768px) 100vw, 33vw"
        placeholder="blur"
      />
    </div>
  );
}

export function ConcreteGlyph({ className }: TradeGlyphProps) {
  return <ImageFrame src={concreteImg} alt="Concrete Construction" className={className} />;
}

export function FramingGlyph({ className }: TradeGlyphProps) {
  return <ImageFrame src={framingImg} alt="Wood Framing" className={className} />;
}

export function RoofingGlyph({ className }: TradeGlyphProps) {
  return <ImageFrame src={roofingImg} alt="Roofing" className={className} />;
}

export function MechanicalGlyph({ className }: TradeGlyphProps) {
  return <ImageFrame src={mechanicalImg} alt="Mechanical & HVAC" className={className} />;
}

export function FinishGlyph({ className }: TradeGlyphProps) {
  return <ImageFrame src={finishImg} alt="Finish Carpentry" className={className} />;
}

export function BusinessGlyph({ className }: TradeGlyphProps) {
  return <ImageFrame src={businessImg} alt="Business & Management" className={className} />;
}

export function DefaultGlyph({ className }: TradeGlyphProps) {
  return <ImageFrame src={defaultImg} alt="Construction Calculator" className={className} />;
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
