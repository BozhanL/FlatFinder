import { GeoPoint } from "firebase/firestore";

export type Flatmate = {
  id: string;
  name: string;
  age: number;
  bio: string;
  avatar: string;
  budget?: number;

  location?: {
    geo: GeoPoint; // Firestore GeoPoint
    area?: string; // Suburb to show
    placeId?: string; // Google Places place_id
  };

  tags?: string[];
};
