import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { User, Shield, Mail, Lock, ArrowRight } from "lucide-react-native";
import { supabase } from "../../services/supabase";

export default function SignupScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!fullName || !clinicName || !email || !password) {
      Alert.alert("Missing Fields", "Please fill in all the required fields.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Weak Password", "Password should be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            clinic_name: clinicName,
          },
        },
      });

      if (error) {
        Alert.alert("Registration Failed", error.message);
      } else {
        Alert.alert(
          "Registration Successful",
          "Your account has been registered! Please check your email for verification (if enabled) or log in.",
          [
            {
              text: "OK",
              onPress: () => {
                if (data.session) {
                  // If auto-logged in or session exists, root layout will redirect to /(tabs)
                  console.log("Registered and auto-logged in:", data.user?.email);
                } else {
                  // Redirect to login if confirmation email is required
                  router.replace("/(auth)/login");
                }
              }
            }
          ]
        );
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "An unexpected error occurred during signup.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      className="flex-1 bg-surface"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false}>
        <View className="h-56 bg-teal overflow-hidden">
          <LinearGradient
            colors={["#0A5E58", "#0D7B74"]}
            className="flex-1 justify-end p-8"
          >
            <View className="w-14 h-14 bg-white/15 rounded-2xl items-center justify-center border border-white/20 mb-3">
              <Text className="text-2xl">🦷</Text>
            </View>
            <Text className="text-white text-3xl font-cormorant font-semibold leading-tight">
              Create Account
            </Text>
            <Text className="text-white/60 text-xs mt-1">Join DentiLens as a healthcare provider</Text>
          </LinearGradient>
        </View>

        <View className="p-7">
          <View className="mb-4">
            <Text className="text-muted text-[10px] font-bold uppercase tracking-widest mb-1.5">Full Name</Text>
            <View className="flex-row items-center bg-white border border-line rounded-xl px-4 py-3.5 focus:border-teal">
              <User size={18} color="#7A9190" className="mr-3" />
              <TextInput 
                placeholder="Dr. Sarah Smith"
                placeholderTextColor="#7A9190"
                autoCapitalize="words"
                value={fullName}
                onChangeText={setFullName}
                className="flex-1 font-outfit text-sm text-ink"
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-muted text-[10px] font-bold uppercase tracking-widest mb-1.5">Clinic Name</Text>
            <View className="flex-row items-center bg-white border border-line rounded-xl px-4 py-3.5 focus:border-teal">
              <Shield size={18} color="#7A9190" className="mr-3" />
              <TextInput 
                placeholder="Apex Dental Care"
                placeholderTextColor="#7A9190"
                autoCapitalize="words"
                value={clinicName}
                onChangeText={setClinicName}
                className="flex-1 font-outfit text-sm text-ink"
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-muted text-[10px] font-bold uppercase tracking-widest mb-1.5">Email Address</Text>
            <View className="flex-row items-center bg-white border border-line rounded-xl px-4 py-3.5 focus:border-teal">
              <Mail size={18} color="#7A9190" className="mr-3" />
              <TextInput 
                placeholder="dr.smith@clinic.com"
                placeholderTextColor="#7A9190"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                className="flex-1 font-outfit text-sm text-ink"
              />
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-muted text-[10px] font-bold uppercase tracking-widest mb-1.5">Password</Text>
            <View className="flex-row items-center bg-white border border-line rounded-xl px-4 py-3.5 focus:border-teal">
              <Lock size={18} color="#7A9190" className="mr-3" />
              <TextInput 
                placeholder="•••••••• (Min 6 chars)"
                placeholderTextColor="#7A9190"
                secureTextEntry
                autoCapitalize="none"
                value={password}
                onChangeText={setPassword}
                className="flex-1 font-outfit text-sm text-ink"
              />
            </View>
          </View>

          <TouchableOpacity 
            onPress={handleSignup}
            disabled={loading}
            className="bg-teal p-4 rounded-xl items-center justify-center flex-row shadow-sm active:scale-[0.98] disabled:opacity-70"
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <Text className="text-white font-bold text-base mr-2">Sign Up</Text>
                <ArrowRight size={18} color="white" />
              </>
            )}
          </TouchableOpacity>

          <View className="mt-8 items-center">
            <Text className="text-muted text-xs">
              Already have an account?{" "}
              <Text 
                onPress={() => router.replace("/(auth)/login")}
                className="text-teal font-semibold font-outfit"
              >
                Login
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
