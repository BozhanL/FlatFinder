import HeaderLogo from "@/components/HeaderLogo";
import PropertyMapView from "@/components/property/PropertyMapView";
import Segmented from "@/components/Segmented";
import SwipeDeck from "@/components/swipe/SwipeDeck";
import { useCandidates } from "@/hooks/useCandidates";
import { ensureMatchIfMutualLike, swipe } from "@/services/swipe";
import { FilterState } from "@/types/FilterState";
import { Property } from "@/types/Prop";
import {
  getGlobalFilters,
  registerApplyFilter,
  unregisterApplyFilter,
} from "@/utils/filterStateManager";
import { countActiveFilters } from "@/utils/propertyFilters";
import { OnPressEvent } from "@maplibre/maplibre-react-native";
import { getAuth, onAuthStateChanged } from "@react-native-firebase/auth";
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

export default function Index(): JSX.Element {
  const [uid, setUid] = useState<string | null>(null);
  const [mode, setMode] = useState(TabMode.Flatmates);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  const [isVisible, setIsVisible] = useState(false);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [filters, setFilters] = useState<FilterState>(getGlobalFilters());

  // Register filter handler
  useEffect(() => {
    const handleFiltersChange = (newFilters: FilterState): void => {
      console.log("Applying filters in index:", newFilters);
      setFilters(newFilters);
    };

    registerApplyFilter(handleFiltersChange);

    return (): void => {
      unregisterApplyFilter();
    };
  }, []);

  // Handle properties loaded from PropertyMapView
  const handlePropertiesLoad = useCallback(
    (_allProps: Property[], filteredProps: Property[]) => {
      setFilteredProperties(filteredProps);
    },
    []
  );

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
    }, [])
  );

  // Count active filters using utility function
  const activeFilterCount: number = useMemo(
    () => countActiveFilters(filters),
    [filters]
  );

  // Check if any filters are active using utility function
  const filtersActive: boolean = activeFilterCount > 0;

  //Check Authentication State
  useEffect(() => {
    const unsub = onAuthStateChanged(getAuth(), (user) => {
      setUid(user?.uid ?? null);
    });
    return unsub;
  }, []);

  const { items, setItems } = useCandidates(uid);

  if (!uid) return <></>;

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

        {/* Show filter button on both tabs */}
        <TouchableOpacity
          onPress={() => router.push("/filter")}
          activeOpacity={0.8}
          style={[styles.filterBtn, filtersActive && styles.filterBtnActive]}
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
      </View>

      {/* Main content */}
      <View style={{ flex: 1, position: "relative" }}>
        {mode === TabMode.Flatmates ? (
          <SwipeDeck
            data={items}
            onLike={async (u) => {
              // IMPROVE: Use enum instead of string @G2CCC
              await swipe(uid, u.id, "like");
              await ensureMatchIfMutualLike(uid, u.id);
              setItems((prev) => prev.filter((x) => x.id !== u.id));
            }}
            onPass={async (u) => {
              await swipe(uid, u.id, "pass");
              setItems((prev) => prev.filter((x) => x.id !== u.id));
            }}
            onCardPress={(user) => {
              router.push(`/profile/${user.id}`);
            }}
          />
        ) : (
          <PropertyMapView
            filters={filters}
            selectedProperty={selectedProperty}
            isVisible={isVisible}
            onMarkerPress={handleMarkerPress}
            onClosePropertyTile={closePropertyTile}
            onPropertiesLoad={handlePropertiesLoad}
          />
        )}
      </View>
    </View>
  );
}
