import type { NominatimResult, PlaceSuggestion } from "@/types/Post";
import { useEffect, useState } from "react";
import { Keyboard } from "react-native";

type UseAddressSearchReturn = {
  suggestions: PlaceSuggestion[];
  showSuggestions: boolean;
  isLoading: boolean;
  selectAddress: (
    suggestion: PlaceSuggestion,
    onSelect: (lat: string, lon: string, address: string) => void,
  ) => void;
  clearSuggestions: () => void;
  setShowSuggestions: (show: boolean) => void;
};

export default function useAddressSearch(
  addressQuery: string,
): UseAddressSearchReturn {
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (addressQuery.length > 2) {
        void searchAddresses(addressQuery);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 500);

    return (): void => {
      clearTimeout(timeoutId);
    };
  }, [addressQuery]);

  const searchAddresses = async (query: string): Promise<void> => {
    setIsLoading(true);
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
        const results = (await response.json()) as NominatimResult[];
        const mappedSuggestions: PlaceSuggestion[] = results.map((result) => ({
          place_id: result.place_id,
          display_name: result.display_name,
          lat: result.lat,
          lon: result.lon,
          type: result.type,
        }));

        setSuggestions(mappedSuggestions);
        setShowSuggestions(mappedSuggestions.length > 0);
      } else {
        console.error("Geocoding API error:", response.status);
      }
    } catch (error) {
      console.error("Error searching addresses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectAddress = (
    suggestion: PlaceSuggestion,
    onSelect: (lat: string, lon: string, address: string) => void,
  ): void => {
    onSelect(suggestion.lat, suggestion.lon, suggestion.display_name);
    setShowSuggestions(false);
    setSuggestions([]);
    Keyboard.dismiss();
  };

  const clearSuggestions = (): void => {
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return {
    suggestions,
    showSuggestions,
    isLoading,
    selectAddress,
    clearSuggestions,
    setShowSuggestions,
  };
};
