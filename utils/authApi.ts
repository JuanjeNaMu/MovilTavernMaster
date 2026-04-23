import axios from "axios";
import { Platform } from "react-native";
import type { JugadorApi } from "../types/Jugador";
import { API_BASE_URL } from "./apiConfig";

export class LoginFallidoError extends Error {
  constructor(message = "Usuario o contraseña incorrectos") {
    super(message);
    this.name = "LoginFallidoError";
  }
}

export async function loginApi(nombreJug: string, password: string): Promise<JugadorApi> {
  const user = nombreJug.trim();
  if (!user || !password) {
    throw new LoginFallidoError("Introduce usuario y contraseña");
  }

  const baseUrls = buildCandidateBaseUrls();
  let lastError: unknown = null;

  for (const baseUrl of baseUrls) {
    try {
      const resp = await axios.post<JugadorApi>(
        `${baseUrl}/jugadores/login`,
        {
          nombreJug: user,
          password,
        },
        {
          timeout: 8000,
        },
      );
      const body = resp.data;
      const nombre = body.nombre_jug?.trim() || body.nombreJug?.trim() || user;
      const esAdmin = (body.es_admin ?? body.esAdmin) === true;
      return { ...body, nombreJug: nombre, esAdmin };
    } catch (e) {
      lastError = e;
      if (axios.isAxiosError(e) && e.response?.status === 401) {
        throw new LoginFallidoError();
      }
      // Si no es error de red/timeout, no tiene sentido seguir probando hosts.
      if (!axios.isAxiosError(e) || (e.code !== "ECONNABORTED" && e.message !== "Network Error")) {
        throw e;
      }
    }
  }

  if (axios.isAxiosError(lastError) && lastError.code === "ECONNABORTED") {
    throw new Error("Timeout al conectar con la API (8s)");
  }
  throw lastError ?? new Error("No se pudo conectar con la API");
}

function buildCandidateBaseUrls(): string[] {
  const urls = [API_BASE_URL.replace(/\/$/, "")];
  if (Platform.OS === "android") {
    try {
      const parsed = new URL(API_BASE_URL);
      const port = parsed.port || "8080";
      const path = parsed.pathname?.replace(/\/$/, "") || "/api";
      const emulatorUrl = `${parsed.protocol}//10.0.2.2:${port}${path}`;
      if (!urls.includes(emulatorUrl)) urls.push(emulatorUrl);
    } catch {
      if (!urls.includes("http://10.0.2.2:8080/api")) {
        urls.push("http://10.0.2.2:8080/api");
      }
    }
  }
  return urls;
}
