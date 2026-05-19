import { View, Text, ScrollView, TouchableOpacity, Switch } from "react-native";
import { User, Settings, Shield, Bell, CircleHelp, LogOut, ChevronRight } from "lucide-react-native";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
  const router = useRouter();

  const MenuItem = ({ icon: Icon, label, value, color = "#111B1A" }: any) => (
    <TouchableOpacity className="flex-row items-center py-4 border-b border-line active:bg-teal-light">
      <View className="w-10 h-10 bg-surface rounded-xl items-center justify-center mr-4 border border-line">
        <Icon size={20} color={color} />
      </View>
      <View className="flex-1">
        <Text className="text-ink font-medium text-sm">{label}</Text>
      </View>
      {value ? (
        <Text className="text-teal font-semibold text-xs mr-2">{value}</Text>
      ) : (
        <ChevronRight size={18} color="#E2EDED" />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView className="flex-1 bg-surface" showsVerticalScrollIndicator={false}>
      <View className="bg-teal pt-16 pb-12 px-6 items-center">
        <View className="w-24 h-24 rounded-full bg-white/20 border-4 border-white/30 items-center justify-center mb-4">
          <Text className="text-white text-3xl font-cormorant font-semibold">SS</Text>
          <View className="absolute bottom-0 right-0 w-7 h-7 bg-white rounded-full items-center justify-center border-2 border-teal">
            <User size={14} color="#0D7B74" />
          </View>
        </View>
        <Text className="text-white text-2xl font-cormorant font-semibold">Dr. Sarah Smith</Text>
        <Text className="text-white/60 text-xs mt-1">General Dentist • Smile Clinic NYC</Text>
      </View>

      <View className="p-6">
        <Text className="text-muted text-[10px] font-bold uppercase tracking-widest mb-2">Account Settings</Text>
        <MenuItem icon={User} label="Personal Information" />
        <MenuItem icon={Bell} label="Notifications" value="On" />
        <MenuItem icon={Shield} label="Privacy & Security" />
        
        <Text className="text-muted text-[10px] font-bold uppercase tracking-widest mt-8 mb-2">Preferences</Text>
        <MenuItem icon={Settings} label="App Theme" value="Light" />
        <View className="flex-row items-center py-4 border-b border-line">
          <View className="w-10 h-10 bg-surface rounded-xl items-center justify-center mr-4 border border-line">
            <Bell size={20} color="#111B1A" />
          </View>
          <View className="flex-1">
            <Text className="text-ink font-medium text-sm">Cloud Auto-Sync</Text>
          </View>
          <Switch value={true} trackColor={{ true: '#0D7B74' }} />
        </View>

        <Text className="text-muted text-[10px] font-bold uppercase tracking-widest mt-8 mb-2">Support</Text>
        <MenuItem icon={CircleHelp} label="Help Center" />
        <MenuItem 
          icon={LogOut} 
          label="Sign Out" 
          color="#D94F4F" 
          onPress={() => router.replace("/")}
        />
      </View>

      <View className="items-center pb-20">
        <Text className="text-muted text-[10px]">DentiLens v1.0.0 (Production)</Text>
      </View>
    </ScrollView>
  );
}
