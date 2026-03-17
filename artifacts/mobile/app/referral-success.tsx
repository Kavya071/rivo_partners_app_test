import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
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
import Icon from "@/components/Icon";
import { useResponsive } from "@/hooks/useResponsive";

export default function ReferralSuccessScreen() {
  const insets = useSafeAreaInsets();
  const webBottomPad = Platform.OS === "web" ? 34 : 0;
  const r = useResponsive();

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
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingTop: insets.top + r.sp(20),
          paddingBottom: insets.bottom + webBottomPad + r.sectionGap,
          paddingHorizontal: r.screenPadding,
        },
      ]}
      bounces={false}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.centerContent, { gap: r.sp(20) }]}>
        <Animated.View style={[styles.successCircle, { width: r.sp(100), height: r.sp(100), borderRadius: r.sp(50) }, circleStyle]}>
          <Icon name="checkmark" size={r.sp(40)} color="#fff" />
        </Animated.View>

        <Animated.View entering={FadeIn.delay(500).duration(400)}>
          <Text style={[styles.title, { fontSize: r.fs(28) }]}>Client Submitted</Text>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(700).duration(400)}>
          <Text style={[styles.subtitle, { fontSize: r.fs(15), paddingHorizontal: r.sp(20) }]}>
            We'll update you via WhatsApp as the deal progresses through each
            stage.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(900).duration(400)} style={[styles.cardsSection, { gap: r.cardGap, marginTop: r.sp(16) }]}>
          <View style={[styles.infoCard, { padding: r.cardPadding, gap: r.iconTextGap }]}>
            <Icon name="chatbubble" size={24} color={Colors.primary} />
            <View style={styles.infoCardText}>
              <Text style={[styles.infoCardTitle, { fontSize: r.fs(15) }]}>WhatsApp Updates</Text>
              <Text style={[styles.infoCardDesc, { fontSize: r.fs(13) }]}>
                You'll receive status updates on WhatsApp as the deal progresses.
              </Text>
            </View>
          </View>

          <View style={[styles.infoCard, { padding: r.cardPadding, gap: r.iconTextGap }]}>
            <Icon name="briefcase" size={24} color={Colors.primary} />
            <View style={styles.infoCardText}>
              <Text style={[styles.infoCardTitle, { fontSize: r.fs(15) }]}>Track in App</Text>
              <Text style={[styles.infoCardDesc, { fontSize: r.fs(13) }]}>
                View all your clients and their deal status in the Clients tab.
              </Text>
            </View>
          </View>
        </Animated.View>
      </View>

      <Animated.View entering={FadeIn.delay(1100).duration(400)}>
        <Pressable
          onPress={() => router.replace("/(tabs)/home")}
          style={({ pressed }) => [
            styles.doneBtn,
            { marginTop: r.sp(16) },
            pressed && styles.doneBtnPressed,
          ]}
        >
          <Text style={[styles.doneBtnText, { fontSize: r.fs(16) }]}>Done</Text>
        </Pressable>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "space-between",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  successCircle: {
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontFamily: "Inter_700Bold",
    color: Colors.text,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  cardsSection: {
    width: "100%",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
  },
  infoCardText: {
    flex: 1,
    gap: 4,
  },
  infoCardTitle: {
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
  },
  infoCardDesc: {
    fontFamily: "Inter_400Regular",
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
    color: "#000",
  },
});
