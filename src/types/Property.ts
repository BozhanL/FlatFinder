/* istanbul ignore file */
// This file contains only type definitions.
// No need to test it in unit tests.

export type Property = {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  price: number;
  type?: string;
  bedrooms?: number;
  bathrooms?: number;
  contract?: number;
  description?: string;
  address?: string;
  imageUrl?: string | string[];
};
