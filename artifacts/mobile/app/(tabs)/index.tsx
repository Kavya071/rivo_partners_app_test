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
} from "react-native";
import { router } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import Animated, { FadeInDown } from "react-native-reanimated";

import Colors from "@/constants/colors";
import { getMe } from "@/lib/api";

const TAB_BAR_HEIGHT = 84;

function formatCurrency(val: number): string {
  return val?.toLocaleString("en-AE") ?? "0";
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const webTopPad = Platform.OS === "web" ? 67 : 0;

  const {
    data: agent,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["agent-me"],
    queryFn: getMe,
  });

  const firstName = agent?.name?.split(" ")[0] ?? "Partner";
  const totalEarned = agent?.total_earned ?? 0;
  const pendingAmount = agent?.pending_amount ?? 0;
  const disbursalsCount = agent?.disbursals_count ?? 0;

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
      <Animated.View entering={FadeInDown.duration(500)}>
        <View style={styles.greetingRow}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.name}>{firstName}</Text>
          </View>
          <View style={styles.avatarCircle}>
            <Feather name="user" size={20} color={Colors.primary} />
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(100).duration(500)}>
        <View style={styles.earningsCard}>
          <Text style={styles.earningsLabel}>Total Earned</Text>
          <View style={styles.earningsRow}>
            <Text style={styles.earningsCurrency}>AED</Text>
            <Text style={styles.earningsAmount}>
              {formatCurrency(totalEarned)}
            </Text>
          </View>
          <View style={styles.earningsStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                AED {formatCurrency(pendingAmount)}
              </Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{disbursalsCount}</Text>
              <Text style={styles.statLabel}>Disbursals</Text>
            </View>
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(500)}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
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
            <Text style={styles.actionTitle}>Submit{"\n"}Client</Text>
            <Feather
              name="arrow-right"
              size={18}
              color="rgba(255,255,255,0.6)"
            />
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
  greeting: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: Colors.textSecondary,
  },
  name: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    color: Colors.text,
    marginTop: 2,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary + "15",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.primary + "30",
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
    fontSize: 13,
    color: Colors.textSecondary,
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
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  actionPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  actionIconPrimary: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
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
  actionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: "#fff",
    marginTop: 12,
  },
  actionTitleDark: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: Colors.text,
    marginTop: 12,
  },
});
