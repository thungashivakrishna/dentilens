import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Plus, Image as ImageIcon, Sparkles, ChevronRight, HardDrive } from "lucide-react-native";

export default function HomeScreen() {
  return (
    <ScrollView className="flex-1 bg-surface" bounces={false} showsVerticalScrollIndicator={false}>
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
          <View>
            <Text className="text-white/60 text-xs tracking-wider">Good Morning,</Text>
            <Text className="text-white text-3xl font-cormorant font-semibold">Dr. Sarah Smith</Text>
          </View>
          <View className="w-12 h-12 rounded-full bg-white/20 border-2 border-white/30 items-center justify-center">
            <Text className="text-white font-cormorant font-semibold text-lg">SS</Text>
          </View>
        </View>

        {/* Storage Pill */}
        <View className="bg-white/10 border border-white/20 rounded-3xl p-4 backdrop-blur-md">
          <View className="flex-row justify-between items-center mb-2.5">
            <View className="flex-row items-center">
              <HardDrive size={14} color="rgba(255,255,255,0.7)" />
              <Text className="text-white/70 text-xs font-medium ml-1.5">Cloud Storage</Text>
            </View>
            <Text className="text-white text-[13px] font-semibold">8.2 GB / 10 GB</Text>
          </View>
          <View className="h-1.5 bg-white/15 rounded-full overflow-hidden">
            <View className="h-full bg-white w-[82%]" />
          </View>
          <View className="flex-row gap-2 mt-2.5">
            <View className="bg-white/15 px-2.5 py-1 rounded-full flex-row items-center">
              <Text className="text-white/80 text-[10px] font-bold">142 Cases</Text>
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
          <TouchableOpacity className="flex-1 bg-white rounded-3xl p-4 shadow-sm border border-line active:scale-95">
            <View className="w-10 h-10 bg-teal-light rounded-xl items-center justify-center mb-3">
              <Plus size={20} color="#0D7B74" />
            </View>
            <Text className="text-ink font-semibold text-sm">New Case</Text>
            <Text className="text-muted text-[10px] mt-0.5">Start fresh capture</Text>
            <View className="absolute bottom-4 right-4">
              <ChevronRight size={14} color="#7A9190" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="flex-1 bg-ink rounded-3xl p-4 shadow-sm active:scale-95">
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
          <TouchableOpacity>
            <Text className="text-teal text-[11px] font-bold">View All</Text>
          </TouchableOpacity>
        </View>

        {[
          { id: "1", name: "Patient #8821", date: "Today, 10:24 AM", type: "Intraoral" },
          { id: "2", name: "James Wilson", date: "Yesterday", type: "Orthodontic" },
          { id: "3", name: "Patient #7742", date: "May 14, 2026", type: "Surgery" },
        ].map((item, index) => (
          <TouchableOpacity 
            key={item.id}
            className={`flex-row items-center py-4 ${index !== 2 ? 'border-b border-line' : ''} active:bg-teal-light`}
          >
            <View className="w-12 h-12 bg-teal-light rounded-xl items-center justify-center mr-4">
              <ImageIcon size={22} color="#0D7B74" />
            </View>
            <View className="flex-1">
              <Text className="text-ink font-semibold text-sm">{item.name}</Text>
              <Text className="text-muted text-[11px] mt-0.5">{item.date} • {item.type}</Text>
            </View>
            <ChevronRight size={18} color="#E2EDED" />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
