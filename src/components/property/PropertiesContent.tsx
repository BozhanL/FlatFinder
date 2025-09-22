import { OnPressEvent } from "@maplibre/maplibre-react-native";
import PropertyMapView from "./PropertyMapView";
import StateDisplay from "./StateDisplay";

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

interface PropertiesContentProps {
  loading: boolean;
  allProperties: Property[];
  filteredProperties: Property[];
  selectedProperty: Property | null;
  isVisible: boolean;
  onMarkerPress: (event: OnPressEvent) => void;
  onClosePropertyTile: () => void;
}

export default function PropertiesContent({
  loading,
  allProperties,
  filteredProperties,
  selectedProperty,
  isVisible,
  onMarkerPress,
  onClosePropertyTile,
}: PropertiesContentProps) {
  if (loading) {
    return <StateDisplay type="loading" />;
  }

  if (allProperties.length === 0) {
    return <StateDisplay type="empty" message="No properties found" />;
  }

  if (filteredProperties.length === 0) {
    return (
      <StateDisplay
        type="filtered"
        message="No properties match your filters"
        subtitle="Try adjusting your filter criteria"
      />
    );
  }

  return (
    <PropertyMapView
      properties={filteredProperties}
      selectedProperty={selectedProperty}
      isVisible={isVisible}
      onMarkerPress={onMarkerPress}
      onClosePropertyTile={onClosePropertyTile}
    />
  );
}
