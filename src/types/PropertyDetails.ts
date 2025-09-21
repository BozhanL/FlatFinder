export type PropertyDetails = {
  id: string;
  title: string;
  price: number;
  type: string;
  description: string;
  bedrooms?: number;
  bathrooms?: number;
  address?: string;
  contract?: number;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
};
