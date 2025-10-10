import type { FormData, FormErrors } from "@/types/Post";
import { getAuth } from "@react-native-firebase/auth";
import {
  GeoPoint,
  addDoc,
  collection,
  getFirestore,
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
  updateField: (field: keyof FormData, value: string) => void;
  handleSubmit: () => Promise<void>;
};

export default function usePropertyForm(): UsePropertyFormReturn {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: keyof FormData, value: string): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) newErrors["title"] = "Title is required";
    if (!formData.description.trim())
      newErrors["description"] = "Description is required";
    if (!formData.price.trim()) newErrors["price"] = "Price is required";
    if (!formData.address.trim()) newErrors["address"] = "Address is required";

    if (formData.price && !isFinite(Number(formData.price))) {
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

  const handleSubmit = async (): Promise<void> => {
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
    updateField,
    handleSubmit,
  };
};
