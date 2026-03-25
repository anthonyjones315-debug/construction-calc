"use client";

import React from "react";
import { PlaceAutocomplete } from "./PlaceAutocomplete";

interface AddressAutocompleteProps {
  apiKey: string;
  defaultValue?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddressSelect: (address: string, lat?: number, lng?: number) => void;
  placeholder?: string;
  className?: string;
}

export function AddressAutocomplete({
  apiKey,
  defaultValue,
  onChange,
  onAddressSelect,
  placeholder = "Start typing an address...",
  className,
}: AddressAutocompleteProps) {
  return (
    <PlaceAutocomplete
      apiKey={apiKey}
      onPlaceSelect={onAddressSelect}
      onChange={onChange}
      defaultValue={defaultValue}
      placeholder={placeholder}
      className={
        className ||
        "h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[--color-blue-brand]/45 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[--color-blue-brand]/20"
      }
    />
  );
}
