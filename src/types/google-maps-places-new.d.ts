/**
 * Type declarations for the Google Maps Places API (New) —
 * PlaceAutocompleteElement Web Component + importLibrary.
 *
 * The @types/google.maps package doesn't ship these yet,
 * so we declare just the subset we use.
 */

declare namespace google.maps {
  function importLibrary(name: string): Promise<unknown>;
}

declare namespace google.maps.places {
  interface PlaceAutocompleteElementOptions {
    types?: string[];
    componentRestrictions?: { country: string | string[] };
    locationBias?: google.maps.LatLng | google.maps.LatLngLiteral | google.maps.LatLngBounds;
    locationRestriction?: google.maps.LatLngBounds;
    includedPrimaryTypes?: string[];
    includedRegionCodes?: string[];
  }

  class PlaceAutocompleteElement extends HTMLElement {
    constructor(options?: PlaceAutocompleteElementOptions);
    placeholder: string;
    types: string[];
    includedPrimaryTypes: string[];
    includedRegionCodes: string[];

    addEventListener(
      type: "gmp-select",
      listener: (event: PlaceAutocompletePlaceSelectEvent) => void,
    ): void;
    addEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions,
    ): void;
  }

  interface PlaceAutocompletePlaceSelectEvent extends Event {
    placePrediction: PlaceAutocompletePrediction;
  }

  interface PlaceAutocompletePrediction {
    text: { toString(): string };
    toPlace(): Place;
  }
}
