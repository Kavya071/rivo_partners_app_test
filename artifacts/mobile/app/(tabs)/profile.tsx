import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Platform,
  ActivityIndicator,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";

import Colors from "@/constants/colors";
import { getMe, updateProfile, logout, deleteAccount } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const AGENT_TYPE_OPTIONS = [
  { value: "RE_BROKER", label: "Real Estate Broker" },
  { value: "MORTGAGE_BROKER", label: "Mortgage Broker" },
  { value: "OTHER", label: "Other" },
];

function getAgentTypeLabel(value: string): string {
  const found = AGENT_TYPE_OPTIONS.find((o) => o.value === value);
  return found ? found.label : value || "Select type";
}

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();

  const { data: agent, isLoading } = useQuery({
    queryKey: ["agent-me"],
    queryFn: getMe,
  });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [agentType, setAgentType] = useState("");
  const [agentTypeOther, setAgentTypeOther] = useState("");
  const [reraNumber, setReraNumber] = useState("");
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (agent) {
      setName(agent.name ?? "");
      setEmail(agent.email ?? "");
      setAgentType(agent.agent_type ?? "");
      setAgentTypeOther(agent.agent_type_other ?? "");
      setReraNumber(agent.rera_number ?? "");
      setIsEditing(!agent.is_profile_complete);
    }
  }, [agent]);

  const showReraField = agentType === "RE_BROKER";
  const showOtherField = agentType === "OTHER";
  const showConnectAccounts = isEditing && !email;

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: Record<string, string> = {
        name,
        email,
        agent_type: agentType,
        agent_type_other: showOtherField ? agentTypeOther : "",
        rera_number: showReraField ? reraNumber : "",
      };
      await updateProfile(payload);
      queryClient.invalidateQueries({ queryKey: ["agent-me"] });
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setIsEditing(false);
    } catch (_e) {
      // silent
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (_e) {
      // ignore
    }
    router.replace("/");
    try {
      await signOut();
    } catch (_e) {
      // ignore
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAccount();
    } catch (_e) {
      // ignore
    }
    router.replace("/");
    try {
      await signOut();
    } catch (_e) {
      // ignore
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
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top > 0 ? insets.top + 8 : 48 }]}>
        <Text style={styles.headerTitle}>Profile</Text>
        {!isEditing && (
          <Pressable onPress={() => setIsEditing(true)}>
            <Text style={styles.editLink}>Edit</Text>
          </Pressable>
        )}
      </View>

      <KeyboardAwareScrollViewCompat
        bottomOffset={20}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 96 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.avatarRow}>
          <View style={styles.avatar}>
            <Ionicons name="person-outline" size={40} color="#A1A1AA" />
          </View>
          <View style={styles.avatarInfo}>
            <Text style={styles.profileName} numberOfLines={1}>
              {agent?.name || "Partner"}
            </Text>
            <Text style={styles.profilePhone}>{agent?.phone || ""}</Text>
            <View style={styles.verifiedBadge}>
              <Ionicons
                name="checkmark-circle"
                size={14}
                color={Colors.primary}
              />
              <Text style={styles.verifiedText}>Verified Partner</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Personal Details</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Full Name</Text>
          <TextInput
            style={[styles.textInput, !isEditing && styles.textInputDisabled]}
            value={name}
            onChangeText={setName}
            placeholderTextColor={Colors.textMuted}
            placeholder="Your full name"
            editable={isEditing}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Agent Type</Text>
          <Pressable
            onPress={() => isEditing && setShowTypePicker(!showTypePicker)}
            style={[
              styles.selectInput,
              !isEditing && styles.textInputDisabled,
            ]}
          >
            <Text
              style={[
                styles.selectText,
                !agentType && { color: Colors.textMuted },
              ]}
            >
              {getAgentTypeLabel(agentType)}
            </Text>
            {isEditing && (
              <Ionicons
                name={showTypePicker ? "chevron-up" : "chevron-down"}
                size={18}
                color={Colors.textMuted}
              />
            )}
          </Pressable>
          {showTypePicker && isEditing && (
            <View style={styles.pickerDropdown}>
              {AGENT_TYPE_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.value}
                  onPress={() => {
                    setAgentType(opt.value);
                    setShowTypePicker(false);
                  }}
                  style={({ pressed }) => [
                    styles.pickerItem,
                    agentType === opt.value && styles.pickerItemSelected,
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      agentType === opt.value && styles.pickerItemTextSelected,
                    ]}
                  >
                    {opt.label}
                  </Text>
                  {agentType === opt.value && (
                    <Ionicons
                      name="checkmark"
                      size={16}
                      color={Colors.primary}
                    />
                  )}
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {showReraField && (
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>RERA Number</Text>
            <TextInput
              style={[
                styles.textInput,
                !isEditing && styles.textInputDisabled,
              ]}
              value={reraNumber}
              onChangeText={setReraNumber}
              placeholderTextColor={Colors.textMuted}
              placeholder="Enter your RERA number"
              editable={isEditing}
            />
          </View>
        )}

        {showOtherField && (
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>What do you do?</Text>
            <TextInput
              style={[
                styles.textInput,
                !isEditing && styles.textInputDisabled,
              ]}
              value={agentTypeOther}
              onChangeText={setAgentTypeOther}
              placeholderTextColor={Colors.textMuted}
              placeholder="Describe what you do"
              editable={isEditing}
            />
          </View>
        )}

        {showConnectAccounts && (
          <>
            <Text style={styles.sectionTitle}>Connect Accounts</Text>
            <View style={styles.connectRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.connectBtn,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Ionicons name="logo-google" size={20} color="#fff" />
                <Text style={styles.connectBtnText}>Google</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.connectBtn,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Ionicons name="mail-outline" size={20} color="#fff" />
                <Text style={styles.connectBtnText}>Outlook</Text>
              </Pressable>
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Email</Text>
              <TextInput
                style={[styles.textInput]}
                value={email}
                onChangeText={setEmail}
                placeholder="your@email.com"
                placeholderTextColor={Colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={true}
              />
            </View>
          </>
        )}

        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.notificationRow}>
          <Text style={styles.notificationLabel}>Push Notifications</Text>
          <Switch
            value={pushEnabled}
            onValueChange={setPushEnabled}
            trackColor={{ false: "#3F3F46", true: "#00D084" }}
            thumbColor="#FFFFFF"
          />
        </View>

        {isEditing && (
          <Pressable
            onPress={handleSave}
            disabled={saving}
            style={({ pressed }) => [
              styles.saveBtn,
              saving && styles.saveBtnDisabled,
              pressed && !saving && { opacity: 0.85 },
            ]}
          >
            {saving ? (
              <ActivityIndicator color="#000" size="small" />
            ) : (
              <Text style={styles.saveBtnText}>Save Profile</Text>
            )}
          </Pressable>
        )}

        <View style={styles.footerSection}>
          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => [
              styles.signOutBtn,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </Pressable>

          {!showDeleteConfirm ? (
            <Pressable
              onPress={() => setShowDeleteConfirm(true)}
              style={({ pressed }) => [
                styles.deleteBtn,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Ionicons name="trash-outline" size={20} color={Colors.danger} />
              <Text style={styles.deleteBtnText}>Delete Account</Text>
            </Pressable>
          ) : (
            <View style={styles.deleteConfirm}>
              <Text style={styles.deleteConfirmText}>
                Are you sure? This cannot be undone.
              </Text>
              <View style={styles.deleteConfirmActions}>
                <Pressable
                  onPress={() => setShowDeleteConfirm(false)}
                  style={({ pressed }) => [
                    styles.deleteConfirmCancel,
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Text style={styles.deleteConfirmCancelText}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleDelete}
                  style={({ pressed }) => [
                    styles.deleteConfirmDelete,
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Text style={styles.deleteConfirmDeleteText}>Delete</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </KeyboardAwareScrollViewCompat>
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
  header: {
    backgroundColor: "#000000",
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#27272A",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "500",
    color: Colors.text,
  },
  editLink: {
    fontSize: 16,
    color: "#00D084",
    fontWeight: "500",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
    gap: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#18181B",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInfo: {
    flex: 1,
    gap: 4,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text,
    flexShrink: 1,
  },
  profilePhone: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  verifiedText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 16,
    marginTop: 8,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 6,
    fontWeight: "500",
  },
  textInput: {
    backgroundColor: "#18181B",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#27272A",
    paddingHorizontal: 16,
    height: 56,
    fontSize: 15,
    color: Colors.text,
  },
  textInputDisabled: {
    opacity: 0.6,
  },
  selectInput: {
    backgroundColor: "#18181B",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#27272A",
    paddingHorizontal: 16,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectText: {
    fontSize: 15,
    color: Colors.text,
  },
  pickerDropdown: {
    backgroundColor: "#18181B",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#27272A",
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
    borderBottomColor: "#27272A",
  },
  pickerItemSelected: {
    backgroundColor: Colors.primary + "10",
  },
  pickerItemText: {
    fontSize: 15,
    color: Colors.text,
  },
  pickerItemTextSelected: {
    fontWeight: "600",
    color: Colors.primary,
  },
  connectRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  connectBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#18181B",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#27272A",
    height: 48,
  },
  connectBtnText: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: "500",
  },
  notificationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#18181B",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#27272A",
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 24,
  },
  notificationLabel: {
    fontSize: 15,
    color: Colors.text,
  },
  saveBtn: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  footerSection: {
    gap: 8,
    marginTop: 8,
  },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#18181B",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#27272A",
    paddingHorizontal: 16,
    height: 48,
  },
  signOutText: {
    fontSize: 15,
    color: Colors.danger,
    fontWeight: "500",
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#18181B",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#27272A",
    paddingHorizontal: 16,
    height: 48,
  },
  deleteBtnText: {
    fontSize: 15,
    color: Colors.danger,
    fontWeight: "500",
  },
  deleteConfirm: {
    backgroundColor: Colors.danger + "15",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.danger + "40",
    padding: 16,
    gap: 12,
  },
  deleteConfirmText: {
    fontSize: 14,
    color: Colors.danger,
    fontWeight: "500",
  },
  deleteConfirmActions: {
    flexDirection: "row",
    gap: 12,
  },
  deleteConfirmCancel: {
    flex: 1,
    backgroundColor: "#18181B",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#27272A",
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteConfirmCancelText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: "500",
  },
  deleteConfirmDelete: {
    flex: 1,
    backgroundColor: Colors.danger,
    borderRadius: 8,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteConfirmDeleteText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
