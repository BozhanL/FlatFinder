import PropertyMapView from "@/components/property/PropertyMapView";
import { FilterState } from "@/types/FilterState";
import { OnPressEvent } from "@maplibre/maplibre-react-native";

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
  filters: FilterState;
  selectedProperty: Property | null;
  isVisible: boolean;
  onMarkerPress: (event: OnPressEvent) => void;
  onClosePropertyTile: () => void;
  onPropertiesLoad?: (allProps: Property[], filteredProps: Property[]) => void;
  // Legacy props for backward compatibility
  loading?: boolean;
  allProperties?: Property[];
  filteredProperties?: Property[];
}

export default function PropertiesContent({
  filters,
  selectedProperty,
  isVisible,
  onMarkerPress,
  onClosePropertyTile,
  onPropertiesLoad,
}: PropertiesContentProps) {
  // Create props object conditionally including onPropertiesLoad
  const mapViewProps = {
    filters,
    selectedProperty,
    isVisible,
    onMarkerPress,
    onClosePropertyTile,
    ...(onPropertiesLoad && { onPropertiesLoad }),
  };

  return <PropertyMapView {...mapViewProps} />;
}
