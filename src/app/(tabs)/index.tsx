import HeaderLogo from "@/components/HeaderLogo";
import PropertiesContent from "@/components/property/PropertiesContent";
import Segmented from "@/components/Segmented";
import {
  collection,
  FirebaseFirestoreTypes,
  getDocs,
  getFirestore,
} from "@react-native-firebase/firestore";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const styles = StyleSheet.create({
  segmentedContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  filterBtn: {
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ECEBEC",
    alignItems: "center",
    justifyContent: "center",
  },
  filterBtnActive: {
    backgroundColor: "#2563eb",
  },
  filterBtnText: {
    fontWeight: "600",
    color: "#000",
  },
  filterBtnTextActive: {
    color: "#fff",
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

const enum TabMode {
  Flatmates = "Flatmates",
  Properties = "Properties",
}

// Interface for property data
interface Property {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  price: number;
  type?: string;
  bedrooms?: number;
  bathrooms?: number;
  contract?: number;
}

interface FilterState {
  type: string[];
  minPrice: string;
  maxPrice: string;
  bedrooms: number | null;
  bathrooms: number | null;
  minContract: string;
}

// Global filter state
let globalFilters: FilterState = {
  type: [],
  minPrice: "",
  maxPrice: "",
  bedrooms: null,
  bathrooms: null,
  minContract: "",
};

let globalApplyFilter: ((filters: FilterState) => void) | null = null;

export const getGlobalApplyFilter = ():
  | ((filters: FilterState) => void)
  | null => globalApplyFilter;

export default function Index(): React.JSX.Element {
  const [mode, setMode] = useState(TabMode.Flatmates);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null,
  );
  const [isVisible, setIsVisible] = useState(false);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>(globalFilters);

  // Filter function
  useEffect(() => {
    globalApplyFilter = (newFilters: FilterState): void => {
      console.log("Applying filters in index:", newFilters);
      setFilters(newFilters);
      globalFilters = newFilters;
    };

    return (): void => {
      globalApplyFilter = null;
    };
  }, []);

  // Using client sided filtering as firestore doesn't support complex "OR" queries
  // Eg, both "minimum bedrooms" and "minimum bathrooms" at the same time
  const applyFilters = (
    properties: Property[],
    filters: FilterState,
  ): Property[] => {
    return properties.filter((property) => {
      // Property type filter - if empty, show all types
      if (filters.type.length > 0) {
        const propertyType = property.type || "rental";
        if (!filters.type.includes(propertyType)) {
          return false;
        }
      }

      // Price filter
      if (filters.minPrice !== "" || filters.maxPrice !== "") {
        const minPrice = filters.minPrice ? parseFloat(filters.minPrice) : 0;
        const maxPrice = filters.maxPrice
          ? parseFloat(filters.maxPrice)
          : Infinity;

        if (!isNaN(minPrice) && !isNaN(maxPrice)) {
          if (property.price < minPrice || property.price > maxPrice) {
            return false;
          }
        }
      }

      // Bedrooms filter - single selection (null means no filter)
      if (filters.bedrooms !== null) {
        const propertyBedrooms = property.bedrooms || 0;
        if (propertyBedrooms < filters.bedrooms) {
          return false;
        }
      }

      // Bathrooms filter - single selection (null means no filter)
      if (filters.bathrooms !== null) {
        const propertyBathrooms = property.bathrooms || 0;
        if (propertyBathrooms < filters.bathrooms) {
          return false;
        }
      }

      // Contract length filter
      if (filters.minContract && filters.minContract !== "") {
        const minContract = parseInt(filters.minContract);
        if (!isNaN(minContract)) {
          if (!property.contract || property.contract > minContract) {
            return false;
          }
        }
      }

      return true;
    });
  };

  // Apply filters whenever filters change
  useEffect(() => {
    const filtered = applyFilters(allProperties, filters);
    console.log(
      `Filtered ${filtered.length} properties from ${allProperties.length} total`,
    );
    console.log("Current filters:", filters);
    setFilteredProperties(filtered);
  }, [allProperties, filters]);

  // Fetch properties from Firebase using v9+ API
  useEffect(() => {
    const fetchProperties = async (): Promise<void> => {
      try {
        setLoading(true);
        const db = getFirestore();
        const propertiesCollection = collection(db, "properties");
        const snapshot = await getDocs(propertiesCollection);

        const fetchedProperties: Property[] = [];

        snapshot.forEach(
          (doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
            const data = doc.data();

            if (data) {
              // Extract coordinates from GeoPoint data
              const coordinates = data["coordinates"];
              const latitude = coordinates?._latitude || coordinates?.latitude;
              const longitude =
                coordinates?._longitude || coordinates?.longitude;

              const property: Property = {
                id: doc.id,
                title: data["title"] || "Untitled Property",
                latitude: latitude,
                longitude: longitude,
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

        setAllProperties(fetchedProperties);
        console.log(
          `Loaded ${fetchedProperties.length} properties from Firebase`,
        );
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // Handle marker press
  const handleMarkerPress = (event: any): void => {
    const feature = event.features[0];
    const propertyId = feature.properties.id;
    const property = filteredProperties.find((p) => p.id === propertyId);

    if (property) {
      setSelectedProperty(property);
      setIsVisible(true);
    }
  };

  // Close the floating tile
  const closePropertyTile = (): void => {
    setIsVisible(false);
    setTimeout(() => {
      setSelectedProperty(null);
    }, 300);
  };

  // Close the floating tile when the route is unfocused
  useFocusEffect(
    useCallback(() => {
      return () => {
        closePropertyTile();
      };
    }, []),
  );

  // Count active filters
  const activeFilterCount: number = useMemo(
    () =>
      (filters.type.length > 0 ? 1 : 0) +
      (filters.minPrice !== "" || filters.maxPrice !== "" ? 1 : 0) +
      (filters.bedrooms !== null ? 1 : 0) +
      (filters.bathrooms !== null ? 1 : 0) +
      (filters.minContract !== "" ? 1 : 0),
    [filters],
  );

  // Check if any filters are active
  const hasActiveFilters: boolean = activeFilterCount > 0;

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Logo */}
      <HeaderLogo />

      {/* Segmented & Filter Section */}
      <View style={styles.segmentedContainer}>
        <View style={{ flex: 1 }}>
          <Segmented
            options={[TabMode.Flatmates, TabMode.Properties]}
            onChange={(val) => setMode(val as TabMode)}
          />
        </View>

        {mode === TabMode.Properties && (
          <TouchableOpacity
            onPress={() => router.push("/filter")}
            activeOpacity={0.8}
            style={[
              styles.filterBtn,
              hasActiveFilters && styles.filterBtnActive,
            ]}
          >
            <Text
              style={[
                styles.filterBtnText,
                hasActiveFilters && styles.filterBtnTextActive,
              ]}
            >
              Filter {activeFilterCount > 0 ? `(${activeFilterCount})` : ""}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Main content */}
      <View style={{ flex: 1 }}>
        {mode === TabMode.Flatmates ? (
          <View style={styles.centerContent}>
            <Text>Flatmate list</Text>
          </View>
        ) : (
          <PropertiesContent
            loading={loading}
            allProperties={allProperties}
            filteredProperties={filteredProperties}
            selectedProperty={selectedProperty}
            isVisible={isVisible}
            onMarkerPress={handleMarkerPress}
            onClosePropertyTile={closePropertyTile}
          />
        )}
      </View>
    </View>
  );
}
