"use client";

import { useState } from "react";
import { ContactModal } from "./ContactModal";

export function AboutContactSection() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="rounded-2xl border border-white/10 bg-[#1A1A1C] p-8 text-center text-white">
        <h2 className="mb-2 text-xl font-black uppercase text-white">
          Got feedback?
        </h2>
        <p className="mb-4 text-sm text-white/60">
          We actively improve based on what contractors and builders tell us they
          need.
        </p>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#FF8C00] px-5 py-2.5 text-sm font-black uppercase text-black transition-all hover:brightness-95"
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
