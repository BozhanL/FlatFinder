/* istanbul ignore file */
// This file mainly contains code for IO, and unable to be tested in unit tests.
// react-native-firebase does not work in jest unit test environment.
// Mocking it is possible, but it may not represent real world situation.
import useUser from "@/hooks/useUser";
import { supabase } from "@/lib/supabaseClient";
import type { FormData, FormErrors } from "@/types/PostProperty";
import {
  GeoPoint,
  addDoc,
  collection,
  getFirestore,
  serverTimestamp,
} from "@react-native-firebase/firestore";
import { router } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

const INITIAL_FORM_DATA: FormData = {
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
};

type UsePropertyFormReturn = {
  formData: FormData;
  errors: FormErrors;
  isSubmitting: boolean;
  isFormValid: boolean;
  selectedImages: string[];
  updateField: (field: keyof FormData, value: string) => void;
  addImage: (uri: string) => void;
  removeImage: (uri: string) => void;
  handleSubmit: () => Promise<void>;
};

const MAX_IMAGES = 5;

export default function usePropertyForm(): UsePropertyFormReturn {
  const user = useUser();
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const updateField = (field: keyof FormData, value: string): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addImage = (uri: string): void => {
    if (selectedImages.length >= MAX_IMAGES) {
      Alert.alert(
        "Maximum Images",
        `You can only upload up to ${MAX_IMAGES} images.`,
      );
      return;
    }
    setSelectedImages((prev) => [...prev, uri]);
  };

  const removeImage = (uri: string): void => {
    setSelectedImages((prev) => prev.filter((img) => img !== uri));
  };

  const uploadImageToSupabase = async (
    imageUri: string,
    userId: string,
    index: number,
  ): Promise<string | null> => {
    try {
      console.log(`Starting upload ${index + 1} for:`, imageUri);

      const response = await fetch(imageUri);
      const blob = await response.blob();
      const arrayBuffer = await new Response(blob).arrayBuffer();

      const timestamp = Date.now();
      const filename = `${userId}/${timestamp}_${index}.jpg`;
      console.log("Uploading to:", filename);

      const { data, error } = await supabase.storage
        .from("property-images")
        .upload(filename, arrayBuffer, {
          contentType: "image/jpeg",
          cacheControl: "3600",
        });

      if (error) {
        console.error("Supabase upload error:", error);
        return null;
      }

      console.log(`Upload ${index + 1} successful:`, data);

      const {
        data: { publicUrl },
      } = supabase.storage.from("property-images").getPublicUrl(filename);

      return publicUrl;
    } catch (error) {
      console.error(`Error uploading image ${index + 1}:`, error);
      return null;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required text fields
    if (!formData.title.trim()) {
      newErrors["title"] = "Title is required";
    } else if (formData.title.trim().length > 100) {
      newErrors["title"] = "Title must be under 100 characters";
    }

    if (!formData.description.trim()) {
      newErrors["description"] = "Description is required";
    } else if (formData.description.trim().length < 10) {
      newErrors["description"] = "Description must be at least 10 characters";
    }

    if (!formData.address.trim()) {
      newErrors["address"] = "Address is required";
    }

    // Price validation
    if (!formData.price.trim()) {
      newErrors["price"] = "Price is required";
    } else {
      const priceNum = Number(formData.price);
      if (!Number.isFinite(priceNum)) {
        newErrors["price"] = "Price must be a valid number";
      } else if (priceNum <= 0) {
        newErrors["price"] = "Price must be greater than 0";
      } else if (priceNum > 100000000) {
        newErrors["price"] = "Price seems unrealistic";
      }
    }

    // Bedrooms validation
    if (!formData.bedrooms.trim()) {
      newErrors["bedrooms"] = "Bedrooms is required";
    } else {
      const bedroomsNum = Number(formData.bedrooms);
      if (!Number.isFinite(bedroomsNum)) {
        newErrors["bedrooms"] = "Bedrooms must be a valid number";
      } else if (!Number.isInteger(bedroomsNum)) {
        newErrors["bedrooms"] = "Bedrooms must be a whole number";
      } else if (bedroomsNum < 0) {
        newErrors["bedrooms"] = "Bedrooms cannot be negative";
      } else if (bedroomsNum > 50) {
        newErrors["bedrooms"] = "Maximum 50 bedrooms";
      }
    }

    // Bathrooms validation
    if (!formData.bathrooms.trim()) {
      newErrors["bathrooms"] = "Bathrooms is required";
    } else {
      const bathroomsNum = Number(formData.bathrooms);
      if (!Number.isFinite(bathroomsNum)) {
        newErrors["bathrooms"] = "Bathrooms must be a valid number";
      } else if (bathroomsNum < 0) {
        newErrors["bathrooms"] = "Bathrooms cannot be negative";
      } else if (bathroomsNum > 20) {
        newErrors["bathrooms"] = "Maximum 20 bathrooms";
      }
    }

    // Contract length validation (for rentals only)
    if (formData.type === "rental") {
      if (!formData.minContractLength.trim()) {
        newErrors["minContractLength"] =
          "Contract length is required for rentals";
      } else {
        const contractNum = Number(formData.minContractLength);
        if (!Number.isFinite(contractNum)) {
          newErrors["minContractLength"] =
            "Contract length must be a valid number";
        } else if (!Number.isInteger(contractNum)) {
          newErrors["minContractLength"] =
            "Contract length must be whole weeks";
        } else if (contractNum > 520) {
          newErrors["minContractLength"] = "Maximum 520 weeks (10 years)";
        }
      }
    }

    // Coordinate validation
    if (
      formData.address.trim() &&
      (!formData.latitude || !formData.longitude)
    ) {
      newErrors["address"] = "Please select an address from the suggestions";
    } else if (formData.latitude && formData.longitude) {
      const lat = Number(formData.latitude);
      const lon = Number(formData.longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        newErrors["address"] = "Invalid coordinates";
      } else if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        newErrors["address"] = "Coordinates out of valid range";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) {
      return;
    }

    if (!user) {
      Alert.alert("Error", "You must be logged in to post a property");
      return;
    }

    const userId = user.uid;
    setIsSubmitting(true);

    try {
      const imageUrls: string[] = [];

      // Upload all images to Supabase
      if (selectedImages.length > 0) {
        for (let i = 0; i < selectedImages.length; i++) {
          const imageUri = selectedImages[i];
          if (!imageUri) {
            continue;
          }

          const imageUrl = await uploadImageToSupabase(imageUri, userId, i);

          if (!imageUrl) {
            Alert.alert(
              "Error",
              `Failed to upload image ${i + 1}. Please try again.`,
            );
            setIsSubmitting(false);
            return;
          }

          imageUrls.push(imageUrl);
        }
      }

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
        imageUrl: imageUrls,
        createdBy: userId,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(propertiesCollection, propertyData);

      console.log("Property posted with ID:", docRef.id);

      Alert.alert("Success!", "Your property has been posted successfully.", [
        {
          text: "OK",
          onPress: (): void => {
            router.back();
          },
        },
      ]);
    } catch (error) {
      console.error("Error posting property:", error);
      Alert.alert("Error", "Failed to post property. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = Boolean(
    formData.title.trim() &&
      formData.description.trim() &&
      formData.price.trim() &&
      formData.address.trim() &&
      formData.bedrooms.trim() &&
      formData.bathrooms.trim() &&
      (formData.type === "sale" || formData.minContractLength.trim()) &&
      formData.latitude &&
      formData.longitude,
  );

  return {
    formData,
    errors,
    isSubmitting,
    isFormValid,
    selectedImages,
    updateField,
    addImage,
    removeImage,
    handleSubmit,
  };
}
