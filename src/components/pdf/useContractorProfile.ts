"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";

interface ContractorProfile {
  businessName: string | null;
  logoUrl: string | null;
  businessAddress: string | null;
  businessPhone: string | null;
  businessEmail: string | null;
}

const EMPTY_PROFILE: ContractorProfile = {
  businessName: null,
  logoUrl: null,
  businessAddress: null,
  businessPhone: null,
  businessEmail: null,
};

export function useContractorProfile() {
  const { userId, isLoaded } = useAuth();
  const status = isLoaded ? (userId ? "authenticated" : "unauthenticated") : "loading";
  const [profile, setProfile] = useState<ContractorProfile>(EMPTY_PROFILE);

  useEffect(() => {
    if (status === "loading") return;
    if (!userId) return;

    let cancelled = false;

    fetch("/api/contractor-profile")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load contractor profile");
        return res.json();
      })
      .then((json) => {
        if (cancelled) return;
        setProfile({
          businessName: json?.profile?.businessName ?? null,
          logoUrl: json?.profile?.logoUrl ?? null,
          businessAddress: json?.profile?.businessAddress ?? null,
          businessPhone: json?.profile?.businessPhone ?? null,
          businessEmail: json?.profile?.businessEmail ?? null,
        });
      })
      .catch(() => {
        if (cancelled) return;
        setProfile(EMPTY_PROFILE);
      });

    return () => {
      cancelled = true;
    };
  }, [userId, status]);

  if (!userId) return EMPTY_PROFILE;
  return profile;
}
