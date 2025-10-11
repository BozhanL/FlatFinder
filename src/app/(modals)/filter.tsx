import { styles } from "@/styles/filter-style";
import type { FilterState } from "@/types/FilterState";
import {
  applyGlobalFilters,
  getGlobalFilters,
} from "@/utils/filterStateManager";
import { countActiveFilters } from "@/utils/propertyFilters";
import { Stack, router } from "expo-router";
import { type JSX, useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function FilterScreen(): JSX.Element {
  const [filters, setFilters] = useState<FilterState>(getGlobalFilters());

  const propertyTypes = ["rental", "sale"];
  const bedroomOptions = [1, 2, 3, 4, 5];
  const bathroomOptions = [1, 2, 3, 4];

  const toggleFilter = (
    category: keyof FilterState,
    value: string | number,
  ): void => {
    setFilters((prev) => {
      switch (category) {
        case "bedrooms":
        case "bathrooms":
          // Single selection for bedrooms and bathrooms
          const isSelected = prev[category] === value;
          return { ...prev, [category]: isSelected ? null : (value as number) };
        case "type":
          // Multi-selection for property type
          const current = prev.type;
          const newArray = current.includes(value as string)
            ? current.filter((item) => item !== value)
            : [...current, value as string];
          return { ...prev, type: newArray };
        default:
          return prev;
      }
    });
  };

  const updatePriceFilter = (
    type: "minPrice" | "maxPrice",
    value: string,
  ): void => {
    setFilters((prev) => ({ ...prev, [type]: value }));
  };

  const updateContractFilter = (value: string): void => {
    setFilters((prev) => ({ ...prev, minContract: value }));
  };

  const clearFilters = (): void => {
    const clearedFilters: FilterState = {
      type: [],
      minPrice: "",
      maxPrice: "",
      bedrooms: null,
      bathrooms: null,
      minContract: "",
    };
    setFilters(clearedFilters);
  };

  const applyFilters = (): void => {
    console.log("Applying filters:", filters);
    applyGlobalFilters(filters);
    router.back();
  };

  const activeFilterCount = countActiveFilters(filters);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Filter Properties",
          presentation: "modal",
        }}
      />

      <View style={styles.container}>
        <ScrollView style={styles.content}>
          {/* Property Type Filter */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Property Type</Text>
            <View style={styles.filterRow}>
              {propertyTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.filterChip,
                    filters.type.includes(type) && styles.filterChipActive,
                  ]}
                  onPress={() => {
                    toggleFilter("type", type);
                  }}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      filters.type.includes(type) &&
                        styles.filterChipTextActive,
                    ]}
                  >
                    {type === "rental" ? "For Rent" : "For Sale"}
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
                value={filters.minPrice}
                onChangeText={(value) => {
                  updatePriceFilter("minPrice", value);
                }}
                keyboardType="numeric"
              />
              <Text style={styles.priceLabel}>to</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="Max price"
                value={filters.maxPrice}
                onChangeText={(value) => {
                  updatePriceFilter("maxPrice", value);
                }}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Bedrooms Filter */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bedrooms (select one)</Text>
            <View style={styles.filterRow}>
              {bedroomOptions.map((bedrooms) => (
                <TouchableOpacity
                  key={bedrooms}
                  style={[
                    styles.filterChip,
                    filters.bedrooms === bedrooms && styles.filterChipActive,
                  ]}
                  onPress={() => {
                    toggleFilter("bedrooms", bedrooms);
                  }}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      filters.bedrooms === bedrooms &&
                        styles.filterChipTextActive,
                    ]}
                  >
                    {bedrooms}+ bed{bedrooms > 1 ? "s" : ""}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Bathrooms Filter */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bathrooms (select one)</Text>
            <View style={styles.filterRow}>
              {bathroomOptions.map((bathrooms) => (
                <TouchableOpacity
                  key={bathrooms}
                  style={[
                    styles.filterChip,
                    filters.bathrooms === bathrooms && styles.filterChipActive,
                  ]}
                  onPress={() => {
                    toggleFilter("bathrooms", bathrooms);
                  }}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      filters.bathrooms === bathrooms &&
                        styles.filterChipTextActive,
                    ]}
                  >
                    {bathrooms}+ bath{bathrooms > 1 ? "s" : ""}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Minimum Contract Length Filter */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Minimum Contract Length (Weeks)
            </Text>
            <TextInput
              style={styles.priceInput}
              placeholder="Enter weeks (e.g. 1 for 1 week)"
              value={filters.minContract}
              onChangeText={updateContractFilter}
              keyboardType="numeric"
            />
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
              Apply Filters
              {activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}
