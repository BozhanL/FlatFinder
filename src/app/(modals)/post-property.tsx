import useAddressSearch from "@/hooks/useAddressSearch";
import usePropertyForm from "@/hooks/usePostForm";
import { styles } from "@/styles/posting-style";
import type { PlaceSuggestion } from "@/types/PostProperty";
import * as ImagePicker from "expo-image-picker";
import { Stack } from "expo-router";
import { useEffect, useRef, type JSX } from "react";
import {
  Image,
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
    selectedImage,
    updateField,
    setSelectedImage,
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

  // Request image library permissions
  useEffect(() => {
    (async (): Promise<void> => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        console.warn("Image library permission denied");
      }
    })();
  }, []);

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

  const pickImage = async (): Promise<void> => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled) {
        const asset = result.assets?.[0];
        if (asset?.uri) {
          setSelectedImage(asset.uri);
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
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
          {/* Property Image */}
          <Text style={styles.inputLabel}>Property Image</Text>
          <TouchableOpacity
            style={[
              styles.input,
              {
                height: 200,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: selectedImage ? "#f0f0f0" : "#e8e8e8",
              },
            ]}
            onPress={pickImage}
          >
            {selectedImage ? (
              <Image
                source={{ uri: selectedImage }}
                style={{ width: "100%", height: "100%", borderRadius: 8 }}
              />
            ) : (
              <Text style={{ fontSize: 16, color: "#666" }}>
                Tap to select image
              </Text>
            )}
          </TouchableOpacity>
          {selectedImage && (
            <TouchableOpacity
              onPress={(): void => setSelectedImage(null)}
              style={{ marginTop: 8 }}
            >
              <Text style={{ color: "#e74c3c", fontSize: 14 }}>
                Remove image
              </Text>
            </TouchableOpacity>
          )}

          {/* Property Title */}
          <Text style={styles.inputLabel}>Property Title *</Text>
          <TextInput
            style={styles.input}
            value={formData.title}
            onChangeText={(value): void => {
              updateField("title", value);
            }}
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