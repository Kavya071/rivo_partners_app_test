import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";

import Colors from "@/constants/colors";
import { getMe, updateProfile, logout, deleteAccount } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const TAB_BAR_HEIGHT = 84;

const DEFAULT_AGENT_TYPES = [
  "Independent Agent",
  "Agency Agent",
  "Broker",
  "Developer Sales",
  "Other",
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const webTopPad = Platform.OS === "web" ? 67 : 0;
  const { signOut } = useAuth();
  const queryClient = useQueryClient();

  const { data: agent, isLoading } = useQuery({
    queryKey: ["agent-me"],
    queryFn: getMe,
  });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [agentType, setAgentType] = useState("");
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const agentTypeOptions = useMemo(() => {
    if (agent?.agent_type_options && Array.isArray(agent.agent_type_options) && agent.agent_type_options.length > 0) {
      return agent.agent_type_options;
    }
    return DEFAULT_AGENT_TYPES;
  }, [agent]);

  useEffect(() => {
    if (agent) {
      setName(agent.name ?? "");
      setEmail(agent.email ?? "");
      setAgentType(agent.agent_type ?? "");
    }
  }, [agent]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ name, email, agent_type: agentType });
      queryClient.invalidateQueries({ queryKey: ["agent-me"] });
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert("Saved", "Profile updated successfully");
    } catch (_e) {
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
          } catch (_e) {
            // ignore
          }
          await signOut();
          router.replace("/");
        },
      },
    ]);
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Account",
      "This action cannot be undone. All your data will be permanently deleted.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAccount();
            } catch (_e) {
              // ignore
            }
            await signOut();
            router.replace("/");
          },
        },
      ],
    );
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
        paddingBottom: TAB_BAR_HEIGHT + insets.bottom + 40,
        paddingHorizontal: 20,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.pageTitle}>Profile</Text>

      <View style={styles.profileHeader}>
        <View style={styles.avatarLarge}>
          <Feather name="user" size={32} color={Colors.primary} />
        </View>
        <Text style={styles.profileName}>{agent?.name ?? "Partner"}</Text>
        <Text style={styles.profilePhone}>{agent?.phone ?? ""}</Text>
        <View style={styles.verifiedBadge}>
          <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
          <Text style={styles.verifiedText}>Verified Partner</Text>
        </View>
      </View>

      <View style={styles.formSection}>
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Full Name</Text>
          <TextInput
            style={styles.textInput}
            value={name}
            onChangeText={setName}
            placeholderTextColor={Colors.textMuted}
            placeholder="Your full name"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Agent Type</Text>
          <Pressable
            onPress={() => setShowTypePicker(!showTypePicker)}
            style={styles.selectInput}
          >
            <Text
              style={[
                styles.selectText,
                !agentType && { color: Colors.textMuted },
              ]}
            >
              {agentType || "Select type"}
            </Text>
            <Feather
              name={showTypePicker ? "chevron-up" : "chevron-down"}
              size={18}
              color={Colors.textMuted}
            />
          </Pressable>
          {showTypePicker && (
            <View style={styles.pickerDropdown}>
              {agentTypeOptions.map((type) => (
                <Pressable
                  key={type}
                  onPress={() => {
                    setAgentType(type);
                    setShowTypePicker(false);
                  }}
                  style={({ pressed }) => [
                    styles.pickerItem,
                    agentType === type && styles.pickerItemSelected,
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      agentType === type && styles.pickerItemTextSelected,
                    ]}
                  >
                    {type}
                  </Text>
                  {agentType === type && (
                    <Feather name="check" size={16} color={Colors.primary} />
                  )}
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Email</Text>
          <TextInput
            style={styles.textInput}
            value={email}
            onChangeText={setEmail}
            placeholder="your@email.com"
            placeholderTextColor={Colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <Pressable
          onPress={handleSave}
          disabled={saving}
          style={({ pressed }) => [
            styles.saveBtn,
            saving && styles.saveBtnDisabled,
            pressed && !saving && styles.btnPressed,
          ]}
        >
          {saving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.saveBtnText}>Save Changes</Text>
          )}
        </Pressable>
      </View>

      <View style={styles.dangerSection}>
        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [
            styles.dangerBtn,
            pressed && { opacity: 0.7 },
          ]}
        >
          <Feather name="log-out" size={18} color={Colors.textSecondary} />
          <Text style={styles.dangerBtnText}>Sign Out</Text>
        </Pressable>

        <Pressable
          onPress={handleDelete}
          style={({ pressed }) => [
            styles.dangerBtn,
            styles.deleteBtnStyle,
            pressed && { opacity: 0.7 },
          ]}
        >
          <Feather name="trash-2" size={18} color={Colors.danger} />
          <Text style={[styles.dangerBtnText, { color: Colors.danger }]}>
            Delete Account
          </Text>
        </Pressable>
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
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 32,
    gap: 8,
  },
  avatarLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary + "15",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.primary + "30",
    marginBottom: 4,
  },
  profileName: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: Colors.text,
  },
  profilePhone: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.textSecondary,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.primary + "15",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 4,
  },
  verifiedText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: Colors.primary,
  },
  formSection: {
    gap: 18,
    marginBottom: 32,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: 2,
  },
  textInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    height: 48,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: Colors.text,
  },
  selectInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectText: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: Colors.text,
  },
  pickerDropdown: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
    marginTop: 4,
  },
  pickerItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  pickerItemSelected: {
    backgroundColor: Colors.primary + "10",
  },
  pickerItemText: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: Colors.text,
  },
  pickerItemTextSelected: {
    fontFamily: "Inter_600SemiBold",
    color: Colors.primary,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: "#fff",
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  dangerSection: {
    gap: 8,
  },
  dangerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    height: 48,
  },
  deleteBtnStyle: {
    borderColor: Colors.danger + "30",
    backgroundColor: Colors.danger + "08",
  },
  dangerBtnText: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    color: Colors.textSecondary,
  },
});
