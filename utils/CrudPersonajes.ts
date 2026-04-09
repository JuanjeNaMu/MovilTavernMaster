import axios from "axios";
import type { DatosFormularioPersonaje, Personaje, Personajes } from "../types/Personaje";
import type { Ficha } from "../types/Ficha";
import { API_BASE_URL } from "./apiConfig";
import { generarFichaPorClase } from "./fichaDnD";

async function syncCampana(
  idPer: number,
  nuevoIdCam: number | null,
  anteriorIdCam: number | null | undefined,
): Promise<void> {
  const a = anteriorIdCam ?? null;
  const n = nuevoIdCam ?? null;
  if (n === a) return;

  if (n == null && a != null) {
    await axios.patch(`${API_BASE_URL}/personajes/${idPer}/desvincular-campana`);
    return;
  }
  if (n != null) {
    await axios.patch(`${API_BASE_URL}/personajes/${idPer}/asignar-campana/${n}`);
  }
}

function id_perStr(id: number): string {
  return String(id);
}

/** Solo personajes cuyo `jugador_padre` coincide con el usuario en sesión. */
export async function CRUDcargarPersonajes(jugadorPadre: string): Promise<Personajes> {
  const resp = await axios.get<Personajes>(`${API_BASE_URL}/personajes/buscar/jugador-padre`, {
    params: { jugadorPadre: jugadorPadre.trim() },
  });
  return resp.data;
}

/** Nombre legible de la campaña por id (GET `/campanas/{id}` o variantes). */
export async function CRUDobtenerNombreCampana(idCam: number): Promise<string | null> {
  try {
    const resp = await axios.get<Record<string, unknown>>(`${API_BASE_URL}/campanas/${idCam}`);
    const d = resp.data;
    const raw =
      d?.nombre_cam ??
      d?.nombreCam ??
      d?.nombre_campana ??
      d?.nombreCampaña ??
      d?.nombreCampana ??
      d?.nombre ??
      d?.titulo;
    if (raw == null) return null;
    const s = String(raw).trim();
    return s.length > 0 ? s : null;
  } catch {
    return null;
  }
}

export async function CRUDobtenerFicha(idPer: number): Promise<Ficha | null> {
  try {
    const resp = await axios.get<Ficha>(`${API_BASE_URL}/fichas/${id_perStr(idPer)}`);
    return resp.data;
  } catch {
    return null;
  }
}

export async function CRUDcrearNuevoPersonaje(
  datos: DatosFormularioPersonaje,
  jugadorSesion: string,
): Promise<Personaje> {
  const body = {
    nombre_per: datos.nombre_per,
    jugador_padre: jugadorSesion.trim(),
    nivel: datos.nivel,
    imagen_base64: datos.imagen_base64,
  };
  const resp = await axios.post<Personaje>(`${API_BASE_URL}/personajes`, body);
  const creado = resp.data;
  const id = creado.id_per;

  const ficha = generarFichaPorClase(id, datos.clase);
  await axios.put<Ficha>(`${API_BASE_URL}/fichas/${id_perStr(id)}`, ficha);

  await syncCampana(id, datos.id_cam, undefined);
  return creado;
}

export async function CRUDactualizarPersonaje(
  id: number,
  datos: DatosFormularioPersonaje,
  anterior: Personaje,
  jugadorSesion: string,
): Promise<Personaje> {
  const body = {
    id_per: id,
    jugador_padre: jugadorSesion.trim(),
    nombre_per: datos.nombre_per,
    nivel: datos.nivel,
    imagen_base64: datos.imagen_base64,
  };
  const resp = await axios.put<Personaje>(`${API_BASE_URL}/personajes/${id_perStr(id)}`, body);

  const ficha = generarFichaPorClase(id, datos.clase);
  await axios.put<Ficha>(`${API_BASE_URL}/fichas/${id_perStr(id)}`, ficha);

  await syncCampana(id, datos.id_cam, anterior.id_cam ?? null);
  return resp.data;
}

export async function CRUDeliminarPersonaje(id: number): Promise<void> {
  await axios.delete(`${API_BASE_URL}/personajes/${id_perStr(id)}`);
}
