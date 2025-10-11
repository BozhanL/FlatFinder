/* istanbul ignore file */
// This file contains only StyleSheet.
// No need to test it in unit tests.
import { Platform, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  typeSelector: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  typeButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f8f9fa",
    flex: 1,
    alignItems: "center",
  },
  typeButtonActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  typeButtonText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  typeButtonTextActive: {
    color: "#fff",
  },
  addressContainer: {
    position: "relative",
    zIndex: 1000,
    marginBottom: 20,
  },
  suggestionsContainer: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: "#ddd",
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    maxHeight: 150,
    zIndex: 1001,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  suggestionText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 18,
  },
  locationDisplay: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  locationText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  coordinatesText: {
    fontSize: 12,
    color: "#999",
  },
  clearLocationButton: {
    marginTop: 8,
    padding: 8,
    backgroundColor: "#e74c3c",
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  clearLocationText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  submitSection: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingBottom: Platform.OS === "ios" ? 34 : 16,
  },
  submitButton: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#ccc",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  submitButtonTextDisabled: {
    color: "#999",
  },
  errorText: {
    color: "#e74c3c",
    fontSize: 14,
    marginTop: 4,
  },
  loadingText: {
    color: "#666",
    fontStyle: "italic",
    marginTop: 4,
    fontSize: 14,
  },
});
