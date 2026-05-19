import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Fingerprint, Mail, Lock, ArrowRight } from "lucide-react-native";

export default function LoginScreen() {
  const router = useRouter();

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      className="flex-1 bg-surface"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false}>
        <View className="h-64 bg-teal overflow-hidden">
          <LinearGradient
            colors={["#0A5E58", "#0D7B74"]}
            className="flex-1 justify-end p-8"
          >
            <View className="w-14 h-14 bg-white/15 rounded-2xl items-center justify-center border border-white/20 mb-3">
              <Text className="text-2xl">🦷</Text>
            </View>
            <Text className="text-white text-3xl font-cormorant font-semibold leading-tight">
              Welcome back to{"\n"}DentiLens
            </Text>
            <Text className="text-white/60 text-xs mt-1">Sign in to manage your cases</Text>
          </LinearGradient>
        </View>

        <View className="p-7">
          <View className="mb-4">
            <Text className="text-muted text-[10px] font-bold uppercase tracking-widest mb-1.5">Email Address</Text>
            <View className="flex-row items-center bg-white border border-line rounded-xl px-4 py-3.5 focus:border-teal">
              <Mail size={18} color="#7A9190" className="mr-3" />
              <TextInput 
                placeholder="dr.smith@clinic.com"
                placeholderTextColor="#7A9190"
                className="flex-1 font-outfit text-sm text-ink"
              />
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-muted text-[10px] font-bold uppercase tracking-widest mb-1.5">Password</Text>
            <View className="flex-row items-center bg-white border border-line rounded-xl px-4 py-3.5 focus:border-teal">
              <Lock size={18} color="#7A9190" className="mr-3" />
              <TextInput 
                placeholder="••••••••"
                placeholderTextColor="#7A9190"
                secureTextEntry
                className="flex-1 font-outfit text-sm text-ink"
              />
            </View>
          </View>

          <View className="flex-row gap-2.5">
            <TouchableOpacity 
              onPress={() => router.replace("/(tabs)")}
              className="flex-1 bg-teal p-4 rounded-xl items-center justify-center flex-row shadow-sm active:scale-[0.98]"
            >
              <Text className="text-white font-bold text-base mr-2">Login</Text>
              <ArrowRight size={18} color="white" />
            </TouchableOpacity>

            <TouchableOpacity className="w-14 h-14 bg-white border border-line rounded-xl items-center justify-center active:bg-teal-light">
              <Fingerprint size={24} color="#0D7B74" />
            </TouchableOpacity>
          </View>

          <View className="mt-8 items-center">
            <Text className="text-muted text-xs">
              Don't have an account?{" "}
              <Text 
                onPress={() => router.push("/(auth)/signup")}
                className="text-teal font-semibold"
              >
                Sign Up
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
