import { View, Text, TouchableOpacity, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View className="flex-1">
      <LinearGradient
        colors={["#0A5E58", "#0D7B74", "#12A09A"]}
        className="flex-1 items-center justify-center px-6"
      >
        <View className="w-20 h-20 bg-white/15 rounded-3xl items-center justify-center border border-white/25 mb-5 shadow-lg">
          <Text className="text-4xl">🦷</Text>
        </View>
        
        <Text className="text-white text-4xl font-cormorant font-semibold tracking-wider">
          DentiLens
        </Text>
        <Text className="text-white/65 text-xs uppercase tracking-widest mt-2">
          Precision Dental Analytics
        </Text>

        <View className="absolute bottom-16 left-6 right-6 gap-3">
          <TouchableOpacity 
            onPress={() => router.push("/(auth)/login")}
            className="bg-white p-4 rounded-2xl items-center shadow-md active:scale-95 transition-transform"
          >
            <Text className="text-teal font-bold text-base tracking-tight">Get Started</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => router.push("/(auth)/signup")}
            className="bg-white/10 p-4 rounded-2xl items-center border border-white/30 active:bg-white/20"
          >
            <Text className="text-white font-medium text-base">Create Account</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}
