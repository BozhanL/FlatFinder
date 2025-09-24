import { getAuth } from "@react-native-firebase/auth";
import { GeoPoint, addDoc, collection, getFirestore } from "@react-native-firebase/firestore";
import { Stack, router } from "expo-router";
import React, { JSX, useState } from "react";
import {
  Alert,
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
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
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
  locationRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  locationInput: {
    flex: 1,
  },
  submitSection: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
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
});

interface FormData {
  title: string;
  type: "rental" | "sale";
  price: string;
  description: string;
  latitude: string;
  longitude: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function PostPropertyPage(): JSX.Element {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    type: "rental",
    price: "",
    description: "",
    latitude: "",
    longitude: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required fields
    if (!formData.title.trim()) newErrors["title"] = "Title is required";
    if (!formData.description.trim()) newErrors["description"] = "Description is required";
    if (!formData.price.trim()) newErrors["price"] = "Price is required";
    if (!formData.latitude.trim()) newErrors["latitude"] = "Latitude is required";
    if (!formData.longitude.trim()) newErrors["longitude"] = "Longitude is required";

    // Numeric validations
    if (formData.price && isNaN(Number(formData.price))) {
      newErrors["price"] = "Price must be a valid number";
    }
    if (formData.latitude && isNaN(Number(formData.latitude))) {
      newErrors["latitude"] = "Latitude must be a valid number";
    }
    if (formData.longitude && isNaN(Number(formData.longitude))) {
      newErrors["longitude"] = "Longitude must be a valid number";
    }

    // Range validations
    const lat = Number(formData.latitude);
    const lng = Number(formData.longitude);
    if (formData.latitude && (lat < -90 || lat > 90)) {
      newErrors["latitude"] = "Latitude must be between -90 and 90";
    }
    if (formData.longitude && (lng < -180 || lng > 180)) {
      newErrors["longitude"] = "Longitude must be between -180 and 180";
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

      // Prepare the property data
      const propertyData = {
        title: formData.title.trim(),
        type: formData.type,
        price: Number(formData.price),
        description: formData.description.trim(),
        coordinates: new GeoPoint(Number(formData.latitude), Number(formData.longitude)),
        // Add derived fields
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        createdBy: user.uid,
        createdAt: new Date(),
      };

      // Add the document to Firestore
      const docRef = await addDoc(propertiesCollection, propertyData);
      
      console.log("Property posted with ID:", docRef.id);

      Alert.alert(
        "Success!",
        "Your property has been posted successfully.",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error("Error posting property:", error);
      Alert.alert(
        "Error",
        "Failed to post property. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.title.trim() && 
                     formData.description.trim() && 
                     formData.price.trim() && 
                     formData.latitude.trim() && 
                     formData.longitude.trim() &&
                     Object.keys(errors).length === 0;

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Post Property",
          presentation: "modal",
        }}
      />

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Property Title */}
        <Text style={styles.inputLabel}>Property Title *</Text>
        <TextInput
          style={styles.input}
          value={formData.title}
          onChangeText={(value) => updateField("title", value)}
          placeholder="e.g., Beautiful 2BR Apartment in City Center"
          testID="title-input"
        />
        {errors['title'] && <Text style={styles.errorText}>{errors['title']}</Text>}

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
        {errors["price"] && <Text style={styles.errorText}>{errors["price"]}</Text>}

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
        {errors["description"] && <Text style={styles.errorText}>{errors["description"]}</Text>}

        {/* Location */}
        <Text style={styles.inputLabel}>Location *</Text>
        <View style={styles.locationRow}>
          <View style={styles.locationInput}>
            <TextInput
              style={styles.input}
              value={formData.latitude}
              onChangeText={(value) => updateField("latitude", value)}
              placeholder="Latitude (e.g., -36.8485)"
              keyboardType="numeric"
              testID="latitude-input"
            />
            {errors["latitude"] && <Text style={styles.errorText}>{errors["latitude"]}</Text>}
          </View>
          
          <View style={styles.locationInput}>
            <TextInput
              style={styles.input}
              value={formData.longitude}
              onChangeText={(value) => updateField("longitude", value)}
              placeholder="Longitude (e.g., 174.7633)"
              keyboardType="numeric"
              testID="longitude-input"
            />
            {errors["longitude"] && <Text style={styles.errorText}>{errors["longitude"]}</Text>}
          </View>
        </View>
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
              (!isFormValid || isSubmitting) && styles.submitButtonTextDisabled,
            ]}
          >
            {isSubmitting ? "Posting..." : "Post Property"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}