import { Platform } from "react-native";

const DEFAULT_PORT = 8080;

/** Host de la API Spring (Mismo origen que TavernMaster desktop: ApiClient DEFAULT_API_BASE_URL). */
function resolveHost(): string {
  const fromEnv =
    typeof process !== "undefined" &&
    process.env?.EXPO_PUBLIC_TAVERNMASTER_API_HOST &&
    String(process.env.EXPO_PUBLIC_TAVERNMASTER_API_HOST).trim();
  if (fromEnv) return String(fromEnv).trim();
  return Platform.OS === "android" ? "10.0.2.2" : "localhost";
}

export const API_HOST = resolveHost();
export const API_BASE_URL = `http://${API_HOST}:${DEFAULT_PORT}/api`;
