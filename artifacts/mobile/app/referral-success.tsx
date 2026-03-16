import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  FadeIn,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import Colors from "@/constants/colors";
import { useConfig } from "@/context/ConfigContext";
import {
  getWhatsAppPref,
  openWhatsAppChat,
} from "@/lib/whatsapp";

export default function ReferralSuccessScreen() {
  const insets = useSafeAreaInsets();
  const webBottomPad = Platform.OS === "web" ? 34 : 0;
  const config = useConfig();

  const checkScale = useSharedValue(0);
  const circleScale = useSharedValue(0);

  useEffect(() => {
    circleScale.value = withSpring(1, { damping: 12, stiffness: 100 });
    checkScale.value = withDelay(
      300,
      withSequence(
        withSpring(1.2, { damping: 8, stiffness: 150 }),
        withTiming(1, { duration: 200 }),
      ),
    );
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, []);

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: circleScale.value }],
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const handleContactWhatsApp = async () => {
    const pref = await getWhatsAppPref();
    const waUrl =
      pref === "business"
        ? config.LINKS.WHATSAPP_BUSINESS
        : config.LINKS.WHATSAPP_PERSONAL;
    const phone = waUrl.replace("https://wa.me/", "");
    await openWhatsAppChat(
      phone,
      "Hi, I just submitted a new client referral.",
      pref || undefined,
    );
  };

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: insets.bottom + webBottomPad + 24 },
      ]}
    >
      <View style={styles.centerContent}>
        <Animated.View style={[styles.successCircle, circleStyle]}>
          <Animated.View style={checkStyle}>
            <Feather name="check" size={48} color="#fff" />
          </Animated.View>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(500).duration(400)}>
          <Text style={styles.title}>Client Submitted</Text>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(700).duration(400)}>
          <Text style={styles.subtitle}>
            We'll update you via WhatsApp as the deal progresses through each
            stage.
          </Text>
        </Animated.View>
      </View>

      <Animated.View entering={FadeIn.delay(900).duration(400)} style={styles.bottomActions}>
        <Pressable
          onPress={handleContactWhatsApp}
          style={({ pressed }) => [
            styles.whatsappBtn,
            pressed && styles.btnPressed,
          ]}
        >
          <Ionicons name="logo-whatsapp" size={20} color="#fff" />
          <Text style={styles.whatsappBtnText}>Chat on WhatsApp</Text>
        </Pressable>

        <Pressable
          onPress={() => router.replace("/(tabs)")}
          style={({ pressed }) => [
            styles.doneBtn,
            pressed && styles.doneBtnPressed,
          ]}
        >
          <Text style={styles.doneBtnText}>Done</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    color: Colors.text,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  bottomActions: {
    gap: 12,
  },
  whatsappBtn: {
    backgroundColor: Colors.whatsapp,
    borderRadius: 14,
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  whatsappBtnText: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: "#fff",
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  doneBtn: {
    borderRadius: 14,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  doneBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  doneBtnText: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: Colors.text,
  },
});
