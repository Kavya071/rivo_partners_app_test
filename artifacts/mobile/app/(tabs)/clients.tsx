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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";

import Colors from "@/constants/colors";
import { getClients, ClientRecord } from "@/lib/api";
import { ClientStatus } from "@/constants/api";
import Icon from "@/components/Icon";
import { useResponsive } from "@/hooks/useResponsive";

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

function ClientRow({ item, isLast, r }: { item: ClientRecord; isLast: boolean; r: ReturnType<typeof useResponsive> }) {
  const commissionValue =
    item.commission_amount != null
      ? item.commission_amount
      : item.estimated_commission ?? 0;

  return (
    <View style={[styles.row, { paddingHorizontal: r.screenPadding, paddingVertical: r.sp(18) }, isLast && { borderBottomWidth: 0 }]}>
      <View style={styles.rowTop}>
        <View style={styles.rowTopLeft}>
          <Text style={[styles.clientName, { fontSize: r.fs(18) }]} numberOfLines={1}>
            {item.client_name}
          </Text>
          <Text style={[styles.clientDate, { fontSize: r.fs(12) }]}>{formatDate(item.created_at)}</Text>
        </View>
        <Text style={[styles.statusLabel, { color: getStatusColor(item.status), fontSize: r.fs(12) }]}>
          {getStatusLabel(item.status)}
        </Text>
      </View>
      <View style={styles.rowBottom}>
        <View>
          <Text style={[styles.fieldLabel, { fontSize: r.fs(12) }]}>Loan Amount</Text>
          <Text style={[styles.loanValue, { fontSize: r.fs(16) }]}>
            AED {(item.expected_mortgage_amount ?? 0).toLocaleString("en-AE")}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" as const }}>
          <Text style={[styles.fieldLabel, { fontSize: r.fs(12) }]}>Est. Commission</Text>
          <Text style={[styles.commissionValue, { fontSize: r.fs(18) }]}>
            AED {commissionValue.toLocaleString("en-AE")}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function ClientsScreen() {
  const insets = useSafeAreaInsets();
  const r = useResponsive();

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
          {
            paddingTop: insets.top > 0 ? insets.top : 48,
            paddingHorizontal: r.screenPadding,
            paddingBottom: r.sp(20),
          },
        ]}
      >
        <View style={[styles.titleRow, { marginBottom: r.sp(16) }]}>
          <Text style={[styles.pageTitle, { fontSize: r.fs(30) }]}>Clients</Text>
          <Pressable
            onPress={() => router.push("/submit-lead")}
            style={({ pressed }) => [
              styles.addClientBtn,
              pressed && { opacity: 0.8 },
            ]}
          >
            <Text style={[styles.addClientBtnText, { fontSize: r.fs(14) }]}>Add Client</Text>
          </Pressable>
        </View>
        <View style={[styles.searchRow, { paddingHorizontal: r.sp(12) }]}>
          <Icon
            name="search"
            size={18}
            color={Colors.textMuted}
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, { fontSize: r.fs(15) }]}
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
              <Icon
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
            <ClientRow item={item} isLast={index === clients.length - 1} r={r} />
          )}
          contentContainerStyle={{
            paddingBottom: TAB_BAR_HEIGHT + insets.bottom + r.sp(20),
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
              <Text style={[styles.emptyTitle, { fontSize: r.fs(16) }]}>No clients yet.</Text>
              <Text style={[styles.emptyText, { fontSize: r.fs(14) }]}>
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
    borderBottomWidth: 1,
    borderBottomColor: "#27272A",
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pageTitle: {
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
    fontWeight: "600",
    color: "#000000",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#18181B",
    borderRadius: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: Colors.text,
    height: 48,
  },
  searchClear: {
    padding: 4,
  },
  row: {
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
    fontWeight: "500",
    color: Colors.text,
    flexShrink: 1,
  },
  clientDate: {
    color: Colors.textMuted,
    marginTop: 4,
  },
  statusLabel: {
    fontWeight: "500",
    letterSpacing: 0.5,
    flexShrink: 1,
    maxWidth: "40%",
    textAlign: "right",
  },
  rowBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 8,
  },
  fieldLabel: {
    color: Colors.textMuted,
    marginBottom: 2,
  },
  loanValue: {
    fontWeight: "500",
    color: "#D4D4D8",
    flexShrink: 1,
  },
  commissionValue: {
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
    color: "#71717A",
  },
  emptyText: {
    color: "#71717A",
    textAlign: "center",
  },
});
