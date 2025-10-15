/* istanbul ignore file */
// This file contains only StyleSheet.
// No need to test it in unit tests.
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#e74c3c",
    textAlign: "center",
    fontSize: 16,
  },
  floatingTile: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  tileContent: {
    padding: 16,
  },
  tileHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  tileTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  tilePrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563eb",
    marginBottom: 2,
  },
  tileType: {
    fontSize: 12,
    color: "#666",
    textTransform: "capitalize",
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 16,
    color: "#666",
  },
  expandButton: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  expandButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  postButton: {
    position: "absolute",
    bottom: 20,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2563eb",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  postButtonText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "300",
    lineHeight: 24,
  },
});
