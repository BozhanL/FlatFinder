import type { FilterState } from "@/types/FilterState";

// Default filter state
const defaultFilters: FilterState = {
  type: [],
  minPrice: "",
  maxPrice: "",
  bedrooms: null,
  bathrooms: null,
  minContract: "",
};

// Global filter state
let globalFilters: FilterState = { ...defaultFilters };

type ApplyFilterFunction = (filters: FilterState) => void;

// Global apply filter function
let globalApplyFilter: ApplyFilterFunction | null = null;

// Register the apply filter function
export function registerApplyFilter(applyFilterFn: ApplyFilterFunction): void {
  globalApplyFilter = applyFilterFn;
}

// Unregister the apply filter function
export function unregisterApplyFilter(): void {
  globalApplyFilter = null;
}

// Apply new filters globally
export function applyGlobalFilters(newFilters: FilterState): void {
  globalFilters = { ...newFilters };
  if (globalApplyFilter) {
    globalApplyFilter(newFilters);
  }
}

// Get current global filters
export function getGlobalFilters(): FilterState {
  return { ...globalFilters };
}
