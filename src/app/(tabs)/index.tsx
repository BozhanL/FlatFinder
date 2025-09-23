import HeaderLogo from "@/components/HeaderLogo";
import PropertiesContent from "@/components/property/PropertiesContent";
import Segmented from "@/components/Segmented";
import { FilterState, Property } from "@/types/FilterState";
import { applyPropertyFilters, countActiveFilters, hasActiveFilters } from "@/utils/propertyFilters";
import { OnPressEvent } from "@maplibre/maplibre-react-native";
import { getAuth } from "@react-native-firebase/auth";
import {
  collection,
  FirebaseFirestoreTypes,
  getFirestore,
  onSnapshot,
} from "@react-native-firebase/firestore";
import { router, useFocusEffect } from "expo-router";
import React, { JSX, useCallback, useEffect, useMemo, useState } from "react";
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

export default function Index(): JSX.Element {
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

  // Apply filters whenever filters change
  useEffect(() => {
    const filtered = applyPropertyFilters(allProperties, filters);
    console.log(
      `Filtered ${filtered.length} properties from ${allProperties.length} total`,
    );
    console.log("Current filters:", filters);
    setFilteredProperties(filtered);
  }, [allProperties, filters]);

  const uid = getAuth().currentUser?.uid;

  // Fetch properties from Firebase using v9+ API
  useEffect(() => {
    if (!uid) {
      return;
    }

    const db = getFirestore();
    const propertiesCollection = collection(db, "properties");

    const unsubscribe = onSnapshot(
      propertiesCollection,
      (snapshot) => {
        setLoading(true);

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

        setAllProperties(fetchedProperties);
        setLoading(false);
        console.log(
          `Loaded ${fetchedProperties.length} properties from Firebase`,
        );
      },
      (error) => {
        console.error("Error with real-time properties listener:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [uid]);

  // Handle marker press
  const handleMarkerPress = (event: OnPressEvent): void => {
    const feature = event.features?.[0];
    if (!feature || !feature.properties) {
      return;
    }

    const propertyId = feature.properties["id"];
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

  // Count active filters using utility function
  const activeFilterCount: number = useMemo(
    () => countActiveFilters(filters),
    [filters],
  );

  // Check if any filters are active using utility function
  const filtersActive: boolean = useMemo(
    () => hasActiveFilters(filters),
    [filters],
  );

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
              filtersActive && styles.filterBtnActive,
            ]}
          >
            <Text
              style={[
                styles.filterBtnText,
                filtersActive && styles.filterBtnTextActive,
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