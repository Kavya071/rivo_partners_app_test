import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { apiFetch } from "./api";

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Device.isDevice) {
    return null;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#00D084",
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return null;
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId,
  });

  return tokenData.data;
}

export async function registerTokenWithBackend(token: string): Promise<void> {
  const res = await apiFetch("/agents/push-register/", {
    method: "POST",
    body: JSON.stringify({
      expo_push_token: token,
      platform: Platform.OS,
    }),
  });
  if (!res.ok) throw new Error("Failed to register push token");
}

export async function unregisterTokenFromBackend(token: string): Promise<void> {
  const res = await apiFetch("/agents/push-unregister/", {
    method: "POST",
    body: JSON.stringify({ expo_push_token: token }),
  });
  if (!res.ok) throw new Error("Failed to unregister push token");
}
