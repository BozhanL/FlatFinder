import { styles } from "@/styles/property-style";
import type { Property } from "@/types/Property";
import { Ionicons } from "@expo/vector-icons"; //for the share logic
import { doc, getDoc, getFirestore } from "@react-native-firebase/firestore";
import * as Linking from "expo-linking"; // <-- NEW: Import expo-linking for creating robust URLs
import { Stack, useLocalSearchParams } from "expo-router";
import React, { type JSX, useEffect, useState } from "react";
//adding share, touchableOpacity
import { ActivityIndicator, Image, ScrollView, Share, Text, TouchableOpacity, View } from "react-native";

export default function PropertyDetailsPage(): JSX.Element {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

   //share logic --
  const handleShare = async (): Promise<void> => {
    if (!property) {
      console.error("Cannot share: Property data is missing.");
      return;
    }

    // 1. Construct the path based on Expo Router's file system structure.
    // The path is correct: /property/[id]
    const deepLinkPath = `/property/${property.id}`;
    
    // 2. Use Linking.createURL() to correctly generate the shareable link.
    // This is the definitive way to handle schemes (exp:// or custom-scheme://) 
    // in Expo and React Native.
    const shareableUrl = Linking.createURL(deepLinkPath); 

    const message = `
I found a great property! 🏠
${property.title}
${formatPrice(property.price, property.type)} | ${property.address || 'Location Hidden'}

Tap to view the details in the app: ${shareableUrl}
    `.trim();

    try {
      // 3. Call the native Share API
      const result = await Share.share({
        message: message,
        title: `Check out: ${property.title}`,
        url: shareableUrl, // The URL is often required for social apps
      });

      if (result.action === Share.sharedAction) {
        console.log("Property shared successfully with URL:", shareableUrl);
      } else if (result.action === Share.dismissedAction) {
        console.log("Share dialog dismissed.");
      }
    } catch (error) {
      console.error("Error sharing property:", error);
    }
  };




  
  //unchanged
  useEffect(() => {
    const fetchPropertyDetails = async (): Promise<void> => {
      if (!id) {
        setError("Property ID not found");
        return;
      }

      try {
        setLoading(true);
        const db = getFirestore();
        const docRef = doc(db, "properties", id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          setError("Property not found");
          return;
        }

        const data = docSnap.data();

        if (data) {
          const coordinates = data["coordinates"];
          const latitude = coordinates?.latitude || 0;
          const longitude = coordinates?.longitude || 0;

          const propertyDetails: Property = {
            id: docSnap.id,
            title: data["title"] || "Untitled Property",
            latitude,
            longitude,
            price: data["price"] || 0,
            type: data["type"] || "rental",
            bedrooms: data["bedrooms"],
            bathrooms: data["bathrooms"],
            contract: data["contract"],
            description: data["description"] || "No description available.",
            address: data["address"],
            imageUrl: data["imageUrl"],
          };

          setProperty(propertyDetails);
        }
      } catch (err) {
        console.error("Error getting details:", err);
        setError("Failed to load property details");
      } finally {
        setLoading(false);
      }
    };

    void fetchPropertyDetails();
  }, [id]);

  const formatPrice = (price: number, type?: string): string => {
    if (type === "sale") {
      return `$${price.toLocaleString()}`;
    } else {
      return `$${price}/week`;
    }
  };

  const formatContractLength = (weeks?: number): string => {
    if (!weeks) {
      return "Not specified";
    }
    return `${weeks} weeks`;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: "Loading...",
            presentation: "modal",
          }}
        />

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={{ marginTop: 10, color: "#666" }} testID="loading-text">
            Loading property details...
          </Text>
        </View>
      </View>
    );
  }

  if (error || !property) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: "Error",
            presentation: "modal",
          }}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText} testID="error-text">
            {error || "Property not found"}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: property.title,
          presentation: "modal",
           headerRight: () => (
            <TouchableOpacity onPress={handleShare} testID="share-button">
              <Ionicons name="share-social-outline" size={24} color="#2563eb" />
            </TouchableOpacity>
          ),
        }}

      />

      <ScrollView style={styles.scrollContent}>
        <View style={styles.imageContainer}>
          {property.imageUrl ? (
            <Image
              source={{ uri: property.imageUrl }}
              style={styles.propertyImage}
              testID="property-image"
            />
          ) : (
            <Text
              style={styles.placeholderImage}
              testID="property-image-placeholder"
            >
              No Image Available
            </Text>
          )}
        </View>

        <View style={styles.contentSection}>
          <Text style={styles.propertyTitle} testID="property-title">
            {property.title}
          </Text>
          <Text style={styles.propertyPrice} testID="property-price">
            {formatPrice(property.price, property.type)}
          </Text>
          <Text style={styles.propertyType} testID="property-type">
            {property.type || "rental"}
          </Text>

          {property.address && (
            <>
              <Text style={styles.sectionTitle} testID="address-title">
                Address
              </Text>
              <Text style={styles.description} testID="property-address">
                {property.address}
              </Text>
            </>
          )}

          <Text style={styles.sectionTitle} testID="description-title">
            Description
          </Text>
          <Text style={styles.description} testID="property-description">
            {property.description}
          </Text>

          <Text style={styles.sectionTitle} testID="details-title">
            Property Details
          </Text>
          <View style={styles.detailsGrid}>
            {property.bedrooms !== undefined && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Bedrooms</Text>
                <Text style={styles.detailValue} testID="property-bedrooms">
                  {property.bedrooms}
                </Text>
              </View>
            )}
            {property.bathrooms !== undefined && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Bathrooms</Text>
                <Text style={styles.detailValue} testID="property-bathrooms">
                  {property.bathrooms}
                </Text>
              </View>
            )}

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Minimum Contract</Text>
              <Text style={styles.detailValue} testID="property-contract">
                {formatContractLength(property.contract)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
