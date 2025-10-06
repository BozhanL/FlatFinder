/* istanbul ignore file */
// This file contains only type definitions.
// No need to test it in unit tests.

export type FilterState = {
  type: string[];
  minPrice: string;
  maxPrice: string;
  bedrooms: number | null;
  bathrooms: number | null;
  minContract: string;
};
