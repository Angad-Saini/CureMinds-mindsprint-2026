
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../../services/supabase";
import { Lock, Mail, User, Sparkles } from "lucide-react-native";

type Props = {
  onLogin: (role: "patient" | "caretaker") => void;
};

export default function LoginScreen({ onLogin }: Props) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing details", "Please enter your email and password.");
      return;
    }

    if (isRegistering && !name.trim()) {
      Alert.alert("Missing name", "Please enter your full name.");
      return;
    }

    setLoading(true);

    try {
      if (isRegistering) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: name.trim() },
          },
        });

        if (error) throw error;

        if (!data.session) {
          Alert.alert(
            "Check your email",
            "Your account was created. Verify your email, then log in."
          );
          setIsRegistering(false);
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;
      }

      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError) throw userError;
      if (!userData.user) throw new Error("Unable to find your account.");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userData.user.id)
        .single();

      if (profileError) throw profileError;

      if (profile.role !== "patient" && profile.role !== "caretaker") {
        throw new Error("Your account does not have a valid role.");
      }

      onLogin(profile.role);
    } catch (error: any) {
      Alert.alert("Authentication failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logo}>
          <Sparkles size={34} color="#7955D9" />
        </View>

        <Text style={styles.brand}>CureMinds</Text>
        <Text style={styles.tagline}>Care that remembers.</Text>

        <Text style={styles.heading}>
          {isRegistering ? "Create your account" : "Welcome back"}
        </Text>

        <Text style={styles.subtitle}>
          {isRegistering
            ? "Let's get you started."
            : "Sign in to continue to your account."}
        </Text>

        {isRegistering && (
          <View style={styles.inputContainer}>
            <User size={19} color="#858096" />
            <TextInput
              style={styles.input}
              placeholder="Full name"
              placeholderTextColor="#A6A1B3"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>
        )}

        <View style={styles.inputContainer}>
          <Mail size={19} color="#858096" />
          <TextInput
            style={styles.input}
            placeholder="Email address"
            placeholderTextColor="#A6A1B3"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <Lock size={19} color="#858096" />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#A6A1B3"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleAuth}
          disabled={loading}
        >
          <LinearGradient
            colors={["#7955D9", "#9878E9"]}
            style={styles.submitButton}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitText}>
                {isRegistering ? "Create Account" : "Sign In"}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.switchButton}
          onPress={() => setIsRegistering(!isRegistering)}
        >
          <Text style={styles.switchText}>
            {isRegistering
              ? "Already have an account? Sign in"
              : "New to CureMinds? Create an account"}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>CureMinds · Care that remembers</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F5FC",
    justifyContent: "center",
    paddingHorizontal: 26,
  },
  content: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
  },
  logo: {
    width: 66,
    height: 66,
    borderRadius: 22,
    backgroundColor: "#EEE8FF",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 15,
  },
  brand: {
    fontSize: 32,
    fontWeight: "800",
    color: "#53349D",
    textAlign: "center",
  },
  tagline: {
    color: "#858096",
    textAlign: "center",
    marginTop: 5,
    marginBottom: 38,
    fontSize: 14,
  },
  heading: {
    fontSize: 25,
    fontWeight: "800",
    color: "#28243A",
  },
  subtitle: {
    fontSize: 14,
    color: "#858096",
    marginTop: 7,
    marginBottom: 25,
  },
  inputContainer: {
    height: 56,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EAE7F1",
    borderRadius: 15,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  input: {
    flex: 1,
    color: "#28243A",
    fontSize: 15,
    outlineStyle: "none",
  } as any,
  submitButton: {
    height: 56,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  switchButton: {
    marginTop: 23,
    alignItems: "center",
  },
  switchText: {
    color: "#7955D9",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  footer: {
    position: "absolute",
    bottom: 25,
    alignSelf: "center",
    color: "#A6A1B3",
    fontSize: 11,
  },
});
