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
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useQuery } from "@tanstack/react-query";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";

import Colors from "@/constants/colors";
import { getNetwork } from "@/lib/api";

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

export default function NetworkScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const webTopPad = Platform.OS === "web" ? 67 : 0;

  const {
    data: networkData,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["network"],
    queryFn: getNetwork,
  });

  const referralCode = networkData?.referral_code ?? "RIVO-XXXX";
  const referredAgents = networkData?.referred_agents ?? [];
  const referralLink = `https://rivo.partners/join/${referralCode}`;

  const handleCopy = async () => {
    await Clipboard.setStringAsync(referralLink);
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    Alert.alert("Copied!", "Referral link copied to clipboard");
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join Rivo Partners and earn on every mortgage referral! Use my code: ${referralCode}\n\n${referralLink}`,
      });
    } catch (e) {
      console.error(e);
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
        paddingBottom: tabBarHeight + 20,
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
      <Text style={styles.pageTitle}>Network</Text>

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

      {referredAgents.length > 0 && (
        <View style={styles.referredSection}>
          <Text style={styles.sectionTitle}>Your Network</Text>
          {referredAgents.map((agent: any, i: number) => (
            <View key={i} style={styles.agentCard}>
              <View style={styles.agentAvatar}>
                <Feather name="user" size={16} color={Colors.primary} />
              </View>
              <View style={styles.agentInfo}>
                <Text style={styles.agentName}>{agent.name ?? "Agent"}</Text>
                <Text style={styles.agentStat}>
                  {agent.deals_count ?? 0} deals
                </Text>
              </View>
              <View style={styles.agentBonus}>
                <Text style={styles.bonusLabel}>Bonus</Text>
                <Text style={styles.bonusValue}>
                  AED {(agent.bonus ?? 0).toLocaleString("en-AE")}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
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
    color: Colors.primary,
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
  referredSection: {},
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
  },
  bonusValue: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.primary,
  },
});
