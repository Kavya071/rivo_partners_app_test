import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  FadeIn,
} from "react-native-reanimated";
import * as Linking from "expo-linking";

import Colors from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { checkVerification } from "@/lib/api";

export default function WhatsAppListeningScreen() {
  const insets = useSafeAreaInsets();
  const { code, whatsapp_url } = useLocalSearchParams<{
    code: string;
    whatsapp_url: string;
  }>();
  const { login } = useAuth();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.4);
  const dotOpacity = useSharedValue(0.3);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withTiming(1.6, { duration: 1500, easing: Easing.out(Easing.ease) }),
      -1,
      true,
    );
    pulseOpacity.value = withRepeat(
      withTiming(0, { duration: 1500, easing: Easing.out(Easing.ease) }),
      -1,
      true,
    );
    dotOpacity.value = withRepeat(
      withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, []);

  useEffect(() => {
    if (!code) return;
    intervalRef.current = setInterval(async () => {
      try {
        const result = await checkVerification(code);
        if (result.verified && result.token) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          await login(result.token);
          router.replace("/(tabs)");
        }
      } catch (e) {
        console.error("Verification poll error:", e);
      }
    }, 2000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [code]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  const dotStyle = useAnimatedStyle(() => ({
    opacity: dotOpacity.value,
  }));

  const webTopPad = Platform.OS === "web" ? 67 : 0;

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + webTopPad + 40 },
      ]}
    >
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={Colors.text} />
      </Pressable>

      <View style={styles.centerContent}>
        <Animated.View entering={FadeIn.duration(600)}>
          <View style={styles.iconContainer}>
            <Animated.View style={[styles.pulse, pulseStyle]} />
            <View style={styles.whatsappCircle}>
              <Ionicons name="logo-whatsapp" size={48} color="#fff" />
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(300).duration(600)} style={styles.textSection}>
          <Text style={styles.heading}>Tap Send in WhatsApp</Text>
          <Text style={styles.subText}>
            We sent a verification message to WhatsApp. Tap send to verify your
            account.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(500).duration(600)} style={styles.listeningRow}>
          <Animated.View style={[styles.dot, dotStyle]} />
          <Text style={styles.listeningText}>Listening for verification...</Text>
        </Animated.View>
      </View>

      <Pressable
        onPress={() => {
          if (whatsapp_url) Linking.openURL(whatsapp_url);
        }}
        style={({ pressed }) => [
          styles.openAgainBtn,
          pressed && styles.openAgainPressed,
        ]}
      >
        <Ionicons name="logo-whatsapp" size={20} color={Colors.whatsapp} />
        <Text style={styles.openAgainText}>Open WhatsApp again</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 24,
    justifyContent: "space-between",
    paddingBottom: 40,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  centerContent: {
    alignItems: "center",
    gap: 32,
  },
  iconContainer: {
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  pulse: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.whatsapp,
  },
  whatsappCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.whatsapp,
    justifyContent: "center",
    alignItems: "center",
  },
  textSection: {
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
  },
  heading: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    color: Colors.text,
    textAlign: "center",
  },
  subText: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  listeningRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  listeningText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: Colors.textSecondary,
  },
  openAgainBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.whatsapp + "40",
    backgroundColor: Colors.whatsapp + "10",
  },
  openAgainPressed: {
    opacity: 0.7,
  },
  openAgainText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: Colors.whatsapp,
  },
});
