import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";

import Colors from "@/constants/colors";
import { getClients, ClientRecord } from "@/lib/api";
import { ClientStatus } from "@/constants/api";

const TAB_BAR_HEIGHT = 84;

const STATUS_LABELS: Record<string, string> = {
  SUBMITTED: "Submitted",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  SUBMITTED_TO_BANK: "Submitted to Bank",
  PREAPPROVED: "Preapproved",
  FOL_RECEIVED: "FOL Received",
  DISBURSED: "Disbursed",
  DECLINED: "Declined",
};

const STATUS_COLORS: Record<string, string> = {
  DISBURSED: "#00D084",
  DECLINED: "#71717A",
};

const DEFAULT_STATUS_COLOR = "#A1A1AA";

function getStatusColor(status: string): string {
  return STATUS_COLORS[status] ?? DEFAULT_STATUS_COLOR;
}

function getStatusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-AE", {
    day: "numeric",
    month: "short",
  });
}

function ClientRow({ item, isLast }: { item: ClientRecord; isLast: boolean }) {
  const commissionValue =
    item.commission_amount != null
      ? item.commission_amount
      : item.estimated_commission ?? 0;

  return (
    <View style={[styles.row, isLast && { borderBottomWidth: 0 }]}>
      <View style={styles.rowTop}>
        <View style={styles.rowTopLeft}>
          <Text style={styles.clientName} numberOfLines={1}>
            {item.client_name}
          </Text>
          <Text style={styles.clientDate}>{formatDate(item.created_at)}</Text>
        </View>
        <Text style={[styles.statusLabel, { color: getStatusColor(item.status) }]}>
          {getStatusLabel(item.status)}
        </Text>
      </View>
      <View style={styles.rowBottom}>
        <View>
          <Text style={styles.fieldLabel}>Loan Amount</Text>
          <Text style={styles.loanValue}>
            AED {(item.expected_mortgage_amount ?? 0).toLocaleString("en-AE")}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" as const }}>
          <Text style={styles.fieldLabel}>Est. Commission</Text>
          <Text style={styles.commissionValue}>
            AED {commissionValue.toLocaleString("en-AE")}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function ClientsScreen() {
  const insets = useSafeAreaInsets();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

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

  const clients: ClientRecord[] = data ?? [];

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.headerSection,
          { paddingTop: insets.top > 0 ? insets.top : 48 },
        ]}
      >
        <View style={styles.titleRow}>
          <Text style={styles.pageTitle}>Clients</Text>
          <Pressable
            onPress={() => router.push("/submit-lead")}
            style={({ pressed }) => [
              styles.addClientBtn,
              pressed && { opacity: 0.8 },
            ]}
          >
            <Text style={styles.addClientBtnText}>Add Client</Text>
          </Pressable>
        </View>
        <View style={styles.searchRow}>
          <Ionicons
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
            <TouchableOpacity
              onPress={() => {
                setSearch("");
                setDebouncedSearch("");
              }}
            >
              <Ionicons
                name="close"
                size={18}
                color={Colors.textMuted}
                style={styles.searchClear}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size={24} color="#FFFFFF" />
        </View>
      ) : (
        <FlatList
          data={clients}
          keyExtractor={(item, idx) =>
            item.id?.toString() ?? idx.toString()
          }
          renderItem={({ item, index }) => (
            <ClientRow item={item} isLast={index === clients.length - 1} />
          )}
          contentContainerStyle={{
            paddingBottom: TAB_BAR_HEIGHT + insets.bottom + 20,
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
              <Text style={styles.emptyTitle}>No clients yet.</Text>
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
    backgroundColor: "#000000",
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#27272A",
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 30,
    fontWeight: "500",
    color: Colors.text,
  },
  addClientBtn: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addClientBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#18181B",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    height: 48,
  },
  searchClear: {
    padding: 4,
  },
  row: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#27272A",
  },
  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  rowTopLeft: {
    flex: 1,
    marginRight: 10,
  },
  clientName: {
    fontSize: 18,
    fontWeight: "500",
    color: Colors.text,
    flexShrink: 1,
  },
  clientDate: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  rowBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 4,
  },
  fieldLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  loanValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#D4D4D8",
  },
  commissionValue: {
    fontSize: 18,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    color: "#71717A",
  },
  emptyText: {
    fontSize: 14,
    color: "#71717A",
    textAlign: "center",
  },
});
