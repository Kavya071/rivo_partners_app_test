import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Share,
  ScrollView,
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
  const [activeTab, setActiveTab] = useState<"referrer" | "agent">("agent");

  const referrerAmounts = config.REFERRAL_BONUS.AMOUNTS;
  const referrerTotal = config.REFERRAL_BONUS.TOTAL_POTENTIAL;
  const agentAmounts = config.NEW_AGENT_BONUS.AMOUNTS;
  const agentTotal = config.NEW_AGENT_BONUS.TOTAL_POTENTIAL;

  const amounts = activeTab === "referrer" ? referrerAmounts : agentAmounts;
  const totalPotential = activeTab === "referrer" ? referrerTotal : agentTotal;

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

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(500)}>
          <Text style={styles.title}>Earn Bonuses</Text>
          <Text style={styles.subtitle}>
            Earn bonuses as you grow with Rivo.{"\n"}
            <Text style={styles.subtitleBold}>
              Close deals and refer agents to maximize earnings.
            </Text>
          </Text>

          <View style={styles.tabRow}>
            <Pressable
              onPress={() => setActiveTab("agent")}
              style={[
                styles.tab,
                activeTab === "agent" && styles.tabActive,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "agent" && styles.tabTextActive,
                ]}
              >
                Your Deals
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setActiveTab("referrer")}
              style={[
                styles.tab,
                activeTab === "referrer" && styles.tabActive,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "referrer" && styles.tabTextActive,
                ]}
              >
                Referral Agents
              </Text>
            </Pressable>
          </View>

          <Text style={styles.sectionLabel}>
            {activeTab === "agent"
              ? "Milestone bonuses for your first deals"
              : "Bonuses when agents you refer close deals"}
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
      </ScrollView>

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
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
    paddingTop: 12,
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
    marginBottom: 28,
  },
  subtitleBold: {
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
  },
  tabRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: Colors.primary + "20",
  },
  tabText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: Colors.textMuted,
  },
  tabTextActive: {
    color: Colors.primary,
    fontFamily: "Inter_600SemiBold",
  },
  sectionLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 24,
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
