import { Platform } from "react-native";
import { DatosFormularioPersonaje, Personaje, Personajes } from "../types/Personaje";
import axios from "axios";

const IP = Platform.OS === "android" ? "10.0.2.2" : "localhost";

export async function CRUDcargarPersonajes(): Promise<Personajes> {
  const url = `http://${IP}:3000/personajes`;
  const respuesta = await axios.get(url);
  return respuesta.data;
}

export async function CRUDcrearNuevoPersonaje(datos: DatosFormularioPersonaje): Promise<Personaje> {
  const personajes = await CRUDcargarPersonajes();
  const nuevoId = Math.max(...personajes.map(p => p.id), 0) + 1;
  
  const personaje: Personaje = {
    id: nuevoId,
    nombre_per: datos.nombre_per,
    nivel: datos.nivel,
    jugador_padre: datos.jugador_padre,
    cam: datos.cam,
    imagen: datos.imagen || "icon_usuario.png"
  };
  
  const URL = `http://${IP}:3000/personajes`;
  await axios.post(URL, personaje);
  return personaje;
}

export async function CRUDactualizarPersonaje(id: number, datos: Partial<DatosFormularioPersonaje>): Promise<Personaje> {
  const URL = `http://${IP}:3000/personajes/${id}`;
  const respuesta = await axios.put(URL, datos);
  return respuesta.data;
}

export async function CRUDeliminarPersonaje(id: number): Promise<void> {
  const URL = `http://${IP}:3000/personajes/${id}`;
  await axios.delete(URL);
}