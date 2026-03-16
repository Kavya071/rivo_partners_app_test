import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Image,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
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
    <View style={styles.container}>
      <View style={[styles.stickyHeader, { paddingTop: insets.top > 0 ? insets.top : 48 }]}>
        <View style={styles.greetingRow}>
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

        <View style={styles.totalPaidSection}>
          <Text style={styles.totalPaidLabel}>Total Paid</Text>
          <Text style={styles.totalPaidValue}>
            AED {totalEarned.toLocaleString()}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View>
            <Text style={styles.statLabel}>PENDING</Text>
            <Text style={styles.statValue}>
              AED {formatCurrency(pendingAmount)}
            </Text>
          </View>
          <View>
            <Text style={styles.statLabel}>DISBURSALS</Text>
            <Text style={styles.statValue}>{disbursalsCount}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingBottom: TAB_BAR_HEIGHT + insets.bottom + 20,
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
        <Animated.View entering={FadeInDown.duration(500)} style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Actions</Text>
          <View style={styles.actionsRow}>
            <Pressable
              onPress={() => router.push("/submit-lead")}
              style={({ pressed }) => [
                styles.actionCard,
                pressed && styles.actionPressed,
              ]}
            >
              <View style={styles.actionIconWhite}>
                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color="#000"
                  style={{ transform: [{ rotate: "-45deg" }] }}
                />
              </View>
              <Text style={styles.actionTitle}>Submit Client</Text>
              <Text style={styles.actionSub}>
                Earn ~AED {config.COMMISSION.AVG_PAYOUT.toLocaleString()}
              </Text>
              <View style={styles.commissionBadge}>
                <Text style={styles.commissionBadgeText}>
                  {config.COMMISSION.MIN_PERCENT}% - {config.COMMISSION.MAX_PERCENT}%
                </Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => router.push("/(tabs)/network")}
              style={({ pressed }) => [
                styles.actionCard,
                pressed && styles.actionPressed,
              ]}
            >
              <View style={styles.actionIconGreen}>
                <Ionicons name="people" size={20} color="#fff" />
              </View>
              <Text style={styles.actionTitle}>Invite Agent</Text>
              <Text style={styles.actionSub}>
                Get AED {config.REFERRAL_BONUS.TOTAL_POTENTIAL.toLocaleString()} Bonus
              </Text>
            </Pressable>
          </View>
        </Animated.View>

        {banners.length > 0 && (
          <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.bannersSection}>
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
                {banner.thumbnail ? (
                  <Image
                    source={{ uri: banner.thumbnail }}
                    style={styles.bannerThumbnail}
                    resizeMode="cover"
                  />
                ) : null}
                <View style={styles.bannerContent}>
                  {banner.icon ? (
                    <Text style={styles.bannerIcon}>{banner.icon}</Text>
                  ) : null}
                  <Text style={styles.bannerTitle}>{banner.title}</Text>
                  {banner.subtitle ? (
                    <Text style={styles.bannerSubtitle}>{banner.subtitle}</Text>
                  ) : null}
                  {banner.cta_text && banner.cta_link ? (
                    <Text style={styles.bannerCtaText}>{banner.cta_text}</Text>
                  ) : null}
                </View>
              </Pressable>
            ))}
          </Animated.View>
        )}

        {agent?.is_profile_complete === false && (
          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
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
              <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
            </Pressable>
          </Animated.View>
        )}
      </ScrollView>
    </View>
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
  stickyHeader: {
    backgroundColor: "#000000",
    borderBottomWidth: 1,
    borderBottomColor: "#27272A",
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#27272A",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  greeting: {
    fontSize: 20,
    fontWeight: "500",
    color: "#FFFFFF",
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
    backgroundColor: "#00D084",
  },
  onlineText: {
    fontSize: 12,
    color: "#A1A1AA",
  },
  totalPaidSection: {
    marginTop: 32,
  },
  totalPaidLabel: {
    fontSize: 14,
    color: "#A1A1AA",
  },
  totalPaidValue: {
    fontSize: 48,
    fontWeight: "500",
    color: "#FFFFFF",
    letterSpacing: -1,
  },
  statsRow: {
    flexDirection: "row",
    gap: 32,
    marginTop: 24,
  },
  statLabel: {
    fontSize: 12,
    color: "#71717A",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  actionsSection: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 16,
  },
  actionCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  actionIconWhite: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  actionIconGreen: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#00D084",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  actionSub: {
    fontSize: 13,
    color: "#A1A1AA",
    marginTop: 4,
  },
  commissionBadge: {
    alignSelf: "flex-start",
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "rgba(0, 208, 132, 0.15)",
  },
  commissionBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#00D084",
  },
  bannersSection: {
    paddingHorizontal: 24,
    gap: 16,
  },
  bannerCard: {
    backgroundColor: "#18181B",
    borderWidth: 1,
    borderColor: "#27272A",
    borderRadius: 8,
    overflow: "hidden",
  },
  bannerThumbnail: {
    width: "100%",
    height: 160,
  },
  bannerContent: {
    padding: 16,
  },
  bannerIcon: {
    fontSize: 20,
    marginBottom: 8,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  bannerSubtitle: {
    fontSize: 13,
    color: "#A1A1AA",
    marginTop: 4,
  },
  bannerCtaText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#00D084",
    marginTop: 10,
  },
  profileNudge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginHorizontal: 24,
    marginTop: 16,
  },
  profileNudgeContent: {
    flex: 1,
  },
  profileNudgeTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  profileNudgeDesc: {
    fontSize: 12,
    color: "#71717A",
  },
});
