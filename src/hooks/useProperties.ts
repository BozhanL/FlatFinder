/* istanbul ignore file */
// This file mainly contains code for IO, and unable to be tested in unit tests.
// react-native-firebase does not work in jest unit test environment.
// Mocking it is possible, but it may not represent real world situation.
import type { Property } from "@/types/Property";
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

  const user = useUser();

  useEffect(() => {
    // Wait for auth to be checked before showing error
    if (user === undefined) {
      return;
    } else if (!user) {
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
  }, [user]);

  return { properties, loading, error };
}
