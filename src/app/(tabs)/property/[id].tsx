import firestore from "@react-native-firebase/firestore";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    paddingTop: 5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  backButtonText: {
    fontSize: 18,
    color: "#2563eb",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  imageContainer: {
    height: 250,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  propertyImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholderImage: {
    fontSize: 16,
    color: "#999",
  },
  contentSection: {
    padding: 16,
  },
  propertyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  propertyPrice: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2563eb",
    marginBottom: 4,
  },
  propertyType: {
    fontSize: 16,
    color: "#666",
    textTransform: "capitalize",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: "#444",
    lineHeight: 24,
    marginBottom: 16,
  },
  detailsGrid: {
    marginTop: 16,
  },
  detailRow: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  detailLabel: {
    fontSize: 16,
    color: "#666",
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
  },
  contactSection: {
    backgroundColor: "#f8f9fa",
    padding: 16,
    margin: 16,
    borderRadius: 12,
  },
  contactButton: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 12,
  },
  contactButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

interface PropertyDetails {
  id: string;
  title: string;
  price: number;
  type: string;
  description: string;
  bedrooms?: number;
  bathrooms?: number;
  address?: string;
  contract?: number;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
}

export default function PropertyDetailsPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [property, setProperty] = useState<PropertyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      if (!id) {
        setError("Property ID not found");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const doc = await firestore().collection("properties").doc(id).get();

        if (!doc.exists) {
          setError("Property not found");
          setLoading(false);
          return;
        }

        const data = doc.data();

        if (data) {
          const contractWeeks = data["contract"];

          const propertyDetails: PropertyDetails = {
            id: doc.id,
            title: data["title"] || "Untitled Property",
            price: data["price"] || 0,
            type: data["type"] || "rental",
            description: data["description"] || "No description available.",
            bedrooms: data["bedrooms"],
            bathrooms: data["bathrooms"],
            address: data["address"],
            imageUrl: data["imageUrl"],
            contract: contractWeeks,
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

    fetchPropertyDetails();
  }, [id]);

  const formatPrice = (price: number, type: string): string => {
    if (type === "sale") {
      return `$${price.toLocaleString()}`;
    } else {
      return `$${price}/week`;
    }
  };

  const formatContractLength = (weeks?: number): string => {
    if (!weeks) return "Not specified";
    return `${weeks} weeks`;
  };

  const handleBackPress = () => {
    router.back();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} testID="property-header">
            Loading...
          </Text>
        </View>
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
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} testID="property-header">
            Error
          </Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText} testID="error-text">
            {error || "Property not found"}
          </Text>
          <TouchableOpacity
            onPress={handleBackPress}
            style={styles.contactButton}
            testID="back-button"
          >
            <Text style={styles.contactButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBackPress}
          style={styles.backButton}
          testID="back-button"
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text
          style={styles.headerTitle}
          numberOfLines={1}
          testID="property-header"
        >
          {property.title}
        </Text>
      </View>

      <ScrollView style={styles.scrollContent}>
        {/* Property Image */}
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

        {/* Property Details */}
        <View style={styles.contentSection}>
          <Text style={styles.propertyTitle} testID="property-title">
            {property.title}
          </Text>
          <Text style={styles.propertyPrice} testID="property-price">
            {formatPrice(property.price, property.type)}
          </Text>
          <Text style={styles.propertyType} testID="property-type">
            {property.type}
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

          {/* Property Details Grid */}
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

            {/* Always show contract length, even if not specified */}
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
