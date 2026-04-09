import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@tavernmaster_sesion_v1";

export type Sesion = {
  nombreJug: string;
};

export async function guardarSesion(sesion: Sesion): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sesion));
}

export async function obtenerSesion(): Promise<Sesion | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const p = JSON.parse(raw) as Sesion;
    if (p?.nombreJug && typeof p.nombreJug === "string") return { nombreJug: p.nombreJug.trim() };
    return null;
  } catch {
    return null;
  }
}

export async function borrarSesion(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
