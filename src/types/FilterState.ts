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
  imageUrl?: string;
}

export type Property = {
  type: string[];
  minPrice: string;
  maxPrice: string;
  bedrooms: number | null;
  bathrooms: number | null;
  minContract: string;
}
