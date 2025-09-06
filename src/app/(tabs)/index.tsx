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
import { router } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { db } from "../../firebaseconfig";

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

// Sample property data
interface Property {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  type: string;
  price: string;
}



export default function Index() {
  const [mode, setMode] = useState(TabMode.Flatmates);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Sample properties
  const properties: Property[] = [
    {
      id: '1',
      title: 'Auckland Apartment',
      latitude: -36.8485,
      longitude: 174.7633,
      type: 'rental',
      price: '$500/week'
    },
    {
      id: '2', 
      title: 'Ponsonby House',
      latitude: -36.8502,
      longitude: 174.7423,
      type: 'sale',
      price: '$800,000'
    },
    {
      id: '3',
      title: 'Parnell Flat',
      latitude: -36.8572,
      longitude: 174.7796,
      type: 'rental', 
      price: '$650/week'
    }
  ];

  useEffect(() => {
  const fetchProperties = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "properties"));
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log("Property title:", data["title"]);
      });
    } catch (error) {
      console.error("Error fetching properties:", error);
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
        type: property.type,
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
                      <Text style={styles.tilePrice}>{selectedProperty.price}</Text>
                      <Text style={styles.tileType}>{selectedProperty.type}</Text>
                    </View>
                    <TouchableOpacity onPress={closePropertyTile} style={styles.closeButton}>
                      <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.expandButton}
                    onPress={() => {
                      console.log('Navigate to property details:', selectedProperty.id);
                      // this will send a console log but actually need to make it send the user to a page
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