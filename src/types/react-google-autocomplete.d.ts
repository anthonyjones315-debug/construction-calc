declare module "react-google-autocomplete" {
  import type { ComponentProps } from "react";

  export interface AutocompleteProps
    extends Omit<ComponentProps<"input">, "onSelect"> {
    apiKey?: string;
    language?: string;
    options?: google.maps.places.AutocompleteOptions;
    onPlaceSelected?: (
      place: google.maps.places.PlaceResult,
      inputRef: HTMLInputElement,
      autocomplete: google.maps.places.Autocomplete,
    ) => void;
    inputAutocompleteValue?: string;
    libraries?: string[];
    defaultValue?: string;
  }

  const Autocomplete: React.FC<AutocompleteProps>;
  export default Autocomplete;

  export function usePlacesWidget(options: {
    apiKey?: string;
    onPlaceSelected?: (place: google.maps.places.PlaceResult) => void;
    options?: google.maps.places.AutocompleteOptions;
    language?: string;
    libraries?: string[];
    inputAutocompleteValue?: string;
  }): {
    ref: React.RefObject<HTMLInputElement>;
  };
}
