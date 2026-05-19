import { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts, Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold } from "@expo-google-fonts/outfit";
import { CormorantGaramond_400Regular, CormorantGaramond_600SemiBold } from "@expo-google-fonts/cormorant-garamond";
import * as SplashScreen from "expo-splash-screen";
import { supabase } from "../services/supabase";
import { Session } from "@supabase/supabase-js";
import "../global.css";

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    CormorantGaramond_400Regular,
    CormorantGaramond_600SemiBold,
  });

  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  // Load Supabase auth session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setAuthReady(true);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Control routing based on font loading and auth state
  useEffect(() => {
    if (!loaded && !error) return;
    if (!authReady) return;

    const inAuthGroup = segments[0] === "(auth)";

    // Use a small timeout to make sure navigation is mounted
    const timer = setTimeout(() => {
      if (!session && !inAuthGroup) {
        // Not logged in -> Send to login
        router.replace("/(auth)/login");
      } else if (session && (inAuthGroup || segments.length === 0 || segments[0] === "")) {
        // Logged in and in auth -> Send to dashboard
        router.replace("/(tabs)");
      }
    }, 10);

    return () => clearTimeout(timer);
  }, [session, authReady, loaded, error, segments]);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#F8FBFB" },
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}

