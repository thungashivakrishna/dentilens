import { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Plus, Image as ImageIcon, Sparkles, ChevronRight, HardDrive, LogOut } from "lucide-react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { CasesService, DentalCase, DoctorProfile } from "../../services/cases";
import { supabase } from "../../services/supabase";

export default function HomeScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [cases, setCases] = useState<DentalCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async () => {
    try {
      const prof = await CasesService.fetchProfile();
      setProfile(prof);
    } catch (err) {
      console.warn("Could not load doctor profile:", err);
    }

    try {
      const allCases = await CasesService.fetchCases();
      setCases(allCases);
    } catch (err) {
      console.warn("Could not load dental cases:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Reload data every time screen comes into focus (e.g. after adding a new case in the camera tab)
  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      // Layout observer will automatically trigger redirect
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "DR";
    const parts = name.replace("Dr.", "").trim().split(" ");
    return parts.map(p => p[0]).join("").substring(0, 2).toUpperCase();
  };

  // Calculate dynamic stats
  const caseCount = cases.length;
  const storageUsedGb = Math.min(10, +(caseCount * 0.05).toFixed(2)); // Estimate 50MB per scan case
  const storagePercentage = Math.round((storageUsedGb / 10) * 100);

  // Get 3 most recent cases
  const recentCases = cases.slice(0, 3);

  return (
    <ScrollView 
      className="flex-1 bg-surface" 
      bounces={true} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#0D7B74" />
      }
    >
      {/* Hero Section */}
      <View className="bg-teal pt-16 pb-8 px-6 overflow-hidden relative">
        <LinearGradient
          colors={["#0A5E58", "#0D7B74", "#15A099"]}
          className="absolute inset-0"
        />
        
        {/* Decorative Circles */}
        <View className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/5" />
        <View className="absolute -bottom-20 -left-10 w-48 h-48 rounded-full bg-white/5" />

        <View className="flex-row justify-between items-start mb-6">
          <View className="flex-1 mr-2">
            <Text className="text-white/60 text-xs tracking-wider">Good Morning,</Text>
            <Text className="text-white text-3xl font-cormorant font-semibold truncate" numberOfLines={1}>
              {profile?.full_name || "Dr. Guest"}
            </Text>
            <Text className="text-white/50 text-[10px] uppercase font-bold tracking-widest mt-0.5">
              {profile?.clinic_name || "Apex Dental Clinic"}
            </Text>
          </View>
          <View className="flex-row items-center gap-3">
            <TouchableOpacity 
              onPress={handleLogout}
              className="w-10 h-10 rounded-full bg-white/10 border border-white/20 items-center justify-center active:bg-white/20"
            >
              <LogOut size={16} color="white" />
            </TouchableOpacity>
            <View className="w-12 h-12 rounded-full bg-white/20 border-2 border-white/30 items-center justify-center">
              <Text className="text-white font-cormorant font-semibold text-lg">
                {getInitials(profile?.full_name || "DR")}
              </Text>
            </View>
          </View>
        </View>

        {/* Storage Pill */}
        <View className="bg-white/10 border border-white/20 rounded-3xl p-4 backdrop-blur-md">
          <View className="flex-row justify-between items-center mb-2.5">
            <View className="flex-row items-center">
              <HardDrive size={14} color="rgba(255,255,255,0.7)" />
              <Text className="text-white/70 text-xs font-medium ml-1.5">Cloud Storage</Text>
            </View>
            <Text className="text-white text-[13px] font-semibold">{storageUsedGb} GB / 10 GB</Text>
          </View>
          <View className="h-1.5 bg-white/15 rounded-full overflow-hidden">
            <View className="h-full bg-white" style={{ width: `${storagePercentage}%` }} />
          </View>
          <View className="flex-row gap-2 mt-2.5">
            <View className="bg-white/15 px-2.5 py-1 rounded-full flex-row items-center">
              <Text className="text-white/80 text-[10px] font-bold">{caseCount} Cases</Text>
            </View>
            <View className="bg-white/15 px-2.5 py-1 rounded-full flex-row items-center">
              <Text className="text-white/80 text-[10px] font-bold">HD Sync On</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View className="p-6">
        <Text className="text-muted text-[10px] font-bold uppercase tracking-widest mb-4">Quick Actions</Text>
        <View className="flex-row gap-3">
          <TouchableOpacity 
            onPress={() => router.push("/(tabs)/camera")}
            className="flex-1 bg-white rounded-3xl p-4 shadow-sm border border-line active:scale-95"
          >
            <View className="w-10 h-10 bg-teal-light rounded-xl items-center justify-center mb-3">
              <Plus size={20} color="#0D7B74" />
            </View>
            <Text className="text-ink font-semibold text-sm">New Case</Text>
            <Text className="text-muted text-[10px] mt-0.5">Start fresh capture</Text>
            <View className="absolute bottom-4 right-4">
              <ChevronRight size={14} color="#7A9190" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => router.push("/(tabs)/cases")}
            className="flex-1 bg-ink rounded-3xl p-4 shadow-sm active:scale-95"
          >
            <View className="w-10 h-10 bg-white/10 rounded-xl items-center justify-center mb-3">
              <Sparkles size={20} color="white" />
            </View>
            <Text className="text-white font-semibold text-sm">AI Scan</Text>
            <Text className="text-white/50 text-[10px] mt-0.5">Analysis ready</Text>
            <View className="absolute bottom-4 right-4">
              <ChevronRight size={14} color="rgba(255,255,255,0.3)" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Cases */}
      <View className="px-6 pb-24">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-muted text-[10px] font-bold uppercase tracking-widest">Recent Activity</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/cases")}>
            <Text className="text-teal text-[11px] font-bold">View All</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View className="py-8 items-center">
            <ActivityIndicator size="small" color="#0D7B74" />
          </View>
        ) : recentCases.length === 0 ? (
          <View className="py-8 items-center bg-white rounded-3xl border border-line border-dashed">
            <Text className="text-muted text-xs font-outfit">No active dental cases logged yet.</Text>
            <TouchableOpacity 
              onPress={() => router.push("/(tabs)/camera")}
              className="mt-3 bg-teal-light px-4 py-2 rounded-xl"
            >
              <Text className="text-teal font-semibold text-xs">Capture First Case</Text>
            </TouchableOpacity>
          </View>
        ) : (
          recentCases.map((item, index) => (
            <TouchableOpacity 
              key={item.id}
              onPress={() => router.push(`/case/${item.id}`)}
              className={`flex-row items-center py-4 ${index !== recentCases.length - 1 ? 'border-b border-line' : ''} active:bg-teal-light`}
            >
              <View className="w-12 h-12 bg-teal-light rounded-xl items-center justify-center mr-4">
                <ImageIcon size={22} color="#0D7B74" />
              </View>
              <View className="flex-1">
                <Text className="text-ink font-semibold text-sm">
                  Patient #{item.patient_identifier.replace("P-", "").split("-")[0]}
                </Text>
                <Text className="text-muted text-[11px] mt-0.5" numberOfLines={1}>
                  {new Date(item.created_at).toLocaleDateString(undefined, { 
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })} • {item.type}
                </Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <View className={`px-2 py-0.5 rounded-full ${item.status === 'Completed' ? 'bg-teal/10' : 'bg-gold/10'}`}>
                  <Text className={`text-[8px] font-bold uppercase ${item.status === 'Completed' ? 'text-teal' : 'text-gold'}`}>
                    {item.status}
                  </Text>
                </View>
                <ChevronRight size={18} color="#E2EDED" />
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}

