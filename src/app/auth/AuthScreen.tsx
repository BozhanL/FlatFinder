import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  // ADDED: Listener for auth state changes
  onAuthStateChanged,
  // ADDED: Function to send password reset email
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
  // ADDED: SignOut function
  signOut
} from '@react-native-firebase/auth';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { useEffect, useState } from 'react';
import { Image, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// --- PROTECTED CONTENT COMPONENT ---
// This is the placeholder screen users see when they are successfully logged in.
const UserStatusScreen = ({ user, handleSignOut }) => (
    <View style={styles.protectedContainer}>
        <Text style={styles.protectedTitle}>Welcome to FlatFinder!</Text>
        <Text style={styles.protectedText}>You are successfully authenticated.</Text>
        <Text style={styles.protectedEmail}>User: {user.email || 'Anonymous'}</Text>
        <Text style={styles.protectedEmail}>UID: {user.uid}</Text>
        <TouchableOpacity style={styles.protectedButton} onPress={handleSignOut}>
            <Text style={styles.protectedButtonText}>Sign Out</Text>
        </TouchableOpacity>
        <Text style={styles.protectedInfo}>
          This screen acts as the **Protected Content** that the Auth Guard shows.
        </Text>
    </View>
);
// --- END PROTECTED CONTENT COMPONENT ---


const AuthScreen = () => {
  // --- ADDED: STATES FOR AUTH GUARD ---
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  // --- END ADDED STATES ---
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // --- ADDED: AUTH STATE LISTENER (THE GUARD LOGIC) ---
  useEffect(() => {
      const auth = getAuth();
      // Subscribe to auth state changes
      const subscriber = onAuthStateChanged(auth, (currentUser) => {
          setUser(currentUser);
          if (isAuthLoading) {
              setIsAuthLoading(false);
          }
      });
      // Unsubscribe when the component unmounts
      return subscriber; 
  }, []); 

  // --- ADDED: Sign Out Handler ---
  const handleSignOut = async () => {
      try {
          await signOut(getAuth());
      } catch (e) {
          console.error("Sign Out Error:", e);
      }
  };
  // --- END ADDED HANDLER ---


  // Configure Google Sign-In on component mount for Android
  useEffect(() => {
    // This key is the "Web Client ID" (Client Type 3) found in your Firebase project settings.
    if (Platform.OS !== 'web') {
      GoogleSignin.configure({
        webClientId: '245824951682-5f4jdid4ri95nl1qjh9qivkkbga2nem3.apps.googleusercontent.com', 
      });
    }
  }, []); 

  const handleAuth = async () => {
    setLoading(true);
    setError('');

    try {
      // Modular API for Email/Password
      if (isLogin) {
        await signInWithEmailAndPassword(getAuth(), email, password);
      } else {
        await createUserWithEmailAndPassword(getAuth(), email, password);
      }
    } catch (e) {
      let errorMessage = "An unknown error occurred.";
      if (e.code === 'auth/email-already-in-use') {
        errorMessage = 'That email address is already in use!';
      } else if (e.code === 'auth/invalid-email') {
        errorMessage = 'That email address is invalid!';
      } else if (e.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.';
      } else if (e.code === 'auth/user-not-found' || e.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password.';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ADDED: Password Reset Function
  const handlePasswordReset = async () => {
    if (!email) {
      setError("Please enter your email address above to receive a password reset link.");
      return;
    }
    setLoading(true);
    setError('');

    try {
      // Use the modular sendPasswordResetEmail function
      await sendPasswordResetEmail(getAuth(), email);
      
      // Set success message, not error message
      setError('Password reset link sent to your email! Please check your inbox (and spam folder).');
      
    } catch (e) {
      let errorMessage = "Failed to send password reset email.";
      if (e.code === 'auth/user-not-found' || e.code === 'auth/invalid-email') {
        errorMessage = "We couldn't find an account associated with that email address.";
      } else if (e.message) {
        errorMessage = e.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  // END ADDED: Password Reset Function


  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Check if Google Play Services are available (Critical for Android)
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      
      // 2. Start the Google Sign-In process (opens native prompt)
      const signInResult = await GoogleSignin.signIn();
      
      // 3. Robust token retrieval (as provided in the docs)
      let idToken = signInResult.data?.idToken;
      if (!idToken) {
        // Fallback for older versions of @react-native-google-signin/google-signin
        idToken = signInResult.idToken;
      }
      if (!idToken) {
        throw new Error('No ID token found from Google Sign-In result.');
      }
      
      // 4. Create a Google credential with the token (Modular API)
      const googleCredential = GoogleAuthProvider.credential(idToken);
      
      // 5. Sign the user into Firebase (Modular API)
      await signInWithCredential(getAuth(), googleCredential);
      
    } catch (e) {
      
      // Defensive check for the error object to prevent TypeError
      if (!e || typeof e !== 'object') {
        const defaultError = "Sign-in failed with an unexpected or corrupted error.";
        console.error("Google Sign-In Error: Error object was missing or invalid.", e);
        setError(defaultError);
        setLoading(false); 
        return; 
      }

      let errorMessage = "An unknown error occurred during Google sign-in.";
      
      // Handle Google Sign-In library specific errors
      if (e.code === statusCodes.SIGN_IN_CANCELLED) {
        errorMessage = 'Sign-in cancelled by the user.';
      } else if (e.code === statusCodes.IN_PROGRESS) {
        errorMessage = 'Sign-in is already in progress.';
      } else if (e.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        errorMessage = 'Google Play services are not available on this device.';
      } else if (e.code === statusCodes.HAS_NO_CONTEXT) {
        errorMessage = 'Sign-in failed due to missing context.';
      } 
      // Handle Firebase errors
      else if (e.code === 'auth/operation-not-allowed') {
        errorMessage = 'Google Sign-In is not enabled. Please enable it in the Firebase console.';
      } else if (e.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'An account with this email already exists using a different sign-in method.';
      } else if (e.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid credential. Check your webClientId configuration.';
      } else if (e.message) {
         // Fallback for general errors
         errorMessage = e.message;
      }
      
      console.error("Google Sign-In Error:", e);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  // --- GUARD CHECK RENDERING ---
  // 1. Show a loading screen while checking the initial auth state.
  if (isAuthLoading) {
      return (
          <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Checking authentication status...</Text>
          </View>
      );
  }
  
  // 2. If the user is logged in (i.e., the guard passes), show the protected content.
  if (user) {
      return <UserStatusScreen user={user} handleSignOut={handleSignOut} />;
  }

  // 3. Otherwise (user is NOT logged in), show the authentication screen.
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.logo}>FlatFinder</Text>
        <Text style={styles.title}>{isLogin ? 'Sign In' : 'Create an account'}</Text>
        <Text style={styles.subtitle}>
          Enter your email to {isLogin ? 'sign in' : 'sign up'} for this app
        </Text>

        {/* Note: The error state is now also used for success messages */}
        {error ? <Text style={[styles.errorText, error.includes('sent') && styles.successText]}>{error}</Text> : null}

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
            <TouchableOpacity onPress={handlePasswordReset} style={styles.forgotPassword}>
                <Text style={styles.link}>Forgot password?</Text>
            </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={styles.button}
          onPress={handleAuth}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Sign Up')}</Text>
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>
        
        <TouchableOpacity
          style={styles.socialButton}
          onPress={handleGoogleSignIn}
          disabled={loading}
        >
          <Image
            source={{ uri: 'https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg' }}
            style={styles.socialIcon}
          />
          <Text style={styles.socialButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <Text style={styles.termsText}>
          By clicking continue, you agree to our{' '}
          <Text style={styles.link}>Terms of Service</Text> and{' '}
          <Text style={styles.link}>Privacy Policy</Text>
        </Text>

        <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.toggleButton}>
          <Text style={styles.toggleText}>
            {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Sign In'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
    letterSpacing: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    marginBottom: 16,
  },
  button: {
    width: '100%',
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#D1D5DB',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#6B7280',
    fontSize: 14,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
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
    fontWeight: '600',
    color: '#4B5563',
  },
  termsText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
  },
  link: {
    color: '#3B82F6',
    textDecorationLine: 'underline',
  },
  toggleButton: {
    marginTop: 16,
  },
  toggleText: {
    color: '#3B82F6',
    fontWeight: '600',
    fontSize: 14,
  },
  // Style for the Forgot Password link positioning
  forgotPassword: {
    alignSelf: 'flex-end', 
    marginBottom: 8,
  },
  errorText: {
    color: '#DC2626',
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    width: '100%',
    textAlign: 'center',
  },
  // Style for success message (like password reset confirmation)
  successText: {
    color: '#065F46', // Dark green text
    backgroundColor: '#D1FAE5', // Light green background
    borderColor: '#10B981', // Green border for better contrast
    borderWidth: 1,
  },
  // --- ADDED STYLES FOR GUARD AND PROTECTED SCREEN ---
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4F46E5', // Indigo color
  },
  protectedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E0F2F1', // Light teal background
    padding: 32,
  },
  protectedTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#047857', // Dark teal
    marginBottom: 16,
  },
  protectedText: {
    fontSize: 18,
    color: '#065F46',
    marginBottom: 8,
  },
  protectedEmail: {
    fontSize: 16,
    fontWeight: '500',
    color: '#065F46',
    marginBottom: 4,
  },
  protectedButton: {
    backgroundColor: '#EF4444', // Red for sign out
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginTop: 24,
    marginBottom: 16,
  },
  protectedButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  protectedInfo: {
      fontSize: 12,
      color: '#065F46',
      marginTop: 40,
      fontStyle: 'italic',
      textAlign: 'center'
  }
});

export default AuthScreen;
