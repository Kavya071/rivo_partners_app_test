import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  ActivityIndicator,
  Alert,
  Share,
  RefreshControl,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import * as Clipboard from "expo-clipboard";
import * as Sharing from "expo-sharing";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";

import Colors from "@/constants/colors";
import { getNetwork, ReferredAgent } from "@/lib/api";
import { useConfig } from "@/context/ConfigContext";

const TAB_BAR_HEIGHT = 84;

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Share your code",
    desc: "Send your unique referral link to agents in your network",
  },
  {
    step: "2",
    title: "They sign up",
    desc: "When they register using your code, they join your network",
  },
  {
    step: "3",
    title: "Earn bonuses",
    desc: "Receive a bonus on every deal they close",
  },
];

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-AE", {
    month: "short",
    day: "numeric",
  });
}

export default function NetworkScreen() {
  const insets = useSafeAreaInsets();
  const webTopPad = Platform.OS === "web" ? 67 : 0;
  const config = useConfig();

  const {
    data: networkData,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["network"],
    queryFn: getNetwork,
  });

  const referralCode = networkData?.agent_code ?? "RIVO-XXXX";
  const referredAgents: ReferredAgent[] = networkData?.referred_agents ?? [];
  const bonusSummary = networkData?.bonus_summary;
  const referralLink = `https://partners.rivo.ae?ref=${referralCode}`;

  const getShareMessage = () => {
    const msg = config.MESSAGES.SHARE_TEXT;
    if (msg.includes("{url}")) {
      return msg.replace("{url}", referralLink);
    }
    return msg + referralLink;
  };

  const handleCopy = async () => {
    await Clipboard.setStringAsync(referralLink);
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    Alert.alert("Copied!", "Referral link copied to clipboard");
  };

  const handleShare = async () => {
    const message = getShareMessage();
    try {
      const canShare =
        Platform.OS !== "web" && (await Sharing.isAvailableAsync());
      if (canShare) {
        await Share.share({ message, url: referralLink });
      } else {
        await Share.share({ message });
      }
    } catch (_e) {
      // user cancelled share
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingTop: insets.top + webTopPad + 20,
        paddingBottom: TAB_BAR_HEIGHT + insets.bottom + 20,
        paddingHorizontal: 20,
      }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={Colors.primary}
        />
      }
    >
      <Text style={styles.pageTitle}>My network</Text>

      <View style={styles.codeCard}>
        <Text style={styles.codeLabel}>Your Referral Code</Text>
        <Text style={styles.codeText}>{referralCode}</Text>
        <View style={styles.codeActions}>
          <Pressable
            onPress={handleShare}
            style={({ pressed }) => [
              styles.shareBtn,
              pressed && styles.btnPressed,
            ]}
          >
            <Ionicons name="share-outline" size={18} color="#fff" />
            <Text style={styles.shareBtnText}>Invite your network</Text>
          </Pressable>
          <Pressable
            onPress={handleCopy}
            style={({ pressed }) => [
              styles.copyBtn,
              pressed && styles.btnPressed,
            ]}
          >
            <Feather name="copy" size={16} color={Colors.primary} />
            <Text style={styles.copyBtnText}>Copy link</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={() => router.push("/referral-info")}
          style={styles.knowMoreRow}
        >
          <Text style={styles.knowMoreText}>
            Know more about the referral program
          </Text>
          <Feather name="chevron-right" size={16} color={Colors.primary} />
        </Pressable>

        <Pressable
          onPress={() => router.push("/terms")}
          style={styles.knowMoreRow}
        >
          <Text style={styles.knowMoreText}>Read full T&Cs</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
        </Pressable>
      </View>

      <View style={styles.howItWorks}>
        <Text style={styles.sectionTitle}>How it works</Text>
        {HOW_IT_WORKS.map((item, i) => (
          <View key={i} style={styles.stepRow}>
            <View style={styles.stepCircle}>
              <Text style={styles.stepNumber}>{item.step}</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>{item.title}</Text>
              <Text style={styles.stepDesc}>{item.desc}</Text>
            </View>
            {i < HOW_IT_WORKS.length - 1 && <View style={styles.stepLine} />}
          </View>
        ))}
      </View>

      <View style={styles.referredSection}>
        <View style={styles.networkTitleRow}>
          <Feather name="users" size={18} color={Colors.text} />
          <Text style={styles.sectionTitle}>Your Network</Text>
          {bonusSummary?.completed && (
            <View style={styles.completedBadge}>
              <Text style={styles.completedBadgeText}>Completed</Text>
            </View>
          )}
        </View>

        {referredAgents.length === 0 ? (
          <Text style={styles.emptyText}>
            No agents in your network yet. Share your link to start earning
            bonuses.
          </Text>
        ) : (
          referredAgents.map((agent) => (
            <View
              key={agent.id}
              style={[
                styles.agentCard,
                agent.deals_count === 0 && { opacity: 0.5 },
              ]}
            >
              <View style={styles.agentAvatar}>
                <Feather name="user" size={16} color={Colors.primary} />
              </View>
              <View style={styles.agentInfo}>
                <Text style={styles.agentName}>{agent.name || "Agent"}</Text>
                <Text style={styles.agentStat}>
                  Joined {formatDate(agent.created_at)} &middot;{" "}
                  {agent.deals_count}/{bonusSummary?.max_bonuses ?? config.REFERRAL_BONUS.AMOUNTS.length} Deals
                </Text>
              </View>
              <View style={styles.agentBonus}>
                <Text style={styles.bonusLabel}>Bonus</Text>
                <Text
                  style={[
                    styles.bonusValue,
                    agent.bonus_earned > 0
                      ? { color: Colors.primary }
                      : { color: Colors.textMuted },
                  ]}
                >
                  +AED {agent.bonus_earned}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  pageTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    color: Colors.text,
    marginBottom: 24,
    textAlign: "center",
  },
  codeCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    marginBottom: 28,
  },
  codeLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  codeText: {
    fontFamily: "Inter_700Bold",
    fontSize: 32,
    color: Colors.text,
    letterSpacing: 3,
    marginBottom: 20,
  },
  codeActions: {
    width: "100%",
    gap: 10,
  },
  shareBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  shareBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: "#fff",
  },
  copyBtn: {
    borderRadius: 12,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.primary + "40",
    backgroundColor: Colors.primary + "10",
  },
  copyBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: Colors.primary,
  },
  btnPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  knowMoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  knowMoreText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: Colors.primary,
  },
  howItWorks: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: Colors.text,
    marginBottom: 16,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    marginBottom: 20,
    position: "relative",
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary + "20",
    justifyContent: "center",
    alignItems: "center",
  },
  stepNumber: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    color: Colors.primary,
  },
  stepLine: {
    position: "absolute",
    left: 15,
    top: 34,
    width: 2,
    height: 20,
    backgroundColor: Colors.primary + "20",
  },
  stepContent: {
    flex: 1,
    gap: 2,
  },
  stepTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: Colors.text,
  },
  stepDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  referredSection: {
    marginBottom: 20,
  },
  networkTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  completedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: Colors.primary + "15",
    borderRadius: 10,
  },
  completedBadgeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: Colors.primary,
  },
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.textMuted,
    lineHeight: 20,
  },
  agentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  agentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary + "15",
    justifyContent: "center",
    alignItems: "center",
  },
  agentInfo: {
    flex: 1,
    gap: 2,
  },
  agentName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: Colors.text,
  },
  agentStat: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.textMuted,
  },
  agentBonus: {
    alignItems: "flex-end",
    gap: 2,
  },
  bonusLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: Colors.textMuted,
    textTransform: "uppercase",
  },
  bonusValue: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.primary,
  },
});
