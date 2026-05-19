import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Dimensions, Image, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Share, Sparkles, Clock, MapPin, User as UserIcon, Check } from "lucide-react-native";
import { CasesService, DentalCase } from "../../services/cases";

const { width } = Dimensions.get("window");

export default function CaseDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [item, setItem] = useState<DentalCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [enhancing, setEnhancing] = useState(false);
  const [sliderPos, setSliderPos] = useState(0.5);

  const loadCase = async () => {
    if (!id || typeof id !== "string") return;
    try {
      const data = await CasesService.fetchCaseById(id);
      setItem(data);
    } catch (err) {
      console.error("Error fetching case details:", err);
      Alert.alert("Error", "Could not load case details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCase();
  }, [id]);

  const handleTouch = (event: any) => {
    const touchX = event.nativeEvent.pageX || event.nativeEvent.locationX;
    const newPos = Math.max(0, Math.min(1, touchX / width));
    setSliderPos(newPos);
  };

  const handleEnhance = async () => {
    if (!item) return;
    setEnhancing(true);
    try {
      const updated = await CasesService.simulateAiEnhancement(item.id);
      setItem(updated);
      Alert.alert("AI Enhancement Complete", "Dental scan successfully optimized. Confidence score: 95%.");
    } catch (err) {
      console.error("AI enhancement simulation failed:", err);
      Alert.alert("Error", "AI Enhancement failed.");
    } finally {
      setEnhancing(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator size="large" color="#0D7B74" />
      </View>
    );
  }

  if (!item) {
    return (
      <View className="flex-1 items-center justify-center bg-surface p-6">
        <Text className="text-muted text-center font-outfit">Case details not found.</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4 bg-teal px-6 py-3 rounded-xl">
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-surface" showsVerticalScrollIndicator={false} bounces={false}>
      <View 
        className="h-80 bg-ink relative"
        onStartShouldSetResponder={() => true}
        onResponderMove={handleTouch}
        onResponderGrant={handleTouch}
      >
        <View className="absolute inset-0 bg-teal-light items-center justify-center">
          {item.after_image_url ? (
            <Image source={{ uri: item.after_image_url }} className="w-full h-full" style={{ resizeMode: "cover" }} />
          ) : (
            <View className="items-center justify-center p-6">
              <Text className="text-6xl mb-2">😁</Text>
              <Text className="text-teal font-bold text-xs font-outfit uppercase tracking-widest text-center">Ready for AI Enhancement</Text>
            </View>
          )}
        </View>

        <View 
          className="absolute inset-0 bg-[#C4A882] items-center justify-center overflow-hidden"
          style={{ width: width * sliderPos }}
        >
          <View style={{ width: width, height: "100%" }}>
            {item.before_image_url ? (
              <Image source={{ uri: item.before_image_url }} className="w-full h-full" style={{ resizeMode: "cover" }} />
            ) : (
              <View className="items-center justify-center h-full bg-[#C4A882]">
                <Text className="text-6xl text-center opacity-70 grayscale">😬</Text>
              </View>
            )}
          </View>
        </View>

        <View 
          className="absolute top-0 bottom-0 w-1 bg-white items-center justify-center z-20"
          style={{ left: width * sliderPos }}
        >
          <View className="w-9 h-9 bg-white rounded-full shadow-lg items-center justify-center border border-line">
            <Text className="text-ink font-bold text-sm">↔</Text>
          </View>
        </View>

        <View className="absolute bottom-4 left-0 right-0 flex-row justify-between px-6 z-10">
          <View className="bg-black/50 px-3 py-1 rounded-full">
            <Text className="text-white text-[9px] font-bold tracking-wider font-outfit uppercase">BEFORE</Text>
          </View>
          <View className="bg-teal px-3 py-1 rounded-full">
            <Text className="text-white text-[9px] font-bold tracking-wider font-outfit uppercase">
              {item.after_image_url ? "AFTER AI" : "AI OPTIMIZED"}
            </Text>
          </View>
        </View>

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
          <View className="flex-1 mr-3">
            <Text className="text-ink text-2xl font-cormorant font-semibold">
              Patient #{item.patient_identifier.replace("P-", "").split("-")[0]} Analysis
            </Text>
            <View className="flex-row items-center mt-1">
              <Clock size={12} color="#7A9190" />
              <Text className="text-muted text-[11px] ml-1">
                Captured {new Date(item.created_at).toLocaleDateString(undefined, { 
                  month: 'short', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </View>
          </View>
          <View className={`px-3 py-1 rounded-full ${item.status === 'Completed' ? 'bg-teal/10' : 'bg-gold/10'}`}>
            <Text className={`text-[9px] font-bold tracking-wider font-outfit uppercase ${item.status === 'Completed' ? 'text-teal' : 'text-gold'}`}>
              {item.status === 'Completed' 
                ? `${(item.confidence_score ? item.confidence_score * 100 : 95).toFixed(0)}% CONFIDENCE`
                : "PENDING AI"
              }
            </Text>
          </View>
        </View>

        <View className="flex-row gap-3 mb-8">
          {item.status === "Completed" ? (
            <View className="flex-1 bg-teal-light p-4 rounded-2xl flex-row items-center justify-center border border-teal/10">
              <Check size={18} color="#0D7B74" className="mr-2" />
              <Text className="text-teal font-bold text-sm">Enhanced with AI</Text>
            </View>
          ) : (
            <TouchableOpacity 
              onPress={handleEnhance}
              disabled={enhancing}
              className="flex-1 bg-teal p-4 rounded-2xl flex-row items-center justify-center shadow-sm active:scale-[0.98] disabled:opacity-70"
            >
              {enhancing ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <Sparkles size={18} color="white" className="mr-2" />
                  <Text className="text-white font-bold text-sm">Enhance</Text>
                </>
              )}
            </TouchableOpacity>
          )}
          <TouchableOpacity className="flex-1 bg-white border border-line p-4 rounded-2xl items-center justify-center">
            <Text className="text-ink font-bold text-sm">Compare 3D</Text>
          </TouchableOpacity>
        </View>

        <View className="bg-white rounded-3xl p-5 border border-line shadow-sm">
          <Text className="text-muted text-[10px] font-bold uppercase tracking-widest mb-4">Case Details</Text>
          
          <View className="flex-row items-center py-3 border-b border-line">
            <UserIcon size={16} color="#7A9190" />
            <Text className="text-muted text-xs ml-3">Patient ID</Text>
            <Text className="text-ink font-semibold text-xs ml-auto">{item.patient_identifier}</Text>
          </View>

          <View className="flex-row items-center py-3 border-b border-line">
            <MapPin size={16} color="#7A9190" />
            <Text className="text-muted text-xs ml-3">Position</Text>
            <Text className="text-ink font-semibold text-xs ml-auto">{item.position || "Not specified"}</Text>
          </View>

          <View className="mt-4">
            <Text className="text-muted text-xs mb-2">Doctor's Notes</Text>
            <View className="bg-teal-light rounded-xl p-3">
              <Text className="text-ink-soft text-xs leading-5">
                {item.notes || "No additional clinician notes provided for this case."}
              </Text>
            </View>
          </View>
        </View>
      </View>
      
      <View className="pb-20" />
    </ScrollView>
  );
}
