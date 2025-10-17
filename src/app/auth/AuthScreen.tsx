import {
  handleAuth,
  handleGoogleSignIn,
  handlePasswordReset,
} from "@/services/auth";
import { Image } from "expo-image";
import { useCallback, useState, type JSX } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function AuthScreen(): JSX.Element {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [returned, setReturned] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const onAuth = useCallback(async () => {
    setLoading(true);
    const result = await handleAuth(isLogin, email, password);
    setLoading(false);
    setReturned(result ?? "");
  }, [isLogin, email, password]);

  const onPasswordReset = useCallback(async () => {
    setLoading(true);
    const result = await handlePasswordReset(email);
    setLoading(false);
    setReturned(
      result ??
        "Password reset link sent to your email! Please check your inbox (and spam folder).",
    );
  }, [email]);

  const onGoogleSignIn = useCallback(async () => {
    setLoading(true);
    const result = await handleGoogleSignIn();
    setLoading(false);
    setReturned(result ?? "");
  }, []);

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

        {/* Note: The error state is now also used for success messages */}
        {returned ? (
          <Text
            style={[
              styles.errorText,
              returned.includes("sent") && styles.successText,
            ]}
          >
            {returned}
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

        {/* Forgot Password Link (only visible during sign in) */}
        {isLogin && (
          <TouchableOpacity
            onPress={() => void onPasswordReset()}
            style={styles.forgotPassword}
          >
            <Text style={styles.link}>Forgot password?</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.button}
          onPress={() => void onAuth()}
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
          onPress={() => void onGoogleSignIn()}
          disabled={loading}
        >
          <Image
            source={require("assets/images/google.svg")}
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
}

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
  // Style for the Forgot Password link positioning
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
  // Style for success message (like password reset confirmation)
  successText: {
    color: "#065F46", // Dark green text
    backgroundColor: "#D1FAE5", // Light green background
    borderColor: "#10B981", // Green border for better contrast
    borderWidth: 1,
  },
  // --- ADDED STYLES FOR GUARD AND PROTECTED SCREEN ---
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4F46E5", // Indigo color
  },
  protectedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E0F2F1", // Light teal background
    padding: 32,
  },
  protectedTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#047857", // Dark teal
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
    backgroundColor: "#EF4444", // Red for sign out
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
