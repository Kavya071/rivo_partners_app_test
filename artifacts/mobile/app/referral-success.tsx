import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  FadeIn,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import Colors from "@/constants/colors";

export default function ReferralSuccessScreen() {
  const insets = useSafeAreaInsets();
  const webBottomPad = Platform.OS === "web" ? 34 : 0;

  const circleScale = useSharedValue(0.5);
  const circleOpacity = useSharedValue(0);

  useEffect(() => {
    circleScale.value = withSpring(1, { damping: 12, stiffness: 100 });
    circleOpacity.value = withDelay(
      0,
      withSpring(1, { damping: 12, stiffness: 100 }),
    );
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, []);

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: circleScale.value }],
    opacity: circleOpacity.value,
  }));

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: insets.bottom + webBottomPad + 24 },
      ]}
    >
      <View style={styles.centerContent}>
        <Animated.View style={[styles.successCircle, circleStyle]}>
          <Ionicons name="checkmark" size={40} color="#fff" />
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

        <Animated.View entering={FadeIn.delay(900).duration(400)} style={styles.cardsSection}>
          <View style={styles.infoCard}>
            <Ionicons name="chatbubble" size={24} color={Colors.primary} />
            <View style={styles.infoCardText}>
              <Text style={styles.infoCardTitle}>WhatsApp Updates</Text>
              <Text style={styles.infoCardDesc}>
                You'll receive status updates on WhatsApp as the deal progresses.
              </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="briefcase" size={24} color={Colors.primary} />
            <View style={styles.infoCardText}>
              <Text style={styles.infoCardTitle}>Track in App</Text>
              <Text style={styles.infoCardDesc}>
                View all your clients and their deal status in the Clients tab.
              </Text>
            </View>
          </View>
        </Animated.View>
      </View>

      <Animated.View entering={FadeIn.delay(1100).duration(400)}>
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
  cardsSection: {
    width: "100%",
    gap: 12,
    marginTop: 12,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    padding: 16,
  },
  infoCardText: {
    flex: 1,
    gap: 4,
  },
  infoCardTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: Colors.text,
  },
  infoCardDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  doneBtn: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
  },
  doneBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  doneBtnText: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: "#000",
  },
});
