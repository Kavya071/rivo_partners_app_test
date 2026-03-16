import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";

import Colors from "@/constants/colors";
import { getClients, ClientRecord } from "@/lib/api";
import { ClientStatus } from "@/constants/api";

const TAB_BAR_HEIGHT = 84;

function getStatusColor(status: ClientStatus): string {
  switch (status) {
    case "DISBURSED":
      return Colors.success;
    case "DECLINED":
      return Colors.danger;
    case "PREAPPROVED":
    case "FOL_RECEIVED":
      return Colors.warning;
    default:
      return Colors.textSecondary;
  }
}

function formatStatus(status: string): string {
  return status.replace(/_/g, " ");
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ClientCard({ item }: { item: ClientRecord }) {
  const status = item.status as ClientStatus;
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardNameRow}>
          <View style={styles.clientAvatar}>
            <Text style={styles.clientInitial}>
              {(item.client_name || "?")[0].toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.clientName} numberOfLines={1}>
              {item.client_name}
            </Text>
            <Text style={styles.clientDate}>
              {formatDate(item.created_at)}
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(status) + "18" },
          ]}
        >
          <Text
            style={[styles.statusText, { color: getStatusColor(status) }]}
          >
            {formatStatus(status)}
          </Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <View style={styles.cardStat}>
          <Text style={styles.cardStatLabel}>Loan Amount</Text>
          <Text style={styles.cardStatValue}>
            AED {(item.expected_mortgage_amount ?? 0).toLocaleString("en-AE")}
          </Text>
        </View>
        {item.commission != null && (
          <View style={[styles.cardStat, { alignItems: "flex-end" as const }]}>
            <Text style={styles.cardStatLabel}>Commission</Text>
            <Text style={[styles.cardStatValue, { color: Colors.primary }]}>
              AED {(item.commission ?? 0).toLocaleString("en-AE")}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default function ClientsScreen() {
  const insets = useSafeAreaInsets();
  const webTopPad = Platform.OS === "web" ? 67 : 0;

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback((text: string) => {
    setSearch(text);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setDebouncedSearch(text);
    }, 300);
  }, []);

  const {
    data,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["clients", debouncedSearch],
    queryFn: () => getClients(debouncedSearch || undefined),
  });

  const clients: ClientRecord[] = Array.isArray(data)
    ? data
    : (data as { results?: ClientRecord[] })?.results ?? [];

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.headerSection,
          { paddingTop: insets.top + webTopPad + 16 },
        ]}
      >
        <Text style={styles.pageTitle}>Clients</Text>
        <View style={styles.searchRow}>
          <Feather
            name="search"
            size={18}
            color={Colors.textMuted}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search clients..."
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={handleSearch}
            autoCorrect={false}
          />
          {search.length > 0 && (
            <Feather
              name="x"
              size={18}
              color={Colors.textMuted}
              onPress={() => {
                setSearch("");
                setDebouncedSearch("");
              }}
              style={styles.searchClear}
            />
          )}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={clients}
          keyExtractor={(item, idx) =>
            item.id?.toString() ?? idx.toString()
          }
          renderItem={({ item }) => <ClientCard item={item} />}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: TAB_BAR_HEIGHT + insets.bottom + 20,
            paddingTop: 8,
          }}
          showsVerticalScrollIndicator={false}
          scrollEnabled={clients.length > 0}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={Colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Feather
                name="users"
                size={40}
                color={Colors.textMuted}
              />
              <Text style={styles.emptyTitle}>No clients yet</Text>
              <Text style={styles.emptyText}>
                Submit your first client to start earning
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  pageTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    color: Colors.text,
    marginBottom: 16,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: Colors.text,
    height: 44,
  },
  searchClear: {
    padding: 4,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  cardNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    marginRight: 10,
  },
  clientAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary + "15",
    justifyContent: "center",
    alignItems: "center",
  },
  clientInitial: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: Colors.primary,
  },
  clientName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: Colors.text,
  },
  clientDate: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  cardStat: {
    gap: 2,
  },
  cardStatLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.textMuted,
  },
  cardStatValue: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.text,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 10,
  },
  emptyTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: Colors.text,
    marginTop: 8,
  },
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
  },
});
