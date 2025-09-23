/* istanbul ignore file */
// This file mainly contains code for IO, and unable to be tested in unit tests.
import type { Property } from "@/types/Prop";
import {
  collection,
  FirebaseFirestoreTypes,
  getFirestore,
  onSnapshot,
} from "@react-native-firebase/firestore";
import { useEffect, useState } from "react";
import useUser from "./useUser";

type UsePropertiesResult = {
  properties: Property[];
  loading: boolean;
  error: string | null;
};

export default function useProperties(): UsePropertiesResult {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const user = useUser();

  useEffect(() => {
    // Mark that authentication has been checked
    if (user !== undefined) {
      setAuthChecked(true);
    }

    // Wait for auth to be checked before showing error
    if (!authChecked) {
      return;
    }

    if (!user) {
      setLoading(false);
      setError("User not authenticated");
      return;
    }

    const db = getFirestore();
    const propertiesCollection = collection(db, "properties");

    return onSnapshot(
      propertiesCollection,
      (snapshot: FirebaseFirestoreTypes.QuerySnapshot) => {
        setLoading(true);
        setError(null);

        const fetchedProperties: Property[] = [];

        snapshot.forEach((doc) => {
          const data = doc.data();

          // Extract coordinates from GeoPoint data
          const coordinates: FirebaseFirestoreTypes.GeoPoint | undefined =
            data["coordinates"];
          const latitude = coordinates?.latitude;
          const longitude = coordinates?.longitude;

          const property: Property = {
            id: doc.id,
            title: data["title"] || "Untitled Property",
            latitude: latitude || 0,
            longitude: longitude || 0,
            price: data["price"] || 0,
            type: data["type"] || "rental",
            bedrooms: data["bedrooms"] || undefined,
            bathrooms: data["bathrooms"] || undefined,
            contract: data["contract"] || undefined,
          };

          fetchedProperties.push(property);
        });

        setProperties(fetchedProperties);
        setLoading(false);
        console.log(
          `Loaded ${fetchedProperties.length} properties from Firebase`,
        );
      },
      (error) => {
        console.error("Error with real-time properties listener:", error);
        setError(error.message);
        setLoading(false);
      },
    );
  }, [user, authChecked]);

  return { properties, loading, error };
}