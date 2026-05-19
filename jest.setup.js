
// Set mock Supabase environment variables for Jest test execution environment
process.env.EXPO_PUBLIC_SUPABASE_URL = "https://elxmdzanedbslyvyqwsa.supabase.co";
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = "sb_publishable_dummy_anon_key_for_testing";

// Mock Supabase JS SDK globally
jest.mock("@supabase/supabase-js", () => {
  return {
    createClient: jest.fn().mockReturnValue({
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
        getUser: jest.fn().mockResolvedValue({ 
          data: { 
            user: { 
              id: "test-user-id", 
              email: "dr.smith@clinic.com", 
              user_metadata: { full_name: "Dr. Sarah Smith", clinic_name: "Apex Clinic" } 
            } 
          } 
        }),
        signInWithPassword: jest.fn().mockResolvedValue({ data: { user: { email: "dr.smith@clinic.com" } }, error: null }),
        signUp: jest.fn().mockResolvedValue({ data: { user: { email: "dr.smith@clinic.com" }, session: {} }, error: null }),
        signOut: jest.fn().mockResolvedValue({ error: null }),
        onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: {}, error: null }),
      }),
      storage: {
        from: jest.fn().mockReturnValue({
          upload: jest.fn().mockResolvedValue({ data: {}, error: null }),
          getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: "https://example.com/scan.jpg" } }),
        }),
      },
    }),
  };
});

jest.mock("expo-linear-gradient", () => {
  const { View } = require("react-native");
  return { LinearGradient: View };
});

// Dynamic mock for all Lucide icons using a Proxy
jest.mock("lucide-react-native", () => {
  const React = require("react");
  const { View } = require("react-native");
  return new Proxy({}, {
    get: (target, prop) => {
      // Return a dummy functional component for any icon name accessed
      return (props) => React.createElement(View, props);
    }
  });
});

// Secure Store adapter mock
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

// Expo Camera mock
jest.mock("expo-camera", () => {
  const { View } = require("react-native");
  return {
    CameraView: View,
    useCameraPermissions: jest.fn().mockReturnValue([
      { granted: true, canAskAgain: true, expires: "never", status: "granted" },
      jest.fn().mockResolvedValue({ granted: true })
    ]),
  };
});

