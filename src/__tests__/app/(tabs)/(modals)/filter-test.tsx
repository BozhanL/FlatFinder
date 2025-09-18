interface Property {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  price: number;
  type: string;
  bedrooms: number;
  bathrooms: number;
  contract?: string;
}

interface FilterState {
  type: string[];
  minPrice: string;
  maxPrice: string;
  bedrooms: number[];
  bathrooms: number[];
}

const applyFilters = (
  properties: Property[],
  filters: FilterState,
): Property[] => {
  return properties.filter((property) => {
    // Property type filter - if empty, show all types
    if (filters.type.length > 0) {
      if (!filters.type.includes(property.type)) {
        return false;
      }
    }

    // Price filter
    if (filters.minPrice !== "" || filters.maxPrice !== "") {
      const minPrice = filters.minPrice ? parseFloat(filters.minPrice) : 0;
      const maxPrice = filters.maxPrice
        ? parseFloat(filters.maxPrice)
        : Infinity;

      if (isNaN(minPrice) || isNaN(maxPrice)) {
        // Skip price filtering if values are invalid
      } else if (property.price < minPrice || property.price > maxPrice) {
        return false;
      }
    }

    // Bedrooms, if array is empty, show all bedroom counts
    if (filters.bedrooms.length > 0) {
      const meetsBedroomRequirement = filters.bedrooms.some(
        (minBedrooms: number) => property.bedrooms >= minBedrooms,
      );
      if (!meetsBedroomRequirement) {
        return false;
      }
    }

    // Bathrooms, if array is empty, show all bathroom counts
    if (filters.bathrooms.length > 0) {
      const meetsBathroomRequirement = filters.bathrooms.some(
        (minBathrooms: number) => property.bathrooms >= minBathrooms,
      );
      if (!meetsBathroomRequirement) {
        return false;
      }
    }

    return true;
  });
};

// Test data
const testProperties: Property[] = [
  {
    id: "1",
    title: "Test Rental",
    latitude: -36.8485,
    longitude: 174.7633,
    price: 500,
    type: "rental",
    bedrooms: 2,
    bathrooms: 1,
  },
  {
    id: "2",
    title: "Test House",
    latitude: -36.85,
    longitude: 174.76,
    price: 800000,
    type: "sale",
    bedrooms: 3,
    bathrooms: 2,
  },
  {
    id: "3",
    title: "Expensive Apartment",
    latitude: -36.847,
    longitude: 174.765,
    price: 1200,
    type: "rental",
    bedrooms: 4,
    bathrooms: 3,
  },
  {
    id: "4",
    title: "Studio Apartment",
    latitude: -36.849,
    longitude: 174.764,
    price: 400,
    type: "rental",
    bedrooms: 1,
    bathrooms: 1,
  },
];

// Test cases
describe("Filter Function Tests", () => {
  test("filter rental properties only", () => {
    const filters: FilterState = {
      type: ["rental"],
      minPrice: "",
      maxPrice: "",
      bedrooms: [],
      bathrooms: [],
    };

    const result = applyFilters(testProperties, filters);
    expect(result.length).toBe(3); // find 3 rental properties

    // Check that all results are rental properties
    result.forEach((p) => {
      expect(p.type).toBe("rental");
    });
  });

  test("filter by price range", () => {
    const filters: FilterState = {
      type: [],
      minPrice: "600",
      maxPrice: "1500",
      bedrooms: [],
      bathrooms: [],
    };

    const result = applyFilters(testProperties, filters);
    expect(result.length).toBe(1);
    expect(result[0]?.price).toBe(1200); // Added optional chaining
  });

  test("filter properties with 3+ bedrooms", () => {
    const filters: FilterState = {
      type: [],
      minPrice: "",
      maxPrice: "",
      bedrooms: [3],
      bathrooms: [],
    };

    const result = applyFilters(testProperties, filters);
    expect(result.length).toBe(2);

    // Check that all results have 3+ bedrooms
    result.forEach((p) => {
      expect(p.bedrooms).toBeGreaterThanOrEqual(3);
    });
  });

  test("filter properties with 2+ bathrooms", () => {
    const filters: FilterState = {
      type: [],
      minPrice: "",
      maxPrice: "",
      bedrooms: [],
      bathrooms: [2],
    };

    const result = applyFilters(testProperties, filters);
    expect(result.length).toBe(2);

    // Check that all results have 2+ bathrooms
    result.forEach((p) => {
      expect(p.bathrooms).toBeGreaterThanOrEqual(2);
    });
  });

  test("combine multiple filters", () => {
    const filters: FilterState = {
      type: ["rental"],
      minPrice: "400",
      maxPrice: "1000",
      bedrooms: [2],
      bathrooms: [1],
    };

    const result = applyFilters(testProperties, filters);
    expect(result.length).toBe(1);
    expect(result[0]?.id).toBe("1"); // Added optional chaining
  });

  test("return all properties when no filters applied", () => {
    const filters: FilterState = {
      type: [],
      minPrice: "",
      maxPrice: "",
      bedrooms: [],
      bathrooms: [],
    };

    const result = applyFilters(testProperties, filters);
    expect(result.length).toBe(4);
  });

  test("filter for sale properties only", () => {
    const filters: FilterState = {
      type: ["sale"],
      minPrice: "",
      maxPrice: "",
      bedrooms: [],
      bathrooms: [],
    };

    const result = applyFilters(testProperties, filters);
    expect(result.length).toBe(1);
    expect(result[0]?.type).toBe("sale"); // Added optional chaining
  });
});
