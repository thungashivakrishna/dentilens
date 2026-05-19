import { useState, useRef } from "react";
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { X, Zap, RefreshCcw, Image as ImageIcon, Camera } from "lucide-react-native";
import { useRouter } from "expo-router";

export default function CameraScreen() {
  const [facing, setFacing] = useState<"back" | "front">("back");
  const [permission, requestPermission] = useCameraPermissions();
  const router = useRouter();

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center bg-ink p-6">
        <Text className="text-white text-lg text-center mb-6">We need your permission to show the camera</Text>
        <TouchableOpacity 
          onPress={requestPermission}
          className="bg-teal px-8 py-4 rounded-2xl"
        >
          <Text className="text-white font-bold">Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === "back" ? "front" : "back"));
  }

  return (
    <View className="flex-1 bg-black">
      <CameraView style={StyleSheet.absoluteFill} facing={facing}>
        {/* Top Controls */}
        <SafeAreaView className="flex-1">
          <View className="flex-row justify-between items-center px-6 py-4">
            <TouchableOpacity 
              onPress={() => router.back()}
              className="w-10 h-10 bg-black/40 rounded-full items-center justify-center"
            >
              <X size={20} color="white" />
            </TouchableOpacity>
            
            <View className="flex-row bg-black/40 rounded-full p-1 gap-1">
              {["Intra", "Extra", "3D"].map((mode, i) => (
                <TouchableOpacity 
                  key={mode}
                  className={`px-4 py-1.5 rounded-full ${i === 0 ? 'bg-white' : ''}`}
                >
                  <Text className={`text-[10px] font-bold ${i === 0 ? 'text-ink' : 'text-white/60'}`}>
                    {mode}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity className="w-10 h-10 bg-black/40 rounded-full items-center justify-center">
              <Zap size={18} color="white" />
            </TouchableOpacity>
          </View>

          {/* Grid/Alignment Overlay */}
          <View className="flex-1 items-center justify-center">
             <View className="w-64 h-48 border border-white/30 rounded-3xl items-center justify-center">
                <View className="w-10 h-0.5 bg-white/50 absolute top-0" />
                <View className="w-10 h-0.5 bg-white/50 absolute bottom-0" />
                <View className="h-10 w-0.5 bg-white/50 absolute left-0" />
                <View className="h-10 w-0.5 bg-white/50 absolute right-0" />
                <Text className="text-white/30 text-[10px] font-bold uppercase tracking-widest">Align Teeth</Text>
             </View>
          </View>

          {/* Bottom Controls */}
          <View className="px-10 pb-12 flex-row justify-between items-center">
            <TouchableOpacity className="w-14 h-14 bg-teal-mid/20 border border-white/20 rounded-xl items-center justify-center">
              <ImageIcon size={26} color="white" />
            </TouchableOpacity>

            <TouchableOpacity className="w-20 h-20 bg-white rounded-full p-1.5 shadow-xl">
              <View className="flex-1 rounded-full border-2 border-ink items-center justify-center">
                <View className="w-full h-full bg-white rounded-full items-center justify-center">
                  <Camera size={32} color="#111B1A" />
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={toggleCameraFacing}
              className="w-14 h-14 bg-white/15 rounded-full items-center justify-center"
            >
              <RefreshCcw size={22} color="white" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </CameraView>
    </View>
  );
}
