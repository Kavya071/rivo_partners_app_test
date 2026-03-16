import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
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

export default function ReferralInfoScreen() {
  const insets = useSafeAreaInsets();
  const webTopPad = Platform.OS === "web" ? 67 : 0;
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
        { paddingTop: insets.top + webTopPad },
      ]}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Referral Program</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(500)}>
          <Text style={styles.title}>How the referral{"\n"}program works</Text>
          <Text style={styles.subtitle}>
            Earn bonuses when agents you refer close their deals.
          </Text>

          <View style={styles.stepsContainer}>
            <View style={styles.stepCard}>
              <View style={[styles.stepIcon, { backgroundColor: Colors.primary + "15" }]}>
                <Ionicons name="share-outline" size={24} color={Colors.primary} />
              </View>
              <Text style={styles.stepTitle}>1. Share Your Link</Text>
              <Text style={styles.stepDesc}>
                Send your unique referral link to real estate agents in your network. They can sign up using your code.
              </Text>
            </View>

            <View style={styles.stepCard}>
              <View style={[styles.stepIcon, { backgroundColor: "#3b82f615" }]}>
                <Feather name="briefcase" size={24} color="#3b82f6" />
              </View>
              <Text style={styles.stepTitle}>2. They Close Deals</Text>
              <Text style={styles.stepDesc}>
                Once your referred agents start submitting mortgage leads, our team processes them. You can track their progress in your Network tab.
              </Text>
            </View>

            <View style={styles.stepCard}>
              <View style={[styles.stepIcon, { backgroundColor: "#a855f715" }]}>
                <Ionicons name="flash" size={24} color="#a855f7" />
              </View>
              <Text style={styles.stepTitle}>3. Earn Bonuses</Text>
              <Text style={styles.stepDesc}>
                You earn a bonus for each of the first {amounts.length} successful disbursals from every agent you refer.
              </Text>

              <View style={styles.bonusTable}>
                {amounts.map((amount, i) => (
                  <View key={i} style={styles.bonusRow}>
                    <Text style={styles.bonusRowLabel}>
                      {ordinal(i + 1)} Deal
                    </Text>
                    <Text style={styles.bonusRowValue}>
                      AED {amount.toLocaleString()} Bonus
                    </Text>
                  </View>
                ))}
                <View style={styles.bonusTotalRow}>
                  <Text style={styles.bonusTotalLabel}>Total Potential</Text>
                  <Text style={styles.bonusTotalValue}>
                    AED {totalPotential.toLocaleString()} per Agent
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      <View
        style={[
          styles.bottomBar,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 16) },
        ]}
      >
        <Pressable
          onPress={handleShare}
          style={({ pressed }) => [
            styles.referBtn,
            pressed && styles.btnPressed,
          ]}
        >
          <Ionicons name="share-outline" size={20} color="#fff" />
          <Text style={styles.referBtnText}>Refer now</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 17,
    color: Colors.text,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 120,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 30,
    color: Colors.text,
    lineHeight: 38,
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: 32,
  },
  stepsContainer: {
    gap: 16,
  },
  stepCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 20,
  },
  stepIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  stepTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: Colors.text,
    marginBottom: 8,
  },
  stepDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  bonusTable: {
    marginTop: 16,
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    gap: 12,
  },
  bonusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bonusRowLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.textSecondary,
  },
  bonusRowValue: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.text,
  },
  bonusTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  bonusTotalLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: Colors.primary,
  },
  bonusTotalValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    color: Colors.primary,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  referBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  referBtnText: {
    fontFamily: "Inter_700Bold",
    fontSize: 17,
    color: "#fff",
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
