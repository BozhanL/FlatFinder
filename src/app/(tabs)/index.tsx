import HeaderLogo from "@/components/HeaderLogo";
import Segmented from "@/components/Segmented";
import {
  Camera,
  Images,
  MapView,
  RasterLayer,
  RasterSource,
  ShapeSource,
  SymbolLayer,
} from "@maplibre/maplibre-react-native";
import {
  collection,
  FirebaseFirestoreTypes,
  getDocs,
  getFirestore,
} from "@react-native-firebase/firestore";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Ignores warning from maplibre as this warning is not code based
// but rather from OSM api limitations.
// https://github.com/rnmapbox/maps/issues/943#issuecomment-759220852
// The link above is for mapbox but applies to maplibre too
if (__DEV__) {
  const originalLog = console.log;
  const originalWarn = console.warn;

  console.log = (...args) => {
    const message = args.join(" ");
    if (message.includes("Request failed due to a permanent error")) {
      return;
    }
    originalLog.apply(console, args);
  };

  console.warn = (...args) => {
    const message = args.join(" ");
    if (message.includes("Request failed due to a permanent error")) {
      return;
    }
    originalWarn.apply(console, args);
  };
}

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
  map: { flex: 1 },
  centerContent: { flex: 1, alignItems: "center", justifyContent: "center" },
  floatingTile: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  tileContent: {
    padding: 16,
  },
  tileHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  tileTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  tilePrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563eb",
    marginBottom: 2,
  },
  tileType: {
    fontSize: 12,
    color: "#666",
    textTransform: "capitalize",
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 16,
    color: "#666",
  },
  expandButton: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  expandButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
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

  // Format price for display
  const formatPrice = (price: number, type?: string): string => {
    if (type === "sale") {
      return `$${price.toLocaleString()}`;
    } else {
      return `$${price}/week`;
    }
  };

  // Create GeoJSON for filtered properties
  const createPropertyData = () => ({
    type: "FeatureCollection" as const,
    features: filteredProperties.map((property) => ({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [property.longitude, property.latitude],
      },
      properties: {
        id: property.id,
        title: property.title,
        type: property.type || "rental",
        price: property.price,
      },
    })),
  });

  // Check if any filters are active
  const hasActiveFilters = (): boolean => {
    return (
      filters.type.length > 0 ||
      filters.minPrice !== "" ||
      filters.maxPrice !== "" ||
      filters.bedrooms !== null ||
      filters.bathrooms !== null ||
      filters.minContract !== ""
    );
  };

  // Count active filters
  const getActiveFilterCount = (): number => {
    let count = 0;
    if (filters.type.length > 0) count++;
    if (filters.minPrice !== "" || filters.maxPrice !== "") count++;
    if (filters.bedrooms !== null) count++;
    if (filters.bathrooms !== null) count++;
    if (filters.minContract !== "") count++;
    return count;
  };

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

        <TouchableOpacity
          onPress={() => router.push("/(modals)/filter")}
          activeOpacity={0.8}
          style={[
            styles.filterBtn,
            hasActiveFilters() && styles.filterBtnActive,
          ]}
        >
          <Text
            style={[
              styles.filterBtnText,
              hasActiveFilters() && styles.filterBtnTextActive,
            ]}
          >
            Filter{" "}
            {getActiveFilterCount() > 0 ? `(${getActiveFilterCount()})` : ""}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main content */}
      <View style={{ flex: 1 }}>
        {mode === TabMode.Flatmates ? (
          <View style={styles.centerContent}>
            <Text>Flatmate list</Text>
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            {loading ? (
              <View style={styles.centerContent}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={{ marginTop: 10 }}>Loading properties...</Text>
              </View>
            ) : allProperties.length === 0 ? (
              <View style={styles.centerContent}>
                <Text>No properties found</Text>
              </View>
            ) : filteredProperties.length === 0 ? (
              <View style={styles.centerContent}>
                <Text>No properties match your filters</Text>
                <Text style={{ marginTop: 8, color: "#666" }}>
                  Try adjusting your filter criteria
                </Text>
              </View>
            ) : (
              <MapView
                style={styles.map}
                testID="map-view"
                onDidFinishLoadingMap={() =>
                  console.log("Map finished loading")
                }
              >
                {/* RasterSource for OSM tiles */}
                <RasterSource
                  id="osm"
                  tileUrlTemplates={[
                    "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
                  ]}
                  tileSize={256}
                >
                  <RasterLayer id="osm-layer" sourceID="osm" />
                </RasterSource>

                {/* Camera to set initial view */}
                <Camera
                  zoomLevel={10}
                  centerCoordinate={[174.7633, -36.8485]}
                  animationDuration={2000}
                />

                {/* Images for markers */}
                <Images
                  images={{
                    pin: require("../../../assets/images/pin.png"),
                  }}
                />

                {/* Property markers */}
                <ShapeSource
                  id="property-markers"
                  shape={createPropertyData()}
                  onPress={handleMarkerPress}
                >
                  <SymbolLayer
                    id="property-icons"
                    style={{
                      iconImage: "pin",
                      iconSize: 0.2,
                      iconAnchor: "bottom",
                      iconAllowOverlap: true,
                      iconIgnorePlacement: true,
                    }}
                  />
                </ShapeSource>
              </MapView>
            )}

            {/* Floating Property Tile */}
            {selectedProperty && (
              <View
                style={[
                  styles.floatingTile,
                  {
                    opacity: isVisible ? 1 : 0,
                    transform: [{ translateY: isVisible ? 0 : 200 }],
                  },
                ]}
              >
                <View style={styles.tileContent}>
                  <View style={styles.tileHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.tileTitle}>
                        {selectedProperty.title}
                      </Text>
                      <Text style={styles.tilePrice}>
                        {formatPrice(
                          selectedProperty.price,
                          selectedProperty.type,
                        )}
                      </Text>
                      <Text style={styles.tileType}>
                        {selectedProperty.type || "rental"}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={closePropertyTile}
                      style={styles.closeButton}
                    >
                      <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.expandButton}
                    onPress={() => {
                      router.push(`/(modals)/${selectedProperty.id}` as any);
                    }}
                  >
                    <Text style={styles.expandButtonText}>View Details →</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}
