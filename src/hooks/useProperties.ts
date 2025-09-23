import { Property } from "@/types/FilterState";
import { getAuth } from "@react-native-firebase/auth";
import {
  collection,
  FirebaseFirestoreTypes,
  getFirestore,
  onSnapshot,
} from "@react-native-firebase/firestore";
import { useEffect, useState } from "react";

interface UsePropertiesResult {
  properties: Property[];
  loading: boolean;
  error: string | null;
}

export const useProperties = (): UsePropertiesResult => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const uid = getAuth().currentUser?.uid;

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      setError("User not authenticated");
      return;
    }

    const db = getFirestore();
    const propertiesCollection = collection(db, "properties");

    const unsubscribe = onSnapshot(
      propertiesCollection,
      (snapshot) => {
        setLoading(true);
        setError(null);

        const fetchedProperties: Property[] = [];

        snapshot.forEach(
          (doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
            const data = doc.data();

            if (data) {
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
            }
          },
        );

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

    return () => unsubscribe();
  }, [uid]);

  return { properties, loading, error };
};
