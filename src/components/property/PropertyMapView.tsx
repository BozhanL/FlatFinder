import {
  Camera,
  Images,
  Logger,
  MapView,
  OnPressEvent,
  RasterLayer,
  RasterSource,
  ShapeSource,
  SymbolLayer,
} from "@maplibre/maplibre-react-native";
import { router } from "expo-router";
import { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Ignores warning from maplibre as this warning is not code based
// but rather from OSM api limitations.
// https://github.com/rnmapbox/maps/issues/943#issuecomment-759220852
// The link above is for mapbox but applies to maplibre too
Logger.setLogCallback((log) => {
  const { message } = log;

  if (
    message.match("Request failed due to a permanent error: Canceled") ||
    message.match("Request failed due to a permanent error: Socket Closed")
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

interface PropertyMapViewProps {
  properties: Property[];
  selectedProperty: Property | null;
  isVisible: boolean;
  onMarkerPress: (event: OnPressEvent) => void;
  onClosePropertyTile: () => void;
}

export default function PropertyMapView({
  properties,
  selectedProperty,
  isVisible,
  onMarkerPress,
  onClosePropertyTile,
}: PropertyMapViewProps) {
  // Create GeoJSON for filtered properties with memoization
  const createPropertyData: GeoJSON.FeatureCollection = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: properties.map((property) => ({
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
    [properties],
  );

  // Format price for display
  const formatPrice = (price: number, type?: string): string => {
    if (type === "sale") {
      return `$${price.toLocaleString()}`;
    } else {
      return `$${price}/week`;
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        testID="map-view"
        onDidFinishLoadingMap={() => console.log("Map finished loading")}
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

        {/* Property markers */}
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
      </MapView>

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
