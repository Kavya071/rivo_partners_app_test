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
import { Ionicons } from "@expo/vector-icons";
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
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>How Referrals Work</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(500)}>
          <Text style={styles.title}>
            {"Grow your network,\nmultiply your earnings."}
          </Text>
          <Text style={styles.subtitle}>
            Our referral program is designed to reward you for bringing
            high-quality agents into the Rivo ecosystem.
          </Text>

          <View style={styles.cardsContainer}>
            <View style={styles.card}>
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: "rgba(0,208,132,0.1)" },
                ]}
              >
                <Ionicons name="people" size={24} color={Colors.primary} />
              </View>
              <Text style={styles.cardTitle}>1. Invite Agents</Text>
              <Text style={styles.cardDesc}>
                Share your unique referral link with other real estate agents.
                When they sign up using your link, they are automatically tagged
                to your network.
              </Text>
            </View>

            <View style={styles.card}>
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: "rgba(59,130,246,0.1)" },
                ]}
              >
                <Ionicons name="briefcase" size={24} color="#3b82f6" />
              </View>
              <Text style={styles.cardTitle}>2. They Close Deals</Text>
              <Text style={styles.cardDesc}>
                Once your referred agents start submitting mortgage leads, our
                team processes them. You can track their progress in your Network
                tab.
              </Text>
            </View>

            <View style={styles.card}>
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: "rgba(168,85,247,0.1)" },
                ]}
              >
                <Ionicons name="flash" size={24} color="#a855f7" />
              </View>
              <Text style={styles.cardTitle}>3. Earn Bonuses</Text>
              <Text style={styles.cardDesc}>
                You earn a bonus for each of the first {amounts.length}{" "}
                successful disbursals from every agent you refer.
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
          {
            paddingBottom:
              insets.bottom + (Platform.OS === "web" ? 34 : 16),
          },
        ]}
      >
        <Pressable
          onPress={handleShare}
          style={({ pressed }) => [
            styles.referBtn,
            pressed && styles.btnPressed,
          ]}
        >
          <Ionicons name="share-social" size={20} color="#000000" />
          <Text style={styles.referBtnText}>Refer now</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 12,
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#27272A",
    backgroundColor: "#000000",
    gap: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#18181B",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 120,
  },
  title: {
    fontSize: 30,
    fontWeight: "500",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: "#A1A1AA",
    lineHeight: 28,
    marginBottom: 32,
  },
  cardsContainer: {
    gap: 32,
  },
  card: {
    backgroundColor: "rgba(24,24,27,0.5)",
    borderWidth: 1,
    borderColor: "#27272A",
    borderRadius: 12,
    padding: 24,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "500",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 16,
    color: "#A1A1AA",
    lineHeight: 26,
  },
  bonusTable: {
    marginTop: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#27272A",
    padding: 16,
    gap: 12,
  },
  bonusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bonusRowLabel: {
    fontSize: 14,
    color: "#A1A1AA",
  },
  bonusRowValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  bonusTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#27272A",
  },
  bonusTotalLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#00D084",
  },
  bonusTotalValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#00D084",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 24,
    backgroundColor: "#000000",
    borderTopWidth: 1,
    borderTopColor: "#27272A",
  },
  referBtn: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  referBtnText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000000",
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
