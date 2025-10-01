import useProperties from "@/hooks/useProperties";
import type { FilterState } from "@/types/FilterState";
import type { Property } from "@/types/Prop";
import { applyPropertyFilters } from "@/utils/propertyFilters";
import {
  Camera,
  Images,
  Logger,
  MapView,
  type OnPressEvent,
  RasterLayer,
  RasterSource,
  ShapeSource,
  SymbolLayer,
} from "@maplibre/maplibre-react-native";
import { router } from "expo-router";
import { useEffect, useMemo } from "react";
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
Logger.setLogCallback((log) => {
  const { message } = log;

  if (
    /Request failed due to a permanent error: Canceled/.exec(message) ||
    /Request failed due to a permanent error: Socket Closed/.exec(message)
  ) {
    return true;
  }

  return false;
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#e74c3c",
    textAlign: "center",
    fontSize: 16,
  },
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

type PropertyMapViewProps = {
  filters: FilterState;
  selectedProperty: Property | null;
  isVisible: boolean;
  onMarkerPress: (event: OnPressEvent) => void;
  onClosePropertyTile: () => void;
  onPropertiesLoad?: (
    allProperties: Property[],
    filteredProperties: Property[],
  ) => void;
};

export default function PropertyMapView({
  filters,
  selectedProperty,
  isVisible,
  onMarkerPress,
  onClosePropertyTile,
  onPropertiesLoad,
}: PropertyMapViewProps) {
  const { properties: allProperties, loading, error } = useProperties();

  // Apply filters to properties
  const filteredProperties = useMemo(
    () => applyPropertyFilters(allProperties, filters),
    [allProperties, filters],
  );

  // Notify parent component when properties are loaded/filtered
  useEffect(() => {
    if (onPropertiesLoad && !loading) {
      onPropertiesLoad(allProperties, filteredProperties);
    }
  }, [allProperties, filteredProperties, loading, onPropertiesLoad]);

  // Create GeoJSON for filtered properties with memoization
  const createPropertyData: GeoJSON.FeatureCollection = useMemo(
    () => ({
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
    }),
    [filteredProperties],
  );

  // Format price for display
  const formatPrice = (price: number, type?: string): string => {
    if (type === "sale") {
      return `$${price.toLocaleString()}`;
    } else {
      return `$${price}/week`;
    }
  };

  // Show error state
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading properties: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        testID="map-view"
        onDidFinishLoadingMap={() => {
          console.log("Map finished loading");
        }}
      >
        {/* RasterSource for OSM tiles */}
        <RasterSource
          id="osm"
          tileUrlTemplates={["https://tile.openstreetmap.org/{z}/{x}/{y}.png"]}
          tileSize={256}
        >
          <RasterLayer id="osm-layer" sourceID="osm" />
        </RasterSource>

        {/* Camera to set initial view */}
        <Camera
          defaultSettings={{
            zoomLevel: 10,
            centerCoordinate: [174.7633, -36.8485],
          }}
        />

        {/* Images for markers */}
        <Images
          images={{
            pin: require("assets/images/pin.png"),
          }}
        />

        {/* Property markers - only show if data is loaded */}
        {!loading && (
          <ShapeSource
            id="property-markers"
            shape={createPropertyData}
            onPress={onMarkerPress}
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
        )}
      </MapView>

      {/* Loading overlay */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={{ marginTop: 10, color: "#666" }}>
            Loading properties...
          </Text>
        </View>
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
                <Text style={styles.tileTitle}>{selectedProperty.title}</Text>
                <Text style={styles.tilePrice}>
                  {formatPrice(selectedProperty.price, selectedProperty.type)}
                </Text>
                <Text style={styles.tileType}>
                  {selectedProperty.type || "rental"}
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClosePropertyTile}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.expandButton}
              onPress={() => {
                router.push({
                  pathname: "/property",
                  params: { id: selectedProperty.id },
                });
              }}
            >
              <Text style={styles.expandButtonText}>View Details →</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
