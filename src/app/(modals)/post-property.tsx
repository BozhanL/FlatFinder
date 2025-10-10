import { getAuth } from "@react-native-firebase/auth";
import {
  GeoPoint,
  addDoc,
  collection,
  getFirestore,
} from "@react-native-firebase/firestore";
import { Stack, router } from "expo-router";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 16,
    paddingBottom: 100, // Extra space for keyboard
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  typeSelector: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  typeButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f8f9fa",
    flex: 1,
    alignItems: "center",
  },
  typeButtonActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  typeButtonText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  typeButtonTextActive: {
    color: "#fff",
  },
  addressContainer: {
    position: "relative",
    zIndex: 1000,
    marginBottom: 20, // Fixed spacing
  },
  suggestionsContainer: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: "#ddd",
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    maxHeight: 150, // Reduced height
    zIndex: 1001,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  suggestionText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 18,
  },
  locationDisplay: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  locationText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  coordinatesText: {
    fontSize: 12,
    color: "#999",
  },
  clearLocationButton: {
    marginTop: 8,
    padding: 8,
    backgroundColor: "#e74c3c",
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  clearLocationText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  submitSection: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingBottom: Platform.OS === "ios" ? 34 : 16,
  },
  submitButton: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#ccc",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  submitButtonTextDisabled: {
    color: "#999",
  },
  errorText: {
    color: "#e74c3c",
    fontSize: 14,
    marginTop: 4,
  },
  loadingText: {
    color: "#666",
    fontStyle: "italic",
    marginTop: 4,
    fontSize: 14,
  },
});

interface FormData {
  title: string;
  type: "rental" | "sale";
  price: string;
  description: string;
  address: string;
  latitude: string;
  longitude: string;
  bedrooms: string;
  bathrooms: string;
  minContractLength: string;
}

interface FormErrors {
  [key: string]: string;
}

interface PlaceSuggestion {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
}

export default function PostPropertyPage(): React.JSX.Element {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    type: "rental",
    price: "",
    description: "",
    address: "",
    latitude: "",
    longitude: "",
    bedrooms: "",
    bathrooms: "",
    minContractLength: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<
    PlaceSuggestion[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const addressInputRef = useRef<TextInput>(null);

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle keyboard events
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        // Scroll to address input when keyboard shows if it's focused
        if (addressInputRef.current?.isFocused()) {
          setTimeout(() => {
            scrollViewRef.current?.scrollTo({
              y: 300, // Scroll to address section
              animated: true,
            });
          }, 100);
        }
      },
    );

    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setShowSuggestions(false);
      },
    );

    return () => {
      keyboardDidHideListener?.remove();
      keyboardDidShowListener?.remove();
    };
  }, []);

  // Debounced search for address suggestions
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.address.length > 2) {
        searchAddresses(formData.address);
      } else {
        setAddressSuggestions([]);
        setShowSuggestions(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.address]);

  const searchAddresses = async (query: string) => {
    setIsLoadingLocation(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query,
        )}&limit=5&countrycodes=nz&addressdetails=1`,
        {
          headers: {
            "User-Agent": "PropertyApp/1.0",
          },
        },
      );

      if (response.ok) {
        const results = await response.json();
        const suggestions: PlaceSuggestion[] = results.map((result: any) => ({
          place_id: result.place_id,
          display_name: result.display_name,
          lat: result.lat,
          lon: result.lon,
          type: result.type,
        }));

        setAddressSuggestions(suggestions);
        setShowSuggestions(suggestions.length > 0);
      } else {
        console.error("Geocoding API error:", response.status);
      }
    } catch (error) {
      console.error("Error searching addresses:", error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const selectAddress = (suggestion: PlaceSuggestion) => {
    updateField("address", suggestion.display_name);
    updateField("latitude", suggestion.lat);
    updateField("longitude", suggestion.lon);
    setShowSuggestions(false);
    setAddressSuggestions([]);
    Keyboard.dismiss();
  };

  const clearLocation = () => {
    updateField("address", "");
    updateField("latitude", "");
    updateField("longitude", "");
    setShowSuggestions(false);
    setAddressSuggestions([]);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) newErrors["title"] = "Title is required";
    if (!formData.description.trim())
      newErrors["description"] = "Description is required";
    if (!formData.price.trim()) newErrors["price"] = "Price is required";
    if (!formData.address.trim()) newErrors["address"] = "Address is required";

    // Numeric validations
    if (formData.price && isNaN(Number(formData.price))) {
      newErrors["price"] = "Must be a number";
    }

    if (
      formData.address.trim() &&
      (!formData.latitude || !formData.longitude)
    ) {
      newErrors["address"] = "Please select an address from the suggestions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const user = getAuth().currentUser;
    if (!user) {
      Alert.alert("Error", "You must be logged in to post a property");
      return;
    }

    setIsSubmitting(true);

    try {
      const db = getFirestore();
      const propertiesCollection = collection(db, "properties");

      const propertyData = {
        title: formData.title.trim(),
        type: formData.type,
        price: Number(formData.price),
        description: formData.description.trim(),
        address: formData.address.trim(),
        coordinates: new GeoPoint(
          Number(formData.latitude),
          Number(formData.longitude),
        ),
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        ...(formData.type === "rental" && {
          contract: Number(formData.minContractLength),
        }),
        createdBy: user.uid,
        createdAt: new Date(),
      };

      const docRef = await addDoc(propertiesCollection, propertyData);

      console.log("Property posted with ID:", docRef.id);

      Alert.alert("Success!", "Your property has been posted successfully.", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("Error posting property:", error);
      Alert.alert("Error", "Failed to post property. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    formData.title.trim() &&
    formData.description.trim() &&
    formData.price.trim() &&
    formData.address.trim() &&
    formData.bedrooms.trim() &&
    formData.bathrooms.trim() &&
    (formData.type === "sale" || formData.minContractLength.trim()) &&
    formData.latitude &&
    formData.longitude;

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
            onChangeText={(value) => updateField("title", value)}
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
              onPress={() => updateField("type", "rental")}
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
              onPress={() => updateField("type", "sale")}
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
            onChangeText={(value) => updateField("price", value)}
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
            onChangeText={(value) => updateField("bedrooms", value)}
            placeholder="e.g., 2"
            keyboardType="numeric"
            testID="bedrooms-input"
          />

          {/* Bathrooms */}
          <Text style={styles.inputLabel}>Bathrooms *</Text>
          <TextInput
            style={styles.input}
            value={formData.bathrooms}
            onChangeText={(value) => updateField("bathrooms", value)}
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
                onChangeText={(value) =>
                  updateField("minContractLength", value)
                }
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
            onChangeText={(value) => updateField("description", value)}
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
              onChangeText={(value) => updateField("address", value)}
              placeholder="Start typing an address... (e.g., 123 Queen Street, Auckland)"
              testID="address-input"
              onFocus={() => {
                setShowSuggestions(addressSuggestions.length > 0);
                // Scroll to address input when focused
                setTimeout(() => {
                  scrollViewRef.current?.scrollTo({
                    y: 350,
                    animated: true,
                  });
                }, 300);
              }}
              returnKeyType="search"
              blurOnSubmit={false}
            />

            {isLoadingLocation && (
              <Text style={styles.loadingText}>Searching addresses...</Text>
            )}

            {showSuggestions && addressSuggestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                {addressSuggestions.map((item) => (
                  <TouchableOpacity
                    key={item.place_id.toString()}
                    style={styles.suggestionItem}
                    onPress={() => selectAddress(item)}
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
            onPress={handleSubmit}
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
