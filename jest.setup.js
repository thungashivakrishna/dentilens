
jest.mock("expo-linear-gradient", () => {
  const { View } = require("react-native");
  return { LinearGradient: View };
});

jest.mock("lucide-react-native", () => {
  const { View } = require("react-native");
  return {
    Home: View,
    FolderOpen: View,
    Camera: View,
    User: View,
    Plus: View,
    Sparkles: View,
    ChevronRight: View,
    HardDrive: View,
    Fingerprint: View,
    Mail: View,
    Lock: View,
    ArrowRight: View,
    X: View,
    Zap: View,
    RefreshCcw: View,
  };
});
