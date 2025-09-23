import { FilterState, Property } from "@/types/FilterState";

// Pure filtering function - no React hooks, just logic
export function applyPropertyFilters(
  properties: Property[],
  filters: FilterState,
): Property[] {
  return (
    properties
      // Property type filter - if empty, show all types
      .filter(
        (property) =>
          filters.type.length === 0 ||
          filters.type.includes(property.type || "rental"),
      )
      // Price filter
      .filter((property) => {
        const minPrice = filters.minPrice ? parseFloat(filters.minPrice) : 0;
        const maxPrice = filters.maxPrice
          ? parseFloat(filters.maxPrice)
          : Infinity;

        return (
          isNaN(minPrice) ||
          isNaN(maxPrice) ||
          (property.price >= minPrice && property.price <= maxPrice)
        );
      })
      // Bedrooms filter - single selection (null means no filter)
      .filter(
        (property) =>
          filters.bedrooms === null ||
          (property.bedrooms || 0) >= filters.bedrooms,
      )
      // Bathrooms filter - single selection (null means no filter)
      .filter(
        (property) =>
          filters.bathrooms === null ||
          (property.bathrooms || 0) >= filters.bathrooms,
      )
      // Contract length filter
      .filter((property) => {
        const minContract = parseInt(filters.minContract);
        return (
          isNaN(minContract) || (property.contract || Infinity) >= minContract
        );
      })
  );
};

// Count active filters
export const countActiveFilters = (filters: FilterState): number => {
  return (
    (filters.type.length > 0 ? 1 : 0) +
    (filters.minPrice !== "" || filters.maxPrice !== "" ? 1 : 0) +
    (filters.bedrooms !== null ? 1 : 0) +
    (filters.bathrooms !== null ? 1 : 0) +
    (filters.minContract !== "" ? 1 : 0)
  );
};

// Check if any filters are active
export function hasActiveFilters(filters: FilterState): boolean {
  return countActiveFilters(filters) > 0;
};
