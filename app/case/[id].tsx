import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Dimensions, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Share, Sparkles, Clock, MapPin, User as UserIcon } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export default function CaseDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [sliderPos, setSliderPos] = useState(0.5);

  return (
    <ScrollView className="flex-1 bg-surface" showsVerticalScrollIndicator={false} bounces={false}>
      {/* Header Image / Comparison Area */}
      <View className="h-80 bg-ink relative">
        {/* "After" side (Right) */}
        <View className="absolute inset-0 bg-teal-light items-center justify-center">
           <Text className="text-8xl">😁</Text>
        </View>

        {/* "Before" side (Left) */}
        <View 
          className="absolute inset-0 bg-[#C4A882] items-center justify-center overflow-hidden"
          style={{ width: width * sliderPos }}
        >
           <View style={{ width: width }}>
             <Text className="text-8xl text-center opacity-70 grayscale">😬</Text>
           </View>
        </View>

        {/* Slider Handle */}
        <View 
          className="absolute top-0 bottom-0 w-1 bg-white items-center justify-center z-20"
          style={{ left: width * sliderPos }}
        >
          <TouchableOpacity 
            className="w-10 h-10 bg-white rounded-full shadow-lg items-center justify-center"
            activeOpacity={1}
          >
             <Text className="text-ink font-bold">↔</Text>
          </TouchableOpacity>
        </View>

        {/* Labels */}
        <View className="absolute bottom-4 left-0 right-0 flex-row justify-between px-6 z-10">
          <View className="bg-black/50 px-3 py-1 rounded-full">
            <Text className="text-white text-[10px] font-bold">BEFORE</Text>
          </View>
          <View className="bg-teal px-3 py-1 rounded-full">
            <Text className="text-white text-[10px] font-bold">AFTER AI</Text>
          </View>
        </View>

        {/* Top Controls */}
        <View className="absolute top-12 left-6 right-6 flex-row justify-between items-center z-30">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 bg-black/40 rounded-full items-center justify-center"
          >
            <ChevronLeft size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity className="w-10 h-10 bg-black/40 rounded-full items-center justify-center">
            <Share size={18} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="p-6">
        <View className="flex-row justify-between items-start mb-6">
          <View>
            <Text className="text-ink text-2xl font-cormorant font-semibold">Patient #8821 Analysis</Text>
            <View className="flex-row items-center mt-1">
              <Clock size={12} color="#7A9190" />
              <Text className="text-muted text-[11px] ml-1">Captured May 16, 2026 • 10:24 AM</Text>
            </View>
          </View>
          <View className="bg-teal/10 px-3 py-1 rounded-full">
            <Text className="text-teal text-[10px] font-bold">HIGH CONFIDENCE</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-3 mb-8">
          <TouchableOpacity className="flex-1 bg-teal p-4 rounded-2xl flex-row items-center justify-center shadow-sm">
            <Sparkles size={18} color="white" className="mr-2" />
            <Text className="text-white font-bold text-sm">Enhance</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 bg-white border border-line p-4 rounded-2xl items-center justify-center">
            <Text className="text-ink font-bold text-sm">Compare 3D</Text>
          </TouchableOpacity>
        </View>

        {/* Case Info Info */}
        <View className="bg-white rounded-3xl p-5 border border-line shadow-sm">
          <Text className="text-muted text-[10px] font-bold uppercase tracking-widest mb-4">Case Details</Text>
          
          <View className="flex-row items-center py-3 border-b border-line">
            <UserIcon size={16} color="#7A9190" />
            <Text className="text-muted text-xs ml-3">Patient ID</Text>
            <Text className="text-ink font-semibold text-xs ml-auto">P-8821-NYC</Text>
          </View>

          <View className="flex-row items-center py-3 border-b border-line">
            <MapPin size={16} color="#7A9190" />
            <Text className="text-muted text-xs ml-3">Position</Text>
            <Text className="text-ink font-semibold text-xs ml-auto">Lower Left Molar</Text>
          </View>

          <View className="mt-4">
            <Text className="text-muted text-xs mb-2">Doctor's Notes</Text>
            <View className="bg-teal-light rounded-xl p-3">
              <Text className="text-ink-soft text-xs leading-5">
                Initial intraoral scan indicates slight enamel wear on the second molar. 
                AI analysis suggests 12% improvement after preventive treatment protocol.
              </Text>
            </View>
          </View>
        </View>
      </View>
      
      <View className="pb-20" />
    </ScrollView>
  );
}
