import { useState, useCallback } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { Search, ChevronRight, FileText } from "lucide-react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { CasesService, DentalCase } from "../../services/cases";

const CATEGORIES = ["All", "Intraoral", "Extraoral", "3D Scan", "Surgery"];

export default function CasesScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [cases, setCases] = useState<DentalCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCases = async () => {
    try {
      const allCases = await CasesService.fetchCases();
      setCases(allCases);
    } catch (err) {
      console.warn("Error fetching cases list:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadCases();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadCases();
  };

  // Filter cases dynamically in memory based on search query and category
  const filteredCases = cases.filter(item => {
    // 1. Category Filter
    if (activeTab !== "All" && item.type.toLowerCase() !== activeTab.toLowerCase()) {
      return false;
    }

    // 2. Search Query Filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      const patientId = item.patient_identifier.toLowerCase();
      const type = item.type.toLowerCase();
      const position = (item.position || "").toLowerCase();
      const notes = (item.notes || "").toLowerCase();

      return (
        patientId.includes(query) ||
        type.includes(query) ||
        position.includes(query) ||
        notes.includes(query)
      );
    }

    return true;
  });

  return (
    <View className="flex-1 bg-surface">
      <View className="bg-teal pt-16 pb-12 px-6">
        <Text className="text-white text-3xl font-cormorant font-semibold">My Cases</Text>
        <Text className="text-white/60 text-xs mt-1">Manage and review patient history</Text>
      </View>

      {/* Search Bar */}
      <View className="px-6 -mt-7">
        <View className="flex-row items-center bg-white rounded-2xl p-4 shadow-lg border border-line">
          <Search size={20} color="#7A9190" />
          <TextInput 
            placeholder="Search by Patient ID, tooth, category..."
            placeholderTextColor="#7A9190"
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
            className="flex-1 ml-3 font-outfit text-sm text-ink"
          />
        </View>
      </View>

      {/* Filter Strip */}
      <View className="mt-6">
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, gap: 8 }}
        >
          {CATEGORIES.map(cat => (
            <TouchableOpacity 
              key={cat}
              onPress={() => setActiveTab(cat)}
              className={`px-5 py-2 rounded-full border ${activeTab === cat ? 'bg-teal border-teal' : 'bg-white border-line'}`}
            >
              <Text className={`text-xs font-semibold ${activeTab === cat ? 'text-white' : 'text-muted'}`}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Case List */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0D7B74" />
        </View>
      ) : (
        <ScrollView 
          className="flex-1 mt-4 px-6 pb-20" 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#0D7B74" />
          }
        >
          {filteredCases.length === 0 ? (
            <View className="py-16 items-center">
              <Text className="text-muted text-sm font-outfit text-center">
                {cases.length === 0 
                  ? "No dental cases logged yet." 
                  : "No cases match your filters."
                }
              </Text>
            </View>
          ) : (
            filteredCases.map((item, index) => (
              <TouchableOpacity 
                key={item.id}
                onPress={() => router.push(`/case/${item.id}`)}
                className="flex-row items-center py-5 border-b border-line active:bg-teal-light"
              >
                <View className="w-12 h-12 bg-teal-light rounded-xl items-center justify-center mr-4">
                  <FileText size={22} color="#0D7B74" />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center">
                    <Text className="text-ink font-semibold text-sm">
                      Patient #{item.patient_identifier.replace("P-", "").split("-")[0]}
                    </Text>
                    <View className={`ml-2 px-2 py-0.5 rounded-full ${item.status === 'Completed' ? 'bg-teal/10' : 'bg-gold/10'}`}>
                      <Text className={`text-[8px] font-bold uppercase ${item.status === 'Completed' ? 'text-teal' : 'text-gold'}`}>
                        {item.status}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-muted text-[11px] mt-0.5" numberOfLines={1}>
                    {new Date(item.created_at).toLocaleDateString(undefined, { 
                      year: 'numeric',
                      month: 'short', 
                      day: 'numeric' 
                    })} • {item.type} {item.position ? `• ${item.position}` : ''}
                  </Text>
                </View>
                <ChevronRight size={18} color="#E2EDED" />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

