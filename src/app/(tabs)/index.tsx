import HeaderLogo from "@/components/HeaderLogo";
import Segmented from "@/components/Segmented";
import {
  Camera,
  Images,
  MapView,
  RasterLayer,
  RasterSource,
  ShapeSource,
  SymbolLayer
} from "@maplibre/maplibre-react-native";
import firestore, { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
  map: { flex: 1 },
  centerContent: { flex: 1, alignItems: "center", justifyContent: "center" },
  floatingTile: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  tileContent: {
    padding: 16,
  },
  tileHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tileTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  tilePrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
    marginBottom: 2,
  },
  tileType: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
  },
  expandButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  expandButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
}); 

const enum TabMode {
  Flatmates = "Flatmates",
  Properties = "Properties",
}

// Updated Property interface to match Firebase data
interface Property {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  price: number;
  type?: string; // Made optional since it might not be in Firebase
}

export default function Index() {
  const [mode, setMode] = useState(TabMode.Flatmates);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]); // Changed to state
  const [loading, setLoading] = useState(true);

  // Fetch properties from Firestore on mount
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const snapshot = await firestore().collection("properties").get();
        
        const fetchedProperties: Property[] = [];
        
        snapshot.forEach((doc: FirebaseFirestoreTypes.DocumentSnapshot) => {
          const data = doc.data();
          
          if (data) {
            // Extract coordinates from GeoPoint using bracket notation
            const coordinates = data["coordinates"];
            const latitude = coordinates?._latitude || coordinates?.latitude;
            const longitude = coordinates?._longitude || coordinates?.longitude;
            
            // Create property object using bracket notation
            const property: Property = {
              id: doc.id,
              title: data["title"] || 'Untitled Property',
              latitude: latitude,
              longitude: longitude,
              price: data["price"] || 0,
              type: data["type"] || 'rental' // Default to rental if not specified
            };
            
            fetchedProperties.push(property);
            console.log("Fetched property:", property.title, `${property.price}`);
          }
        });
        
        setProperties(fetchedProperties);
        console.log(`Loaded ${fetchedProperties.length} properties from Firebase`);
        
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // Handle marker press
  const handleMarkerPress = (event: any) => {
    const feature = event.features[0];
    const propertyId = feature.properties.id;
    const property = properties.find(p => p.id === propertyId);
    
    if (property) {
      setSelectedProperty(property);
      setIsVisible(true);
    }
  };

  // Close the floating tile
  const closePropertyTile = () => {
    setIsVisible(false);
    setTimeout(() => {
      setSelectedProperty(null);
    }, 300);
  };

  // Format price for display
  const formatPrice = (price: number, type?: string): string => {
    if (type === 'sale') {
      return `$${price.toLocaleString()}`;
    } else {
      return `$${price}/week`;
    }
  };

  // Create GeoJSON for properties
  const createPropertyData = () => ({
    type: 'FeatureCollection' as const,
    features: properties.map((property) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [property.longitude, property.latitude]
      },
      properties: {
        id: property.id,
        title: property.title,
        type: property.type || 'rental',
        price: property.price
      }
    }))
  });

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
          onPress={() => router.push("/(modals)/filter" as any)}
          activeOpacity={0.8}
          style={styles.filterBtn}
        >
          <Text style={{ fontWeight: "600" }}> Filter </Text>
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
            ) : properties.length === 0 ? (
              <View style={styles.centerContent}>
                <Text>No properties found</Text>
              </View>
            ) : (
              <MapView 
                style={styles.map}
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
                  zoomLevel={10}
                  centerCoordinate={[174.7633, -36.8485]}
                  animationDuration={2000}
                />

                {/* Images for markers */}
                <Images
                  images={{ 
                    pin: require("../../../assets/images/pin.png")
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
                      iconImage: 'pin',
                      iconSize: 0.2,
                      iconAnchor: 'bottom',
                      iconAllowOverlap: true,
                      iconIgnorePlacement: true
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
                    transform: [{ translateY: isVisible ? 0 : 200 }]
                  }
                ]}
              >
                <View style={styles.tileContent}>
                  <View style={styles.tileHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.tileTitle}>{selectedProperty.title}</Text>
                      <Text style={styles.tilePrice}>
                        {formatPrice(selectedProperty.price, selectedProperty.type)}
                      </Text>
                      <Text style={styles.tileType}>{selectedProperty.type || 'rental'}</Text>
                    </View>
                    <TouchableOpacity onPress={closePropertyTile} style={styles.closeButton}>
                      <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.expandButton}
                    onPress={() => {
                      // Navigate to property details page
                      router.push(`/property/${selectedProperty.id}` as any);
                      
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