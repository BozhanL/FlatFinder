import { FilterState } from "@/types/FilterState";

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

// Global apply filter function
let globalApplyFilter: ((filters: FilterState) => void) | null = null;

// Register the apply filter function
export const registerApplyFilter = (
  applyFilterFn: (filters: FilterState) => void,
): void => {
  globalApplyFilter = applyFilterFn;
};

// Unregister the apply filter function
export const unregisterApplyFilter = (): void => {
  globalApplyFilter = null;
};

// Get the global apply filter function
export const getGlobalApplyFilter = ():
  | ((filters: FilterState) => void)
  | null => globalApplyFilter;

// Apply new filters globally
export const applyGlobalFilters = (newFilters: FilterState): void => {
  globalFilters = { ...newFilters };
  if (globalApplyFilter) {
    globalApplyFilter(newFilters);
  }
};

// Get current global filters
export const getGlobalFilters = (): FilterState => {
  return { ...globalFilters };
};

// Reset filters to default
export const resetGlobalFilters = (): void => {
  const resetFilters = { ...defaultFilters };
  globalFilters = resetFilters;
  if (globalApplyFilter) {
    globalApplyFilter(resetFilters);
  }
};

// Custom hook for using filters in React components
export const useFilterState = (
  onFiltersChange: (filters: FilterState) => void,
): {
  currentFilters: FilterState;
  registerFilter: () => void;
  unregisterFilter: () => void;
} => {
  const registerFilter = (): void => {
    registerApplyFilter(onFiltersChange);
  };

  const unregisterFilter = (): void => {
    unregisterApplyFilter();
  };

  return {
    currentFilters: getGlobalFilters(),
    registerFilter,
    unregisterFilter,
  };
};
