import { useState } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity } from "react-native";
import { Search, Filter, ChevronRight, FileText } from "lucide-react-native";

const CATEGORIES = ["All", "Intraoral", "Extraoral", "3D Scan", "Surgery"];

export default function CasesScreen() {
  const [activeTab, setActiveTab] = useState("All");

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
            placeholder="Search cases, patients..."
            placeholderTextColor="#7A9190"
            className="flex-1 ml-3 font-outfit text-sm"
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
      <ScrollView className="flex-1 mt-4 px-6 pb-20" showsVerticalScrollIndicator={false}>
        {[
          { id: "1", patient: "Alice Cooper", date: "May 16, 2026", status: "Analyzed", type: "Intraoral" },
          { id: "2", patient: "Bob Marley", date: "May 15, 2026", status: "Pending", type: "Extraoral" },
          { id: "3", patient: "Charlie Sheen", date: "May 14, 2026", status: "Analyzed", type: "3D Scan" },
          { id: "4", patient: "David Bowie", date: "May 12, 2026", status: "Analyzed", type: "Intraoral" },
          { id: "5", patient: "Eva Green", date: "May 10, 2026", status: "Analyzed", type: "Surgery" },
        ].map((item, index) => (
          <TouchableOpacity 
            key={item.id}
            className="flex-row items-center py-5 border-b border-line active:bg-teal-light"
          >
            <View className="w-12 h-12 bg-teal-light rounded-xl items-center justify-center mr-4">
              <FileText size={22} color="#0D7B74" />
            </View>
            <View className="flex-1">
              <View className="flex-row items-center">
                <Text className="text-ink font-semibold text-sm">{item.patient}</Text>
                <View className={`ml-2 px-2 py-0.5 rounded-full ${item.status === 'Analyzed' ? 'bg-teal/10' : 'bg-gold/10'}`}>
                  <Text className={`text-[8px] font-bold uppercase ${item.status === 'Analyzed' ? 'text-teal' : 'text-gold'}`}>
                    {item.status}
                  </Text>
                </View>
              </View>
              <Text className="text-muted text-[11px] mt-0.5">{item.date} • {item.type}</Text>
            </View>
            <ChevronRight size={18} color="#E2EDED" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
