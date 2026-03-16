import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Platform,
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import * as Haptics from "expo-haptics";

import Colors from "@/constants/colors";
import { COUNTRY_CODES } from "@/constants/api";
import { ingestClient } from "@/lib/api";

export default function SubmitLeadScreen() {
  const insets = useSafeAreaInsets();
  const webTopPad = Platform.OS === "web" ? 67 : 0;
  const webBottomPad = Platform.OS === "web" ? 34 : 0;

  const [clientName, setClientName] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const numericAmount = useMemo(() => {
    const parsed = parseFloat(loanAmount.replace(/,/g, ""));
    return isNaN(parsed) ? 0 : parsed;
  }, [loanAmount]);

  const commission = useMemo(() => {
    return (numericAmount * 0.45) / 100;
  }, [numericAmount]);

  const sanitizedPhone = useMemo(() => {
    return phone.replace(/\D/g, "");
  }, [phone]);

  const isPhoneValid = useMemo(() => {
    return sanitizedPhone.length === selectedCountry.digits;
  }, [sanitizedPhone, selectedCountry]);

  const canSubmit =
    clientName.trim().length > 0 &&
    numericAmount > 0 &&
    isPhoneValid &&
    !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await ingestClient({
        client_name: clientName.trim(),
        client_phone: `${selectedCountry.code}${sanitizedPhone}`,
        expected_mortgage_amount: numericAmount,
      });
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      router.replace("/referral-success");
    } catch (e) {
      Alert.alert("Error", "Failed to submit client. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatLoanDisplay = (val: string) => {
    const cleaned = val.replace(/[^0-9]/g, "");
    setLoanAmount(cleaned);
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + webTopPad,
        },
      ]}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Submit Client</Text>
        <View style={{ width: 44 }} />
      </View>

      {numericAmount > 0 && (
        <View style={styles.commissionBar}>
          <Text style={styles.commissionLabel}>Estimated Commission</Text>
          <Text style={styles.commissionValue}>
            AED {commission.toLocaleString("en-AE", { maximumFractionDigits: 0 })}
          </Text>
        </View>
      )}

      <KeyboardAwareScrollViewCompat
        bottomOffset={20}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + webBottomPad + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Full Name</Text>
          <TextInput
            style={styles.textInput}
            value={clientName}
            onChangeText={setClientName}
            placeholder="Client's full name"
            placeholderTextColor={Colors.textMuted}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Loan Amount (AED)</Text>
          <View style={styles.amountInputRow}>
            <Text style={styles.currencyPrefix}>AED</Text>
            <TextInput
              style={[styles.textInput, styles.amountInput]}
              value={loanAmount}
              onChangeText={formatLoanDisplay}
              placeholder="0"
              placeholderTextColor={Colors.textMuted}
              keyboardType="numeric"
            />
          </View>
          {numericAmount > 0 && (
            <Text style={styles.calcHelper}>
              {numericAmount.toLocaleString("en-AE")} x 0.45% = AED{" "}
              {commission.toLocaleString("en-AE", { maximumFractionDigits: 0 })}
            </Text>
          )}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Phone Number</Text>
          <View style={styles.phoneRow}>
            <Pressable
              onPress={() => setShowCountryPicker(true)}
              style={styles.countryBtn}
            >
              <Text style={styles.countryFlag}>{selectedCountry.flag}</Text>
              <Text style={styles.countryCode}>{selectedCountry.code}</Text>
              <Feather
                name="chevron-down"
                size={14}
                color={Colors.textMuted}
              />
            </Pressable>
            <TextInput
              style={[styles.textInput, styles.phoneInput]}
              value={phone}
              onChangeText={(text: string) => setPhone(text.replace(/\D/g, ""))}
              placeholder={`${selectedCountry.digits} digits`}
              placeholderTextColor={Colors.textMuted}
              keyboardType="phone-pad"
              maxLength={selectedCountry.digits}
            />
          </View>
          {sanitizedPhone.length > 0 && !isPhoneValid && (
            <Text style={styles.errorHelper}>
              Enter {selectedCountry.digits} digits for{" "}
              {selectedCountry.country}
            </Text>
          )}
        </View>

        <Text style={styles.consentText}>
          By submitting, I confirm that I have the client's consent to share
          their contact details for mortgage processing.
        </Text>
      </KeyboardAwareScrollViewCompat>

      <View
        style={[
          styles.submitBar,
          { paddingBottom: insets.bottom + webBottomPad + 16 },
        ]}
      >
        <Pressable
          onPress={handleSubmit}
          disabled={!canSubmit}
          style={({ pressed }) => [
            styles.submitBtn,
            !canSubmit && styles.submitDisabled,
            pressed && canSubmit && styles.submitPressed,
          ]}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.submitText}>Submit Client</Text>
          )}
        </Pressable>
      </View>

      <Modal
        visible={showCountryPicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { paddingBottom: insets.bottom + 20 },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country</Text>
              <Pressable onPress={() => setShowCountryPicker(false)}>
                <Feather name="x" size={24} color={Colors.text} />
              </Pressable>
            </View>
            <FlatList
              data={COUNTRY_CODES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    setSelectedCountry(item);
                    setPhone("");
                    setShowCountryPicker(false);
                  }}
                  style={({ pressed }) => [
                    styles.countryItem,
                    selectedCountry.code === item.code &&
                      styles.countryItemSelected,
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Text style={styles.countryItemFlag}>{item.flag}</Text>
                  <Text style={styles.countryItemName}>{item.country}</Text>
                  <Text style={styles.countryItemCode}>{item.code}</Text>
                  {selectedCountry.code === item.code && (
                    <Feather
                      name="check"
                      size={18}
                      color={Colors.primary}
                    />
                  )}
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 17,
    color: Colors.text,
  },
  commissionBar: {
    backgroundColor: Colors.primary + "10",
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary + "20",
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  commissionLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: Colors.primary,
  },
  commissionValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: Colors.primary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 22,
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
  amountInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 0,
  },
  currencyPrefix: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: Colors.textSecondary,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRightWidth: 0,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    lineHeight: 48,
    textAlignVertical: "center",
  },
  amountInput: {
    flex: 1,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  calcHelper: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.primary,
    marginLeft: 2,
    marginTop: 2,
  },
  phoneRow: {
    flexDirection: "row",
    gap: 8,
  },
  countryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    height: 48,
  },
  countryFlag: {
    fontSize: 20,
  },
  countryCode: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: Colors.text,
  },
  phoneInput: {
    flex: 1,
  },
  errorHelper: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.danger,
    marginLeft: 2,
    marginTop: 2,
  },
  consentText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 19,
    marginTop: 4,
  },
  submitBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: Colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
  },
  submitDisabled: {
    opacity: 0.4,
  },
  submitPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  submitText: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: "#fff",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: Colors.text,
  },
  countryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  countryItemSelected: {
    backgroundColor: Colors.primary + "10",
  },
  countryItemFlag: {
    fontSize: 24,
  },
  countryItemName: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    color: Colors.text,
  },
  countryItemCode: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.textSecondary,
    marginRight: 8,
  },
});
