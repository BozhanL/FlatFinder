import useProperties from "@/hooks/useProperties";
import { styles } from "@/styles/map-style";
import type { FilterState } from "@/types/FilterState";
import type { Property } from "@/types/Property";
import { applyPropertyFilters } from "@/utils/propertyFilters";
import {
  Camera,
  Images,
  Logger,
  MapView,
  RasterLayer,
  RasterSource,
  ShapeSource,
  SymbolLayer,
  type OnPressEvent,
} from "@maplibre/maplibre-react-native";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, type JSX } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

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
}: PropertyMapViewProps): JSX.Element {
  const { properties: allProperties, loading, error } = useProperties();

  const filteredProperties = useMemo(
    () => applyPropertyFilters(allProperties, filters),
    [allProperties, filters],
  );

  useEffect(() => {
    if (onPropertiesLoad && !loading) {
      onPropertiesLoad(allProperties, filteredProperties);
    }
  }, [allProperties, filteredProperties, loading, onPropertiesLoad]);

  const rentalProperties = useMemo(
    () => filteredProperties.filter((p) => p.type !== "sale"),
    [filteredProperties],
  );

  const saleProperties = useMemo(
    () => filteredProperties.filter((p) => p.type === "sale"),
    [filteredProperties],
  );

  const formatPrice = (price: number, type?: string): string => {
    if (type === "sale") {
      return `$${price.toLocaleString()}`;
    } else {
      return `$${price}/wk`;
    }
  };

  const createPropertyData = useCallback(
    (properties: Property[]): GeoJSON.FeatureCollection => ({
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
          priceLabel: formatPrice(property.price, property.type),
        },
      })),
    }),
    [],
  );

  const rentalData = useMemo(
    () => createPropertyData(rentalProperties),
    [rentalProperties, createPropertyData],
  );

  const saleData = useMemo(
    () => createPropertyData(saleProperties),
    [saleProperties, createPropertyData],
  );

  const handlePostProperty = (): void => {
    router.push("/post-property");
  };

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
        <RasterSource
          id="osm"
          tileUrlTemplates={["https://tile.openstreetmap.org/{z}/{x}/{y}.png"]}
          tileSize={256}
        >
          <RasterLayer id="osm-layer" sourceID="osm" />
        </RasterSource>

        <Camera
          defaultSettings={{
            zoomLevel: 10,
            centerCoordinate: [174.7633, -36.8485],
          }}
          maxBounds={{
            ne: [179.0, -34.0],
            sw: [166.0, -47.5],
          }}
          minZoomLevel={5}
          maxZoomLevel={18}
        />

        <Images
          images={{
            "rental-marker": require("assets/images/rental-marker.png"),
            "rental-marker-selected": require("assets/images/rental-marker-selected.png"),
            "sale-marker": require("assets/images/sale-marker.png"),
            "sale-marker-selected": require("assets/images/sale-marker-selected.png"),
          }}
        />

        {!loading && (
          <>
            <ShapeSource
              id="rental-markers"
              shape={rentalData}
              onPress={onMarkerPress}
            >
              <SymbolLayer
                id="rental-icons"
                style={{
                  iconImage: [
                    "case",
                    ["==", ["get", "id"], selectedProperty?.id ?? ""],
                    "rental-marker-selected",
                    "rental-marker",
                  ],
                  iconSize: 0.1,
                  iconAnchor: "bottom",
                  iconAllowOverlap: true,
                  iconIgnorePlacement: true,
                }}
              />
              <SymbolLayer
                id="rental-price-labels"
                style={{
                  textField: ["get", "priceLabel"],
                  textSize: 10,
                  textColor: "#FFFFFF",
                  textHaloColor: "#000000",
                  textHaloWidth: 1.5,
                  textAnchor: "center",
                  textOffset: [0, -2],
                  textAllowOverlap: true,
                  textIgnorePlacement: true,
                }}
              />
            </ShapeSource>

            <ShapeSource
              id="sale-markers"
              shape={saleData}
              onPress={onMarkerPress}
            >
              <SymbolLayer
                id="sale-icons"
                style={{
                  iconImage: [
                    "case",
                    ["==", ["get", "id"], selectedProperty?.id ?? ""],
                    "sale-marker-selected",
                    "sale-marker",
                  ],
                  iconSize: 0.1,
                  iconAnchor: "bottom",
                  iconAllowOverlap: true,
                  iconIgnorePlacement: true,
                }}
              />
            </ShapeSource>
          </>
        )}
      </MapView>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={{ marginTop: 10, color: "#666" }}>
            Loading properties...
          </Text>
        </View>
      )}

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

      <TouchableOpacity
        style={[
          styles.postButton,
          {
            bottom: selectedProperty && isVisible ? 200 : 20,
          },
        ]}
        onPress={handlePostProperty}
        activeOpacity={0.8}
        testID="post-property-button"
      >
        <Text style={styles.postButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}
