import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@/constants/api";

const TOKEN_KEY = "rivo_auth_token";

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

async function apiFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = await getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return fetch(`${API_BASE_URL}${path}`, { ...options, headers });
}

export async function initWhatsApp(): Promise<{
  code: string;
  whatsapp_url: string;
}> {
  const res = await apiFetch("/agents/init-whatsapp/", {
    method: "POST",
    body: JSON.stringify({
      referral_code: "",
      is_whatsapp_business: false,
      is_sign_in: false,
    }),
  });
  if (!res.ok) throw new Error("Failed to init WhatsApp");
  return res.json();
}

export async function checkVerification(
  code: string,
): Promise<{ verified: boolean; token?: string }> {
  const res = await apiFetch(`/agents/check-verification/${code}/`);
  if (!res.ok) throw new Error("Verification check failed");
  return res.json();
}

export async function getMe(): Promise<any> {
  const res = await apiFetch("/agents/me/");
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
}

export async function getClients(search?: string): Promise<any> {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  const res = await apiFetch(`/clients/${query}`);
  if (!res.ok) throw new Error("Failed to fetch clients");
  return res.json();
}

export async function ingestClient(data: {
  client_name: string;
  client_phone: string;
  expected_mortgage_amount: number;
}): Promise<any> {
  const res = await apiFetch("/clients/ingest/", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to submit client");
  return res.json();
}

export async function getNetwork(): Promise<any> {
  const res = await apiFetch("/agents/network/");
  if (!res.ok) throw new Error("Failed to fetch network");
  return res.json();
}

export async function updateProfile(data: {
  name?: string;
  agent_type?: string;
  email?: string;
}): Promise<any> {
  const res = await apiFetch("/agents/profile/", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update profile");
  return res.json();
}

export async function logout(): Promise<void> {
  await apiFetch("/agents/logout/", { method: "POST" });
  await clearToken();
}

export async function deleteAccount(): Promise<void> {
  await apiFetch("/agents/delete/", { method: "DELETE" });
  await clearToken();
}
