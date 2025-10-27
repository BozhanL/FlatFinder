import useUser from "@/hooks/useUser";
import { styles } from "@/styles/property-style";
import type { Property } from "@/types/Property";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  deleteDoc,
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc,
} from "@react-native-firebase/firestore";
import { Stack, useLocalSearchParams } from "expo-router";
import { type JSX, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function PropertyDetailsPage(): JSX.Element {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFav, setIsFav] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const uid = useUser()?.uid ?? null;

  // Fetches property details from database
  useEffect(() => {
    // Returns error if property ID is not found
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
        // Catches error if details failed to load.
      } catch (err) {
        console.error("Error getting details:", err);
        setError("Failed to load property details");
      } finally {
        setLoading(false);
      }
    };

    void fetchPropertyDetails();
  }, [id]);

  // Load watchlist status by @G2CCC
  useEffect(() => {
    const run = async (): Promise<void> => {
      if (!uid || !property?.id) {
        setIsFav(false);
        return;
      }
      const favRef = doc(
        getFirestore(),
        "users",
        uid,
        "watchlist",
        property.id,
      );
      const favSnap = await getDoc(favRef);
      setIsFav(favSnap.exists());
    };
    void run();
  }, [uid, property?.id]);

  // Toggle favorite status by @G2CCC
  const toggleFavorite = async (): Promise<void> => {
    if (!uid || !property) {
      return;
    }
    const favRef = doc(getFirestore(), "users", uid, "watchlist", property.id);

    if (isFav) {
      await deleteDoc(favRef);
      setIsFav(false);
    } else {
      await setDoc(favRef, {
        propertyId: property.id,
        title: property.title,
        price: property.price,
        type: property.type ?? "rental",
        address: property.address ?? "",
        imageUrl: property.imageUrl ?? "",
        createdAt: serverTimestamp(),
      });
      setIsFav(true);
    }
  };

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

  const handleScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ): void => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / SCREEN_WIDTH);
    setCurrentImageIndex(index);
  };

  // Gets the images on firebase, which was uploaded to supabase
  // uses a URL
  const getImageUrls = (): string[] => {
    if (!property?.imageUrl) {
      return [];
    }

    if (Array.isArray(property.imageUrl)) {
      return property.imageUrl;
    }

    return [property.imageUrl];
  };

  const renderImageItem = ({ item }: { item: string }): JSX.Element => (
    <View style={{ width: SCREEN_WIDTH }}>
      <Image
        source={{ uri: item }}
        style={styles.propertyImage}
        resizeMode="cover"
      />
    </View>
  );

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

  // Displays error messages
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

  // Gets the images
  const imageUrls = getImageUrls();

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: property.title,
          presentation: "modal",
          // Add favorite button to header by @G2CCC
          headerRight: () => (
            <TouchableOpacity
              onPress={() => {
                void toggleFavorite();
              }}
              accessibilityLabel={
                isFav ? "Remove from watchlist" : "Add to watchlist"
              }
              style={{ paddingHorizontal: 12, paddingVertical: 6 }}
            >
              <MaterialCommunityIcons
                name={isFav ? "heart" : "heart-outline"}
                size={24}
                color={isFav ? "#ef4444" : "#444"}
              />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollContent}>
        <View style={styles.imageContainer}>
          {imageUrls.length > 0 ? (
            <>
              <FlatList
                ref={flatListRef}
                data={imageUrls}
                renderItem={renderImageItem}
                keyExtractor={(item, index) => `${item}-${index}`}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                testID="property-image-carousel"
              />

              {/* Image Counter */}
              {imageUrls.length > 1 && (
                <View
                  style={{
                    position: "absolute",
                    bottom: 16,
                    right: 16,
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 16,
                  }}
                >
                  <Text
                    style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}
                  >
                    {currentImageIndex + 1} / {imageUrls.length}
                  </Text>
                </View>
              )}

              {/* Pagination Dots */}
              {imageUrls.length > 1 && (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    position: "absolute",
                    bottom: 16,
                    left: 0,
                    right: 0,
                  }}
                >
                  {imageUrls.map((_, index) => (
                    <View
                      key={index}
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor:
                          index === currentImageIndex
                            ? "#fff"
                            : "rgba(255, 255, 255, 0.4)",
                        marginHorizontal: 4,
                      }}
                    />
                  ))}
                </View>
              )}
            </>
          ) : (
            <Text
              style={styles.placeholderImage}
              testID="property-image-placeholder"
            >
              No Image Available
            </Text>
          )}
        </View>

        {/* Property details */}
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
