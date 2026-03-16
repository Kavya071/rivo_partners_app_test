import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as Font from "expo-font";
import React, { useEffect, useState } from "react";
import { Platform, useWindowDimensions, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "@/context/AuthContext";
import { ConfigProvider } from "@/context/ConfigContext";

SplashScreen.preventAutoHideAsync();

const MAX_APP_WIDTH = 480;
const queryClient = new QueryClient();

function ResponsiveContainer({ children }: { children: React.ReactNode }) {
  const { width } = useWindowDimensions();
  if (Platform.OS !== "web" || width <= MAX_APP_WIDTH) {
    return <>{children}</>;
  }
  return (
    <View style={{ flex: 1, flexDirection: "row", justifyContent: "center", backgroundColor: "#000000" }}>
      <View style={{ flex: 1, maxWidth: MAX_APP_WIDTH }}>
        {children}
      </View>
    </View>
  );
}

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#000000" },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="whatsapp-listening" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="submit-lead"
        options={{ presentation: "card" }}
      />
      <Stack.Screen
        name="referral-success"
        options={{ presentation: "card", gestureEnabled: false }}
      />
      <Stack.Screen
        name="referral-bonus"
        options={{ presentation: "card", gestureEnabled: false }}
      />
      <Stack.Screen
        name="referral-info"
        options={{ presentation: "card" }}
      />
      <Stack.Screen
        name="terms"
        options={{ presentation: "card" }}
      />
      <Stack.Screen
        name="privacy"
        options={{ presentation: "card" }}
      />
      <Stack.Screen
        name="bonus-terms"
        options={{ presentation: "card" }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [iconsReady, setIconsReady] = useState(Platform.OS === "web");

  useEffect(() => {
    if (Platform.OS === "web") return;
    Font.loadAsync({
      ...Ionicons.font,
      ...Feather.font,
      ...MaterialCommunityIcons.font,
    })
      .then(() => setIconsReady(true))
      .catch(() => setIconsReady(true));
  }, []);

  useEffect(() => {
    if ((fontsLoaded || fontError) && iconsReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, iconsReady]);

  if ((!fontsLoaded && !fontError) || !iconsReady) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ConfigProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <KeyboardProvider>
                  <StatusBar style="light" />
                  <ResponsiveContainer>
                    <RootLayoutNav />
                  </ResponsiveContainer>
                </KeyboardProvider>
              </GestureHandlerRootView>
            </ConfigProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
