export type FilterState = {
  type: string[];
  minPrice: string;
  maxPrice: string;
  bedrooms: number | null;
  bathrooms: number | null;
  minContract: string;
};
