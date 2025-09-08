import { GeoPoint } from "firebase/firestore";

export type Flatmate = {
  id: string;
  name: string;
  age: number;
  bio: string;
  avatar: number; // need to change to string later if pulling data from firestore
  budget?: number;

  location?: {
    geo: GeoPoint; // Firestore GeoPoint
    area?: string; // Suburb to show
    placeId?: string; // Google Places place_id
  };

  tags?: string[];
};
