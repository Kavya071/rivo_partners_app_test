import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import * as Linking from "expo-linking";

import Colors from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { useConfig } from "@/context/ConfigContext";
import { initWhatsApp, resolveReferralCode } from "@/lib/api";
import {
  getWhatsAppPref,
  setReferralCode,
  getReferralCode,
  setVerifyCode,
  setPendingUrl,
  WhatsAppType,
} from "@/lib/whatsapp";
import WhatsAppPickerSheet from "@/components/WhatsAppPickerSheet";

interface ValueProp {
  title: string;
  desc: string;
  renderIcon: () => React.ReactNode;
}

const VALUE_PROPS: ValueProp[] = [
  {
    title: "Fast Referrals",
    desc: "Submit clients in seconds",
    renderIcon: () => <Ionicons name="flash" size={20} color={Colors.primary} />,
  },
  {
    title: "Real-Time Tracking",
    desc: "Monitor every deal stage",
    renderIcon: () => <MaterialCommunityIcons name="chart-timeline-variant" size={20} color={Colors.primary} />,
  },
  {
    title: "Network Bonus",
    desc: "Earn from your referrals",
    renderIcon: () => <Ionicons name="people" size={20} color={Colors.primary} />,
  },
];

export default function LandingScreen() {
  const insets = useSafeAreaInsets();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const config = useConfig();
  const params = useLocalSearchParams<{
    ref?: string;
    referral_code?: string;
    is_sign_in?: string;
  }>();

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [referralName, setReferralName] = useState<string | null>(null);
  const [pendingSignIn, setPendingSignIn] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace("/(tabs)");
    }
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    const refCode = params.ref || params.referral_code;
    if (refCode) {
      setReferralCode(refCode);
      resolveReferralCode(refCode)
        .then((data) => setReferralName(data.agent_name))
        .catch(() => setReferralName("Partner Agent"));
    }
  }, [params.ref, params.referral_code]);

  useEffect(() => {
    if (params.is_sign_in === "true" && termsAccepted && !loading) {
      handleGetStarted(true);
    }
  }, [params.is_sign_in, termsAccepted]);

  const proceedToWhatsApp = async (
    isSignIn: boolean,
    whatsappType?: WhatsAppType,
  ) => {
    setLoading(true);
    try {
      const storedRef = await getReferralCode();
      const isBusinessPick = whatsappType === "business";
      const { code, whatsapp_url } = await initWhatsApp(
        storedRef || "",
        isBusinessPick,
        isSignIn,
      );

      const configUrl = isBusinessPick
        ? config.LINKS.WHATSAPP_BUSINESS
        : config.LINKS.WHATSAPP_PERSONAL;
      const resolvedUrl = whatsapp_url || configUrl;

      await setVerifyCode(code);
      await setPendingUrl(resolvedUrl);

      router.push({
        pathname: "/whatsapp-listening",
        params: { code, whatsapp_url: resolvedUrl },
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleGetStarted = async (isSignIn = false) => {
    if (!termsAccepted || loading) return;
    setPendingSignIn(isSignIn);

    const pref = await getWhatsAppPref();
    if (pref) {
      proceedToWhatsApp(isSignIn, pref);
    } else {
      setShowPicker(true);
    }
  };

  const handlePickerSelect = (type: WhatsAppType) => {
    proceedToWhatsApp(pendingSignIn, type);
  };

  if (authLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (isAuthenticated) return null;

  const webTopPad = Platform.OS === "web" ? 67 : 0;
  const webBottomPad = Platform.OS === "web" ? 34 : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.contentContainer,
        {
          paddingTop: insets.top + webTopPad + 20,
          paddingBottom: insets.bottom + webBottomPad + 20,
        },
      ]}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <Animated.View entering={FadeInUp.delay(100).duration(600)} style={styles.header}>
        <View style={styles.logoRow}>
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            style={styles.logoBg}
          >
            <Ionicons name="diamond" size={22} color="#fff" />
          </LinearGradient>
          <Text style={styles.logoText}>Rivo Partners</Text>
        </View>

        {referralName && (
          <View style={styles.referralBadge}>
            <View style={styles.referralDot} />
            <View>
              <Text style={styles.referralLabel}>Referred by</Text>
              <Text style={styles.referralNameText}>{referralName}</Text>
            </View>
          </View>
        )}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.heroSection}>
        <Text style={styles.heroTitle}>
          Earn on every{"\n"}mortgage you refer
        </Text>
        <Text style={styles.heroSubtitle}>
          Dubai's premier mortgage referral platform for real estate agents
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.payoutCard}>
        <LinearGradient
          colors={["#0a2e1a", "#0d1f14"]}
          style={styles.payoutGradient}
        >
          <Text style={styles.payoutLabel}>Average Payout</Text>
          <View style={styles.payoutRow}>
            <Text style={styles.payoutCurrency}>AED</Text>
            <Text style={styles.payoutAmount}>
              {config.COMMISSION.AVG_PAYOUT.toLocaleString()}
            </Text>
          </View>
          <Text style={styles.payoutSub}>per successful referral</Text>
        </LinearGradient>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(500).duration(600)} style={styles.valueProps}>
        {VALUE_PROPS.map((prop, i) => (
          <View key={i} style={styles.valuePropCard}>
            <View style={styles.valuePropIcon}>
              {prop.renderIcon()}
            </View>
            <View style={styles.valuePropText}>
              <Text style={styles.valuePropTitle}>{prop.title}</Text>
              <Text style={styles.valuePropDesc}>{prop.desc}</Text>
            </View>
          </View>
        ))}
      </Animated.View>

      <View style={styles.bottomSection}>
        <Pressable
          onPress={() => setTermsAccepted(!termsAccepted)}
          style={styles.termsRow}
        >
          <View
            style={[
              styles.checkbox,
              termsAccepted && styles.checkboxChecked,
            ]}
          >
            {termsAccepted && (
              <Feather name="check" size={14} color="#fff" />
            )}
          </View>
          <Text style={styles.termsText}>
            I agree to the Terms & Conditions
          </Text>
        </Pressable>

        <Pressable
          onPress={() => handleGetStarted(false)}
          disabled={!termsAccepted || loading}
          style={({ pressed }) => [
            styles.ctaButton,
            (!termsAccepted || loading) && styles.ctaDisabled,
            pressed && termsAccepted && !loading && styles.ctaPressed,
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="logo-whatsapp" size={22} color="#fff" />
              <Text style={styles.ctaText}>Get Started</Text>
            </>
          )}
        </Pressable>

        <Pressable
          onPress={() => handleGetStarted(true)}
          disabled={!termsAccepted || loading}
          style={styles.signInRow}
        >
          <Text style={[styles.signInText, (!termsAccepted || loading) && { opacity: 0.4 }]}>
            Already have an account?{" "}
            <Text style={styles.signInLink}>Sign In</Text>
          </Text>
        </Pressable>
      </View>

      <WhatsAppPickerSheet
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={handlePickerSelect}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: Colors.text,
  },
  referralBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 10,
  },
  referralDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  referralLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 10,
    color: Colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  referralNameText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: Colors.text,
  },
  heroSection: {
    gap: 12,
  },
  heroTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 36,
    color: Colors.text,
    lineHeight: 44,
  },
  heroSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  payoutCard: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.primary + "30",
  },
  payoutGradient: {
    padding: 24,
    alignItems: "center",
    gap: 4,
  },
  payoutLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: Colors.primary,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  payoutRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  payoutCurrency: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 20,
    color: Colors.primary,
  },
  payoutAmount: {
    fontFamily: "Inter_700Bold",
    fontSize: 48,
    color: Colors.primary,
  },
  payoutSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.textSecondary,
  },
  valueProps: {
    gap: 12,
  },
  valuePropCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  valuePropIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.primary + "15",
    justifyContent: "center",
    alignItems: "center",
  },
  valuePropText: {
    flex: 1,
    gap: 2,
  },
  valuePropTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: Colors.text,
  },
  valuePropDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.textSecondary,
  },
  bottomSection: {
    gap: 16,
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.borderLight,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  termsText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.textSecondary,
  },
  ctaButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  ctaDisabled: {
    opacity: 0.4,
  },
  ctaPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  ctaText: {
    fontFamily: "Inter_700Bold",
    fontSize: 17,
    color: "#fff",
  },
  signInRow: {
    alignItems: "center",
    paddingVertical: 4,
  },
  signInText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.textSecondary,
  },
  signInLink: {
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
    textDecorationLine: "underline",
  },
});
