import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Linking,
} from "react-native";
import { router } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import Animated, { FadeInDown } from "react-native-reanimated";

import Colors from "@/constants/colors";
import { getMe, HomeBanner } from "@/lib/api";
import { useConfig } from "@/context/ConfigContext";

const TAB_BAR_HEIGHT = 84;

function formatCurrency(val: number | string): string {
  const num = typeof val === "string" ? parseFloat(val) : val;
  if (isNaN(num)) return "0";
  return num.toLocaleString("en-AE");
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const webTopPad = Platform.OS === "web" ? 67 : 0;
  const config = useConfig();

  const {
    data: agent,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["agent-me"],
    queryFn: getMe,
  });

  const firstName = agent?.name?.split(" ")[0] || agent?.phone || "Partner";
  const totalEarned = parseFloat(agent?.total_earned || "0");
  const pendingAmount = parseFloat(agent?.pending_amount || "0");
  const disbursalsCount = agent?.disbursed_count ?? 0;

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const banners = config.HOME_BANNERS;

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
      <Animated.View entering={FadeInDown.duration(500)}>
        <View style={styles.greetingRow}>
          <View style={styles.greetingLeft}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {(agent?.name || agent?.phone || "?").charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.greeting}>{firstName}</Text>
              <View style={styles.onlineRow}>
                <View style={styles.onlineDot} />
                <Text style={styles.onlineText}>Online</Text>
              </View>
            </View>
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(100).duration(500)}>
        <View style={styles.earningsCard}>
          <Text style={styles.earningsLabel}>Total Paid</Text>
          <View style={styles.earningsRow}>
            <Text style={styles.earningsCurrency}>AED</Text>
            <Text style={styles.earningsAmount}>
              {formatCurrency(totalEarned)}
            </Text>
          </View>
          <View style={styles.earningsStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Pending</Text>
              <Text style={styles.statValue}>
                AED {formatCurrency(pendingAmount)}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Disbursals</Text>
              <Text style={styles.statValue}>{disbursalsCount}</Text>
            </View>
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(500)}>
        <Text style={styles.sectionTitle}>Actions</Text>
        <View style={styles.actionsRow}>
          <Pressable
            onPress={() => router.push("/submit-lead")}
            style={({ pressed }) => [
              styles.actionCard,
              styles.actionCardPrimary,
              pressed && styles.actionPressed,
            ]}
          >
            <View style={styles.actionIconPrimary}>
              <Feather name="user-plus" size={22} color="#fff" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Submit Client</Text>
              <Text style={styles.actionSub}>
                Earn ~AED {config.COMMISSION.AVG_PAYOUT.toLocaleString()}
              </Text>
              <View style={styles.commissionBadge}>
                <Text style={styles.commissionBadgeText}>
                  {config.COMMISSION.MIN_PERCENT}%–{config.COMMISSION.MAX_PERCENT}%
                </Text>
              </View>
            </View>
          </Pressable>

          <Pressable
            onPress={() => router.push("/(tabs)/network")}
            style={({ pressed }) => [
              styles.actionCard,
              pressed && styles.actionPressed,
            ]}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="people" size={22} color={Colors.primary} />
            </View>
            <Text style={styles.actionTitleDark}>Invite{"\n"}Agent</Text>
            <Feather
              name="arrow-right"
              size={18}
              color={Colors.textMuted}
            />
          </Pressable>
        </View>
      </Animated.View>

      {!agent?.is_profile_complete && (
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <Pressable
            onPress={() => router.push("/(tabs)/profile")}
            style={({ pressed }) => [
              styles.profileNudge,
              pressed && { opacity: 0.8 },
            ]}
          >
            <View style={styles.profileNudgeContent}>
              <Text style={styles.profileNudgeTitle}>Complete your profile</Text>
              <Text style={styles.profileNudgeDesc}>
                Add your name, type, and email.
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color={Colors.textMuted} />
          </Pressable>
        </Animated.View>
      )}

      {banners.length > 0 && (
        <Animated.View entering={FadeInDown.delay(400).duration(500)}>
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Updates</Text>
          {banners.map((banner: HomeBanner) => (
            <Pressable
              key={banner.id}
              onPress={() => {
                if (banner.cta_link) {
                  if (banner.cta_link.startsWith("/")) {
                    router.push(banner.cta_link as never);
                  } else {
                    Linking.openURL(banner.cta_link);
                  }
                }
              }}
              style={({ pressed }) => [
                styles.bannerCard,
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text style={styles.bannerTitle}>{banner.title}</Text>
              {banner.subtitle ? (
                <Text style={styles.bannerSubtitle}>{banner.subtitle}</Text>
              ) : null}
              {banner.cta_text ? (
                <View style={styles.bannerCtaRow}>
                  <Text style={styles.bannerCtaText}>{banner.cta_text}</Text>
                  <Feather name="chevron-right" size={16} color={Colors.primary} />
                </View>
              ) : null}
            </Pressable>
          ))}
        </Animated.View>
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
  greetingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
  },
  greetingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatarText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: Colors.text,
  },
  greeting: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 20,
    color: Colors.text,
  },
  onlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  onlineText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.textMuted,
  },
  earningsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 28,
  },
  earningsLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  earningsRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginBottom: 20,
  },
  earningsCurrency: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: Colors.textSecondary,
  },
  earningsAmount: {
    fontFamily: "Inter_700Bold",
    fontSize: 42,
    color: Colors.text,
  },
  earningsStats: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: Colors.text,
  },
  statLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.border,
  },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: Colors.text,
    marginBottom: 14,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: "space-between",
    minHeight: 140,
  },
  actionCardPrimary: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
  },
  actionPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  actionIconPrimary: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primary + "15",
    justifyContent: "center",
    alignItems: "center",
  },
  actionContent: {
    marginTop: 12,
    gap: 4,
  },
  actionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: Colors.text,
  },
  actionSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.textSecondary,
  },
  commissionBadge: {
    alignSelf: "flex-start",
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary + "50",
    backgroundColor: Colors.background,
  },
  commissionBadgeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: Colors.primary,
  },
  actionTitleDark: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: Colors.text,
    marginTop: 12,
  },
  profileNudge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 20,
  },
  profileNudgeContent: {
    flex: 1,
  },
  profileNudgeTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.text,
    marginBottom: 2,
  },
  profileNudgeDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.textMuted,
  },
  bannerCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 10,
  },
  bannerTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: Colors.text,
  },
  bannerSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  bannerCtaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 10,
  },
  bannerCtaText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: Colors.primary,
  },
});
