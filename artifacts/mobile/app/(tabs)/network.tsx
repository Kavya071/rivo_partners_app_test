import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Share,
  RefreshControl,
  Animated as RNAnimated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";

import Colors from "@/constants/colors";
import { getNetwork, ReferredAgent } from "@/lib/api";
import { useConfig } from "@/context/ConfigContext";

const TAB_BAR_HEIGHT = 84;

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-AE", {
    month: "short",
    day: "numeric",
  });
}

function formatBonusAmounts(amounts: number[]): string {
  if (amounts.length === 0) return "";
  const formatted = amounts.map(
    (a) => `AED ${a.toLocaleString("en-AE")}`,
  );
  if (formatted.length === 1) return formatted[0];
  return formatted.join(", ") + " respectively.";
}

function SkeletonRow() {
  const opacity = useRef(new RNAnimated.Value(0.3)).current;

  useEffect(() => {
    const animation = RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        RNAnimated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <RNAnimated.View style={[styles.skeletonRow, { opacity }]}>
      <View style={{ flex: 1, gap: 8 }}>
        <View style={styles.skeletonName} />
        <View style={styles.skeletonStat} />
      </View>
      <View style={{ alignItems: "flex-end", gap: 6 }}>
        <View style={styles.skeletonBonus} />
        <View style={styles.skeletonLabel} />
      </View>
    </RNAnimated.View>
  );
}

export default function NetworkScreen() {
  const insets = useSafeAreaInsets();
  const config = useConfig();
  const [copyLabel, setCopyLabel] = useState("Tap to copy link");

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

  const referrerBonuses = config.REFERRAL_BONUS.AMOUNTS;

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
    setCopyLabel("Copied!");
    setTimeout(() => setCopyLabel("Tap to copy link"), 2000);
  };

  const handleShare = async () => {
    const message = getShareMessage();
    try {
      await Share.share({ message });
    } catch (_e) {
      // user cancelled share
    }
  };

  const howItWorks = [
    {
      step: "1",
      title: "Ask Agents to join Rivo",
      desc: "Share your link with agents in your network.",
      circleStyle: styles.stepCircle,
      numberStyle: styles.stepNumber,
    },
    {
      step: "2",
      title: "They refer mortgages to Rivo",
      desc: `Bonuses unlock on their first ${referrerBonuses.length} disbursals.`,
      circleStyle: styles.stepCircle,
      numberStyle: styles.stepNumber,
    },
    {
      step: "3",
      title: "You both get paid",
      desc: formatBonusAmounts(referrerBonuses),
      circleStyle: styles.stepCircleGreen,
      numberStyle: styles.stepNumberBlack,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 48 }]}>
        <Text style={styles.pageTitle}>My network</Text>

        <Text style={styles.codeLabel}>Your Referral Code</Text>
        <Text style={styles.codeText}>{referralCode}</Text>

        <Pressable
          onPress={handleShare}
          style={({ pressed }) => [
            styles.shareBtn,
            pressed && styles.btnPressed,
          ]}
        >
          <Ionicons name="share-social-outline" size={20} color="black" />
          <Text style={styles.shareBtnText}>Invite your network</Text>
        </Pressable>

        <Pressable
          onPress={handleCopy}
          style={({ pressed }) => [
            styles.copyRow,
            pressed && { opacity: 0.6 },
          ]}
        >
          <Ionicons name="copy-outline" size={16} color="#A1A1AA" />
          <Text style={styles.copyRowText}>{copyLabel}</Text>
        </Pressable>

        <View style={styles.divider} />

        <Pressable
          onPress={() => router.push("/referral-info")}
          style={styles.knowMoreRow}
        >
          <Text style={styles.knowMoreText}>
            Know more about the referral program{" "}
          </Text>
          <Ionicons name="chevron-forward" size={16} color="#00D084" />
        </Pressable>

        <Pressable
          onPress={() => router.push("/terms")}
          style={styles.knowMoreRow}
        >
          <Text style={styles.knowMoreText}>Read full T&Cs</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollBody}
        contentContainerStyle={{
          paddingBottom: TAB_BAR_HEIGHT + insets.bottom + 96,
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
        <View style={styles.body}>
          <Text style={styles.sectionTitle}>How it works</Text>
          <View style={styles.stepsContainer}>
            <View style={styles.connectingLine} />
            {howItWorks.map((item, i) => (
              <View key={i} style={styles.stepRow}>
                <View style={item.circleStyle}>
                  <Text style={item.numberStyle}>{item.step}</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>{item.title}</Text>
                  <Text style={styles.stepDesc}>{item.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          <Text style={styles.termsNote}>
            *The referral bonus is subject to the successful disbursal of the
            mortgage. Rivo reserves the right to modify or cancel the referral
            program at any time.{" "}
            <Text
              style={styles.termsLink}
              onPress={() => router.push("/terms")}
            >
              Read full T&Cs
            </Text>
          </Text>

          <View style={styles.networkHeader}>
            <Ionicons name="people" size={20} color="white" />
            <Text style={styles.sectionTitle}>Your Network</Text>
          </View>

          {isLoading ? (
            <>
              <SkeletonRow />
              <SkeletonRow />
            </>
          ) : referredAgents.length === 0 ? (
            <Text style={styles.emptyText}>
              No agents in your network yet. Share your link to start earning
              bonuses.
            </Text>
          ) : (
            referredAgents.map((agent) => (
              <View
                key={agent.id}
                style={[
                  styles.agentRow,
                  agent.deals_count === 0 && { opacity: 0.5 },
                ]}
              >
                <View style={styles.agentInfo}>
                  <Text style={styles.agentName} numberOfLines={1}>{agent.name || "Agent"}</Text>
                  <Text style={styles.agentStat}>
                    Joined {formatDate(agent.created_at)} &middot;{" "}
                    {agent.deals_count}/
                    {bonusSummary?.max_bonuses ?? referrerBonuses.length} Deals
                  </Text>
                </View>
                <View style={styles.agentBonus}>
                  <Text
                    style={[
                      styles.bonusValue,
                      agent.bonus_earned > 0
                        ? { color: "#00D084" }
                        : { color: "#71717A" },
                    ]}
                  >
                    +AED {agent.bonus_earned}
                  </Text>
                  <Text style={styles.bonusLabel}>BONUS</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: "#000000",
    paddingBottom: 32,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#27272A",
    alignItems: "center",
  },
  pageTitle: {
    fontFamily: "Inter_500Medium",
    fontSize: 30,
    color: Colors.text,
    textAlign: "center",
    marginBottom: 24,
  },
  codeLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  codeText: {
    fontFamily: "Inter_500Medium",
    fontSize: 28,
    color: Colors.text,
    letterSpacing: 3,
    marginBottom: 20,
    flexShrink: 1,
  },
  shareBtn: {
    backgroundColor: "white",
    borderRadius: 8,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
  },
  shareBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: "black",
  },
  btnPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  copyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 16,
  },
  copyRowText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#A1A1AA",
  },
  divider: {
    width: "100%",
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#27272A",
    marginTop: 20,
  },
  knowMoreRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    flexWrap: "wrap",
  },
  knowMoreText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: "#00D084",
    flexShrink: 1,
  },
  scrollBody: {
    flex: 1,
  },
  body: {
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: Colors.text,
    marginBottom: 16,
  },
  stepsContainer: {
    position: "relative",
    marginBottom: 20,
  },
  connectingLine: {
    position: "absolute",
    left: 15,
    top: 16,
    bottom: 16,
    width: 2,
    backgroundColor: "#27272A",
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    marginBottom: 20,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#27272A",
    justifyContent: "center",
    alignItems: "center",
  },
  stepCircleGreen: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#00D084",
    justifyContent: "center",
    alignItems: "center",
  },
  stepNumber: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    color: Colors.text,
  },
  stepNumberBlack: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    color: "black",
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
  termsNote: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#71717A",
    lineHeight: 18,
    marginBottom: 28,
  },
  termsLink: {
    color: "#A1A1AA",
    textDecorationLine: "underline",
  },
  networkHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.textMuted,
    lineHeight: 20,
  },
  agentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#27272A",
  },
  agentInfo: {
    flex: 1,
    gap: 4,
  },
  agentName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: Colors.text,
    flexShrink: 1,
  },
  agentStat: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#71717A",
  },
  agentBonus: {
    alignItems: "flex-end",
    gap: 2,
  },
  bonusValue: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  bonusLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "#71717A",
    textTransform: "uppercase",
  },
  skeletonRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#27272A",
  },
  skeletonName: {
    width: 120,
    height: 14,
    borderRadius: 4,
    backgroundColor: "#27272A",
  },
  skeletonStat: {
    width: 180,
    height: 10,
    borderRadius: 4,
    backgroundColor: "#27272A",
  },
  skeletonBonus: {
    width: 60,
    height: 14,
    borderRadius: 4,
    backgroundColor: "#27272A",
  },
  skeletonLabel: {
    width: 40,
    height: 10,
    borderRadius: 4,
    backgroundColor: "#27272A",
  },
});
