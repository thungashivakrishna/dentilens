import { Tabs } from "expo-router";
import { View, Text } from "react-native";
import { Home, FolderOpen, Camera, User } from "lucide-react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#0D7B74",
        tabBarInactiveTintColor: "#7A9190",
        tabBarStyle: {
          height: 84,
          backgroundColor: "rgba(255, 255, 255, 0.96)",
          borderTopWidth: 1,
          borderTopColor: "#E2EDED",
          paddingBottom: 20,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          letterSpacing: 0.3,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cases"
        options={{
          title: "Cases",
          tabBarIcon: ({ color }) => (
            <View className="relative">
              <FolderOpen size={24} color={color} />
              <View className="absolute -top-1 -right-2 bg-danger w-4 h-4 rounded-full items-center justify-center border-2 border-white">
                <Text className="text-white text-[8px] font-bold">3</Text>
              </View>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          title: "Capture",
          tabBarIcon: ({ color }) => <Camera size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
