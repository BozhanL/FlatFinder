import type { Property } from "@/types/Property";
import { Share } from "react-native";

// Define the required types for the utility function
interface SharePropertyParams {
  property: Property;
  formatPrice: (price: number, type?: string) => string;
}

/**
 * Handles the logic for sharing a property deep link.
 * @param property The property object to share.
 * @param formatPrice Utility function to format the property price.
 */
export const shareProperty = async ({
  property,
  formatPrice,
}: SharePropertyParams): Promise<void> => {
  if (!property) {
    console.error("Cannot share: Property data is missing.");
    return;
  }

  // 1. Construct the path based on Expo Router's file system structure.
  // The property details page is located at /property/[id],
  // so the correct path is /property/ plus the actual property ID.
  const deepLinkPath = `/sharedLink/${property.id}`;

  // 2. MANUAL FIX: Force the creation of the HTTPS URL.
  // We use the verified domain 'flatfinder.io' and the path.
  // This ensures the link is recognized as a standard, clickable URL
  // in all external applications (like chat apps and email).
  const shareableUrl = `https://flatfinder.io${deepLinkPath}`;

  const message = `
I found a great property on flatfinder! 🏠
${property.title}
${formatPrice(property.price, property.type)} | ${
    property.address || "Location Hidden"
  }

Tap to view the details in the app: ${shareableUrl}
  `.trim();

  try {
    // 3. Call the native Share API
    const result = await Share.share({
      message: message,
      title: `Check out: ${property.title}`,
      url: shareableUrl, // This is the crucial HTTPS URL for native recognition
    });

    if (result.action === Share.sharedAction) {
      console.log("Property shared successfully with URL:", shareableUrl);
    } else {
      console.log("Share dialog dismissed.");
    }
  } catch (error) {
    console.error("Error sharing property:", error);
  }
};
