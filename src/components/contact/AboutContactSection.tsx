"use client";

import { useState } from "react";
import { ContactModal } from "./ContactModal";

export function AboutContactSection() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="dark-feature-panel relative overflow-hidden p-8 text-center text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.15),transparent_38%)]" />
        <div className="relative">
          <p className="section-kicker">Talk shop</p>
          <h2 className="mt-3 font-display text-3xl font-bold uppercase text-white">
            Got feedback?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[--color-nav-text]/78">
            We actively improve the product based on what contractors, estimators,
            and builders tell us they need in the field.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="btn-tactile relative mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[--color-orange-brand] px-5 py-3 text-sm font-black uppercase tracking-[0.08em] text-white transition-all duration-200 hover:bg-[--color-orange-dark] active:scale-[0.98]"
        >
          Contact me
        </button>
      </div>
      <ContactModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Contact me"
        description="Send a message and I'll get back to you via email."
      />
    </>
  );
}
