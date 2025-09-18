import { Stack, router } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { getGlobalApplyFilter } from "../(tabs)/index";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  filterChipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  priceLabel: {
    fontSize: 16,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#f5f5f5',
  },
  applyButton: {
    backgroundColor: '#2563eb',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  clearButtonText: {
    color: '#666',
  },
  applyButtonText: {
    color: '#fff',
  },
});

interface FilterState {
  type: string[];
  minPrice: string;
  maxPrice: string;
  bedrooms: number[];
  bathrooms: number[];
}

// Local state interface for single selection
interface LocalFilterState {
  type: string[];
  minPrice: string;
  maxPrice: string;
  bedrooms: number | null;
  bathrooms: number | null;
}

export default function FilterScreen() {
  const [localFilters, setLocalFilters] = useState<LocalFilterState>({
    type: [],
    minPrice: '',
    maxPrice: '',
    bedrooms: null,
    bathrooms: null,
  });

  const propertyTypes = ['rental', 'sale'];
  const bedroomOptions = [1, 2, 3, 4, 5];
  const bathroomOptions = [1, 2, 3, 4];

  const toggleFilter = (category: keyof LocalFilterState, value: string | number) => {
    setLocalFilters(prev => {
      // For property type (multi-select)
      if (category === 'type') {
        const current = prev[category] as string[];
        const newArray = current.includes(value as string) 
          ? current.filter(item => item !== value)
          : [...current, value as string];
        return { ...prev, [category]: newArray };
      }
      // For bedrooms and bathrooms (single-select)
      else if (category === 'bedrooms' || category === 'bathrooms') {
        const current = prev[category] as number | null;
        // If clicking the same value again, clear the selection
        if (current === value) {
          return { ...prev, [category]: null };
        }
        // Otherwise set the new value
        return { ...prev, [category]: value as number };
      }
      return prev;
    });
  };

  const updatePriceFilter = (type: 'minPrice' | 'maxPrice', value: string) => {
    setLocalFilters(prev => ({ ...prev, [type]: value }));
  };

  // Convert local single selection state to the expected array format
  const convertToFilterState = (local: LocalFilterState): FilterState => {
    return {
      type: local.type,
      minPrice: local.minPrice,
      maxPrice: local.maxPrice,
      bedrooms: local.bedrooms !== null ? [local.bedrooms] : [],
      bathrooms: local.bathrooms !== null ? [local.bathrooms] : [],
    };
  };

  const clearFilters = () => {
    const clearedFilters = {
      type: [],
      minPrice: '',
      maxPrice: '',
      bedrooms: null,
      bathrooms: null,
    };
    setLocalFilters(clearedFilters);
    
    // Apply cleared filters immediately
    const applyFilter = getGlobalApplyFilter();
    if (applyFilter) {
      applyFilter(convertToFilterState(clearedFilters));
    }
  };

  const applyFilters = () => {
    const applyFilter = getGlobalApplyFilter();
    if (!applyFilter) {
      console.error('No filter function available');
      router.back();
      return;
    }

    console.log('Applying filters:', localFilters);
    applyFilter(convertToFilterState(localFilters));
    router.back();
  };

  const hasActiveFilters = () => {
    return localFilters.type.length > 0 || 
           localFilters.bedrooms !== null || 
           localFilters.bathrooms !== null ||
           localFilters.minPrice !== '' || 
           localFilters.maxPrice !== '';
  };

  return (
    <>
      <Stack.Screen
        options={{ 
          headerShown: true, 
          title: "Filter Properties", 
          presentation: "modal" 
        }}
      />
      
      <View style={styles.container}>
        <ScrollView style={styles.content}>
          {/* Property Type Filter */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Property Type</Text>
            <View style={styles.filterRow}>
              {propertyTypes.map(type => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.filterChip,
                    localFilters.type.includes(type) && styles.filterChipActive
                  ]}
                  onPress={() => toggleFilter('type', type)}
                >
                  <Text style={[
                    styles.filterChipText,
                    localFilters.type.includes(type) && styles.filterChipTextActive
                  ]}>
                    {type === 'rental' ? 'For Rent' : 'For Sale'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Price Range Filter */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Price Range</Text>
            <View style={styles.priceInputContainer}>
              <TextInput
                style={styles.priceInput}
                placeholder="Min price"
                value={localFilters.minPrice}
                onChangeText={(value) => updatePriceFilter('minPrice', value)}
                keyboardType="numeric"
              />
              <Text style={styles.priceLabel}>to</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="Max price"
                value={localFilters.maxPrice}
                onChangeText={(value) => updatePriceFilter('maxPrice', value)}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Bedrooms Filter */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bedrooms</Text>
            <View style={styles.filterRow}>
              {bedroomOptions.map(bedrooms => (
                <TouchableOpacity
                  key={bedrooms}
                  style={[
                    styles.filterChip,
                    localFilters.bedrooms === bedrooms && styles.filterChipActive
                  ]}
                  onPress={() => toggleFilter('bedrooms', bedrooms)}
                >
                  <Text style={[
                    styles.filterChipText,
                    localFilters.bedrooms === bedrooms && styles.filterChipTextActive
                  ]}>
                    {bedrooms}+ bed{bedrooms > 1 ? 's' : ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Bathrooms Filter */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bathrooms</Text>
            <View style={styles.filterRow}>
              {bathroomOptions.map(bathrooms => (
                <TouchableOpacity
                  key={bathrooms}
                  style={[
                    styles.filterChip,
                    localFilters.bathrooms === bathrooms && styles.filterChipActive
                  ]}
                  onPress={() => toggleFilter('bathrooms', bathrooms)}
                >
                  <Text style={[
                    styles.filterChipText,
                    localFilters.bathrooms === bathrooms && styles.filterChipTextActive
                  ]}>
                    {bathrooms}+ bath{bathrooms > 1 ? 's' : ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.clearButton]}
            onPress={clearFilters}
          >
            <Text style={[styles.buttonText, styles.clearButtonText]}>
              Clear All
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.applyButton]}
            onPress={applyFilters}
          >
            <Text style={[styles.buttonText, styles.applyButtonText]}>
              Apply Filters{hasActiveFilters() ? ` (${
                localFilters.type.length + 
                (localFilters.bedrooms !== null ? 1 : 0) + 
                (localFilters.bathrooms !== null ? 1 : 0) +
                (localFilters.minPrice ? 1 : 0) + 
                (localFilters.maxPrice ? 1 : 0)
              })` : ''}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}