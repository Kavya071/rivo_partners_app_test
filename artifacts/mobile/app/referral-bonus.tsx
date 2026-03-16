import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Share,
} from "react-native";
import { router } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useQuery } from "@tanstack/react-query";

import Colors from "@/constants/colors";
import { useConfig } from "@/context/ConfigContext";
import { getMe } from "@/lib/api";

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export default function ReferralBonusScreen() {
  const insets = useSafeAreaInsets();
  const webTopPad = Platform.OS === "web" ? 67 : 0;
  const webBottomPad = Platform.OS === "web" ? 34 : 0;
  const config = useConfig();

  const { data: agent } = useQuery({
    queryKey: ["agent-me"],
    queryFn: getMe,
  });

  const agentCode = agent?.agent_code || "";
  const amounts = config.REFERRAL_BONUS.AMOUNTS;
  const totalPotential = config.REFERRAL_BONUS.TOTAL_POTENTIAL;

  const handleShare = async () => {
    const url = `https://partners.rivo.ae?ref=${agentCode}`;
    const msg = config.MESSAGES.SHARE_TEXT.includes("{url}")
      ? config.MESSAGES.SHARE_TEXT.replace("{url}", url)
      : config.MESSAGES.SHARE_TEXT + url;
    try {
      await Share.share({ message: msg });
    } catch {
      // cancelled
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + webTopPad + 16,
          paddingBottom: insets.bottom + webBottomPad + 20,
        },
      ]}
    >
      <Pressable
        onPress={() => router.replace("/(tabs)")}
        style={styles.closeBtn}
      >
        <Feather name="x" size={24} color={Colors.text} />
      </Pressable>

      <Animated.View
        entering={FadeInDown.duration(500)}
        style={styles.content}
      >
        <Text style={styles.title}>Refer Agents</Text>
        <Text style={styles.subtitle}>
          Your network can get you started with Rivo.{"\n"}
          <Text style={styles.subtitleBold}>
            They close deals, you get paid.
          </Text>
        </Text>

        <View style={styles.timeline}>
          <View style={styles.timelineLine} />
          {amounts.map((amount, i) => {
            const isLast = i === amounts.length - 1;
            return (
              <View key={i} style={styles.timelineItem}>
                <View
                  style={[
                    styles.timelineDot,
                    isLast && styles.timelineDotActive,
                  ]}
                />
                <View style={styles.timelineContent}>
                  <Text
                    style={[
                      styles.timelineDeal,
                      isLast && styles.timelineDealActive,
                    ]}
                  >
                    {ordinal(i + 1)} Deal
                  </Text>
                  <Text
                    style={[
                      styles.timelineAmount,
                      isLast && styles.timelineAmountActive,
                    ]}
                  >
                    AED {amount.toLocaleString()}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Potential</Text>
          <Text style={styles.totalValue}>
            AED {totalPotential.toLocaleString()}
          </Text>
        </View>
      </Animated.View>

      <View style={styles.bottomSection}>
        <Pressable
          onPress={handleShare}
          style={({ pressed }) => [
            styles.shareBtn,
            pressed && styles.btnPressed,
          ]}
        >
          <Ionicons name="share-outline" size={20} color="#000" />
          <Text style={styles.shareBtnText}>Share your link</Text>
        </Pressable>

        <Pressable
          onPress={() => router.replace("/(tabs)")}
          style={styles.skipBtn}
        >
          <Text style={styles.skipText}>Skip for now</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push("/referral-info")}
          style={styles.knowMoreRow}
        >
          <Text style={styles.knowMoreText}>
            Know more about the referral program
          </Text>
          <Feather name="chevron-right" size={16} color={Colors.primary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 24,
  },
  closeBtn: {
    alignSelf: "flex-end",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    gap: 8,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 36,
    color: Colors.text,
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 18,
    color: Colors.textSecondary,
    lineHeight: 28,
    marginBottom: 32,
  },
  subtitleBold: {
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
  },
  timeline: {
    position: "relative",
    paddingLeft: 16,
    gap: 32,
  },
  timelineLine: {
    position: "absolute",
    left: 23,
    top: 16,
    bottom: 16,
    width: 2,
    backgroundColor: Colors.border,
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.border,
    borderWidth: 2,
    borderColor: Colors.background,
    zIndex: 1,
  },
  timelineDotActive: {
    backgroundColor: Colors.primary,
  },
  timelineContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  timelineDeal: {
    fontFamily: "Inter_500Medium",
    fontSize: 17,
    color: Colors.textSecondary,
  },
  timelineDealActive: {
    color: Colors.text,
  },
  timelineAmount: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 22,
    color: Colors.text,
  },
  timelineAmountActive: {
    color: Colors.primary,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 40,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  totalLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: Colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  totalValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    color: Colors.text,
  },
  bottomSection: {
    gap: 12,
  },
  shareBtn: {
    backgroundColor: "#fff",
    borderRadius: 14,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  shareBtnText: {
    fontFamily: "Inter_700Bold",
    fontSize: 17,
    color: "#000",
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  skipBtn: {
    alignItems: "center",
    paddingVertical: 12,
  },
  skipText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: Colors.textMuted,
  },
  knowMoreRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    paddingBottom: 4,
  },
  knowMoreText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: Colors.primary,
  },
});
