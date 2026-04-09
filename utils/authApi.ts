import axios from "axios";
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

  try {
    const resp = await axios.post<JugadorApi>(`${API_BASE_URL}/jugadores/login`, {
      nombreJug: user,
      password,
    });
    const body = resp.data;
    const nombre = body.nombreJug?.trim() ?? user;
    return { ...body, nombreJug: nombre };
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 401) {
      throw new LoginFallidoError();
    }
    throw e;
  }
}
