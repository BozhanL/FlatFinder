import useAddressSearch from "@/hooks/useAddressSearch";
import usePropertyForm from "@/hooks/usePostForm";
import { styles } from "@/styles/posting-style";
import type { PlaceSuggestion } from "@/types/PostProperty";
import { Stack } from "expo-router";
import { useEffect, useRef, type JSX } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function PostPropertyPage(): JSX.Element {
  const {
    formData,
    errors,
    isSubmitting,
    isFormValid,
    updateField,
    handleSubmit,
  } = usePropertyForm();

  const {
    suggestions,
    showSuggestions,
    isLoading: isLoadingLocation,
    selectAddress,
    clearSuggestions,
    setShowSuggestions,
  } = useAddressSearch(formData.address);

  const scrollViewRef = useRef<ScrollView>(null);
  const addressInputRef = useRef<TextInput>(null);

  // Handle keyboard events
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      (): void => {
        if (addressInputRef.current?.isFocused()) {
          setTimeout(() => {
            scrollViewRef.current?.scrollTo({
              y: 300,
              animated: true,
            });
          }, 100);
        }
      },
    );

    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      (): void => {
        setShowSuggestions(false);
      },
    );

    return (): void => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, [setShowSuggestions]);

  const handleAddressSelect = (
    lat: string,
    lon: string,
    address: string,
  ): void => {
    updateField("address", address);
    updateField("latitude", lat);
    updateField("longitude", lon);
  };

  const clearLocation = (): void => {
    updateField("address", "");
    updateField("latitude", "");
    updateField("longitude", "");
    clearSuggestions();
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Post Property",
          presentation: "modal",
        }}
      />

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContentContainer}
        >
          {/* Property Title */}
          <Text style={styles.inputLabel}>Property Title *</Text>
          <TextInput
            style={styles.input}
            value={formData.title}
            onChangeText={(value): void => {
              updateField("title", value);
            }}
            placeholder="e.g., Beautiful 2BR Apartment in City Center"
            testID="title-input"
          />
          {errors["title"] && (
            <Text style={styles.errorText}>{errors["title"]}</Text>
          )}

          {/* Property Type */}
          <Text style={styles.inputLabel}>Property Type *</Text>
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                formData.type === "rental" && styles.typeButtonActive,
              ]}
              onPress={(): void => {
                updateField("type", "rental");
              }}
              testID="rental-button"
            >
              <Text
                style={[
                  styles.typeButtonText,
                  formData.type === "rental" && styles.typeButtonTextActive,
                ]}
              >
                Rental
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                formData.type === "sale" && styles.typeButtonActive,
              ]}
              onPress={(): void => {
                updateField("type", "sale");
              }}
              testID="sale-button"
            >
              <Text
                style={[
                  styles.typeButtonText,
                  formData.type === "sale" && styles.typeButtonTextActive,
                ]}
              >
                For Sale
              </Text>
            </TouchableOpacity>
          </View>

          {/* Price */}
          <Text style={styles.inputLabel}>
            Price * {formData.type === "rental" ? "(per week)" : ""}
          </Text>
          <TextInput
            style={styles.input}
            value={formData.price}
            onChangeText={(value): void => {
              updateField("price", value);
            }}
            placeholder={formData.type === "rental" ? "450" : "650000"}
            keyboardType="numeric"
            testID="price-input"
          />
          {errors["price"] && (
            <Text style={styles.errorText}>{errors["price"]}</Text>
          )}

          {/* Property Details Section */}
          <Text
            style={[
              styles.inputLabel,
              { marginTop: 24, fontSize: 18, fontWeight: "600" },
            ]}
          >
            Property Details
          </Text>

          {/* Bedrooms */}
          <Text style={styles.inputLabel}>Bedrooms *</Text>
          <TextInput
            style={styles.input}
            value={formData.bedrooms}
            onChangeText={(value): void => {
              updateField("bedrooms", value);
            }}
            placeholder="e.g., 2"
            keyboardType="numeric"
            testID="bedrooms-input"
          />

          {/* Bathrooms */}
          <Text style={styles.inputLabel}>Bathrooms *</Text>
          <TextInput
            style={styles.input}
            value={formData.bathrooms}
            onChangeText={(value): void => {
              updateField("bathrooms", value);
            }}
            placeholder="e.g., 1"
            keyboardType="numeric"
            testID="bathrooms-input"
          />

          {/* Minimum Contract Length - only show for rentals */}
          {formData.type === "rental" && (
            <>
              <Text style={styles.inputLabel}>
                Minimum Contract Length (weeks) *
              </Text>
              <TextInput
                style={styles.input}
                value={formData.minContractLength}
                onChangeText={(value): void => {
                  updateField("minContractLength", value);
                }}
                placeholder="e.g., 52"
                keyboardType="numeric"
                testID="contract-length-input"
              />
            </>
          )}

          {/* Description */}
          <Text style={styles.inputLabel}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(value): void => {
              updateField("description", value);
            }}
            placeholder="Describe your property, its features, and location..."
            multiline
            testID="description-input"
          />
          {errors["description"] && (
            <Text style={styles.errorText}>{errors["description"]}</Text>
          )}

          {/* Address Search */}
          <Text style={styles.inputLabel}>Address *</Text>
          <View style={styles.addressContainer}>
            <TextInput
              ref={addressInputRef}
              style={styles.input}
              value={formData.address}
              onChangeText={(value): void => {
                updateField("address", value);
              }}
              placeholder="Start typing an address... (e.g., 123 Queen Street, Auckland)"
              testID="address-input"
              onFocus={(): void => {
                setShowSuggestions(suggestions.length > 0);
                setTimeout(() => {
                  scrollViewRef.current?.scrollTo({
                    y: 350,
                    animated: true,
                  });
                }, 300);
              }}
              returnKeyType="search"
            />

            {isLoadingLocation && (
              <Text style={styles.loadingText}>Searching addresses...</Text>
            )}

            {/* Address Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                {suggestions.map((item: PlaceSuggestion) => (
                  <TouchableOpacity
                    key={item.place_id.toString()}
                    style={styles.suggestionItem}
                    onPress={(): void => {
                      selectAddress(item, handleAddressSelect);
                    }}
                  >
                    <Text style={styles.suggestionText} numberOfLines={2}>
                      {item.display_name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Location Display */}
          {formData.latitude && formData.longitude && (
            <View style={styles.locationDisplay}>
              <Text style={styles.locationText}>Selected Location:</Text>
              <Text style={styles.coordinatesText}>
                Latitude: {parseFloat(formData.latitude).toFixed(6)}, Longitude:{" "}
                {parseFloat(formData.longitude).toFixed(6)}
              </Text>
              <TouchableOpacity
                style={styles.clearLocationButton}
                onPress={clearLocation}
              >
                <Text style={styles.clearLocationText}>Clear Location</Text>
              </TouchableOpacity>
            </View>
          )}

          {errors["address"] && (
            <Text style={styles.errorText}>{errors["address"]}</Text>
          )}
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.submitSection}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!isFormValid || isSubmitting) && styles.submitButtonDisabled,
            ]}
            onPress={(): void => {
              void handleSubmit();
            }}
            disabled={!isFormValid || isSubmitting}
            testID="submit-button"
          >
            <Text
              style={[
                styles.submitButtonText,
                (!isFormValid || isSubmitting) &&
                  styles.submitButtonTextDisabled,
              ]}
            >
              {isSubmitting ? "Posting..." : "Post Property"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
