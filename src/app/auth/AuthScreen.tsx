// src/app/auth/AuthScreen.tsx

import { type JSX, useEffect, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Import the auth service functions
import {
  configureGoogleSignIn,
  handleEmailAuth,
  handleGoogleSignIn,
  handlePasswordReset,
} from "@/services/auth";
// The path for @/services/auth is crucial!

const AuthScreen = (): JSX.Element => {
  // State for the form UI remains
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Configure Google Sign-In only once
  useEffect((): void => {
    // This calls the GoogleSignin.configure() method
    configureGoogleSignIn();
  }, []);

  // --- Handlers using the imported service functions ---

  // NOTE: These internal component handlers are kept simple,
  // focusing only on UI state (loading/error) and calling the service.

  const handleAuthSubmit = async (): Promise<void> => {
    setLoading(true);
    setError("");

    const result = await handleEmailAuth(email, password, isLogin);

    if (result !== "success") {
      setError(result);
    }
    // Success (result === "success") is handled by the RootLayout's Auth Guard.
    setLoading(false);
  };

  const handleResetSubmit = async (): Promise<void> => {
    setLoading(true);
    setError("");

    const result = await handlePasswordReset(email);
    // Password reset uses the error state to display a success/failure message
    setError(result);
    setLoading(false);
  };

  const handleGoogleSubmit = async (): Promise<void> => {
    setLoading(true);
    setError("");

    const result = await handleGoogleSignIn();

    if (result !== "success") {
      setError(result);
    }
    setLoading(false);
  };

  // --- UI Rendering ---
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.logo}>FlatFinder</Text>
        <Text style={styles.title}>
          {isLogin ? "Sign In" : "Create an account"}
        </Text>
        <Text style={styles.subtitle}>
          Enter your email to {isLogin ? "sign in" : "sign up"} for this app
        </Text>

        {error ? (
          <Text
            style={[
              styles.errorText,
              // Check for success messages (like password reset sent)
              error.includes("sent") && styles.successText,
            ]}
          >
            {error}
          </Text>
        ) : null}

        <TextInput
          style={styles.input}
          placeholder="email@domain.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#888"
        />
        <TextInput
          style={styles.input}
          placeholder="password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#888"
        />

        {isLogin && (
          <TouchableOpacity
            // Refactored: Call handler directly with 'void' to suppress warning
            onPress={() => void handleResetSubmit()}
            style={styles.forgotPassword}
          >
            <Text style={styles.link}>Forgot password?</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.button}
          // Refactored: Call handler directly with 'void'
          onPress={() => void handleAuthSubmit()}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Loading..." : isLogin ? "Sign In" : "Sign Up"}
          </Text>
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={styles.socialButton}
          // Refactored: Call handler directly with 'void'
          onPress={() => void handleGoogleSubmit()}
          disabled={loading}
        >
          <Image
            source={{
              uri: "https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg",
            }}
            style={styles.socialIcon}
          />
          <Text style={styles.socialButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <Text style={styles.termsText}>
          By clicking continue, you agree to our{" "}
          <Text style={styles.link}>Terms of Service</Text> and{" "}
          <Text style={styles.link}>Privacy Policy</Text>
        </Text>

        <TouchableOpacity
          onPress={() => {
            setIsLogin(!isLogin);
            // Clear errors and password when toggling mode
            setError("");
            setPassword("");
          }}
          style={styles.toggleButton}
        >
          <Text style={styles.toggleText}>
            {isLogin
              ? "Need an account? Sign Up"
              : "Already have an account? Sign In"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ... (Styles remain the same) ...

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 32,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  logo: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 40,
    letterSpacing: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    marginBottom: 16,
  },
  button: {
    width: "100%",
    backgroundColor: "#3B82F6",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#D1D5DB",
  },
  dividerText: {
    marginHorizontal: 16,
    color: "#6B7280",
    fontSize: 14,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    marginBottom: 16,
  },
  socialIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4B5563",
  },
  termsText: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 16,
  },
  link: {
    color: "#3B82F6",
    textDecorationLine: "underline",
  },
  toggleButton: {
    marginTop: 16,
  },
  toggleText: {
    color: "#3B82F6",
    fontWeight: "600",
    fontSize: 14,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 8,
  },
  errorText: {
    color: "#DC2626",
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    width: "100%",
    textAlign: "center",
  },
  successText: {
    color: "#065F46",
    backgroundColor: "#D1FAE5",
    borderColor: "#10B981",
    borderWidth: 1,
  },
  // All other styles (protected, loading) are left here for completeness
  // but are not used since the Auth Guard logic is outside this component.
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4F46E5",
  },
  protectedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E0F2F1",
    padding: 32,
  },
  protectedTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#047857",
    marginBottom: 16,
  },
  protectedText: {
    fontSize: 18,
    color: "#065F46",
    marginBottom: 8,
  },
  protectedEmail: {
    fontSize: 16,
    fontWeight: "500",
    color: "#065F46",
    marginBottom: 4,
  },
  protectedButton: {
    backgroundColor: "#EF4444",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginTop: 24,
    marginBottom: 16,
  },
  protectedButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  protectedInfo: {
    fontSize: 12,
    color: "#065F46",
    marginTop: 40,
    fontStyle: "italic",
    textAlign: "center",
  },
});

export default AuthScreen;
