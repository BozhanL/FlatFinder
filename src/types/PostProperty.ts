/* istanbul ignore file */
// This file contains only type definitions.
// No need to test it in unit tests.

export type FormData = {
  title: string;
  type: "rental" | "sale";
  price: string;
  description: string;
  address: string;
  latitude: string;
  longitude: string;
  bedrooms: string;
  bathrooms: string;
  minContractLength: string;
  imageUrl?: string;
};

export type FormErrors = Record<string, string>;

export type PlaceSuggestion = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
};
