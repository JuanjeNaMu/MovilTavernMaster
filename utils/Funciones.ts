import { ImageSourcePropType } from "react-native";
import type { Personaje } from "../types/Personaje";
import { dataUriFromStoredBase64 } from "./imagenAssets";

const ICONO_DEFECTO = require("../assets/Icon_usuario.png");

export function origenAvatarPersonaje(personaje: Personaje): ImageSourcePropType {
  const uri = dataUriFromStoredBase64(personaje.imagen_base64);
  if (uri) return { uri };
  return ICONO_DEFECTO;
}
