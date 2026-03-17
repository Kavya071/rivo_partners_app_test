import { useState, useEffect, useRef } from "react";
import { Linking } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import {
  registerForPushNotificationsAsync,
  registerTokenWithBackend,
  unregisterTokenFromBackend,
} from "@/lib/notifications";
import { useAuth } from "@/context/AuthContext";

const PUSH_TOKEN_KEY = "rivo_push_token";
const PUSH_REGISTERED_KEY = "rivo_push_registered";

export function useNotifications() {
  const { isAuthenticated } = useAuth();
  const [pushEnabled, setPushEnabled] = useState(false);
  const [permissionStatus, setPermissionStatus] =
    useState<Notifications.PermissionStatus | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || initialized.current) return;
    initialized.current = true;

    (async () => {
      // Check if previously registered
      const registered = await AsyncStorage.getItem(PUSH_REGISTERED_KEY);
      if (registered === "true") {
        setPushEnabled(true);
      }

      // Check current permission status
      const { status } = await Notifications.getPermissionsAsync();
      setPermissionStatus(status);

      // If registered but permission revoked, update state
      if (registered === "true" && status !== "granted") {
        setPushEnabled(false);
        await AsyncStorage.removeItem(PUSH_REGISTERED_KEY);
      }
    })();
  }, [isAuthenticated]);

  const togglePush = async (enabled: boolean) => {
    if (enabled) {
      const token = await registerForPushNotificationsAsync();
      if (!token) {
        // Permission denied — open settings
        const { status } = await Notifications.getPermissionsAsync();
        if (status === "denied") {
          Linking.openSettings();
        }
        return;
      }

      await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
      try {
        await registerTokenWithBackend(token);
        await AsyncStorage.setItem(PUSH_REGISTERED_KEY, "true");
        setPushEnabled(true);
      } catch {
        // Backend call failed, don't update state
      }
    } else {
      const token = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
      if (token) {
        try {
          await unregisterTokenFromBackend(token);
        } catch {
          // Ignore backend errors on unregister
        }
      }
      await AsyncStorage.removeItem(PUSH_REGISTERED_KEY);
      setPushEnabled(false);
    }
  };

  return { pushEnabled, togglePush, permissionStatus };
}
