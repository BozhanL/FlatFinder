import auth from "@react-native-firebase/auth";
import { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        // Sign In
        await auth().signInWithEmailAndPassword(email, password);
      } else {
        // Register
        await auth().createUserWithEmailAndPassword(email, password);
      }
    } catch (e) {
      let errorMessage = "An unknown error occurred.";
      if (e.code === "auth/email-already-in-use") {
        errorMessage = "That email address is already in use!";
      } else if (e.code === "auth/invalid-email") {
        errorMessage = "That email address is invalid!";
      } else if (e.code === "auth/weak-password") {
        errorMessage = "Password should be at least 6 characters.";
      } else if (
        e.code === "auth/user-not-found" ||
        e.code === "auth/wrong-password"
      ) {
        errorMessage = "Invalid email or password.";
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignIn = (provider) => {
    // This is a placeholder for social sign-in logic
    console.log(`Attempting to sign in with ${provider}.`);
  };

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

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

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
        <TouchableOpacity
          style={styles.button}
          onPress={handleAuth}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Loading..." : "Continue"}
          </Text>
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={styles.socialButton}
          onPress={() => handleSocialSignIn("Google")}
        >
          <Image
            source={{
              uri: "https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg",
            }}
            style={styles.socialIcon}
          />
          <Text style={styles.socialButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.socialButton}
          onPress={() => handleSocialSignIn("Apple")}
        >
          <Image
            source={{
              uri: "https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/apple.svg",
            }}
            style={styles.socialIcon}
          />
          <Text style={styles.socialButtonText}>Continue with Apple</Text>
        </TouchableOpacity>

        <Text style={styles.termsText}>
          By clicking continue, you agree to our{" "}
          <Text style={styles.link}>Terms of Service</Text> and{" "}
          <Text style={styles.link}>Privacy Policy</Text>
        </Text>

        <TouchableOpacity
          onPress={() => setIsLogin(!isLogin)}
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
  errorText: {
    color: "#DC2626",
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    width: "100%",
    textAlign: "center",
  },
});

export default AuthScreen;
