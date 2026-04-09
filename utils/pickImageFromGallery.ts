import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

/**
 * Abre la galería y devuelve el JPEG/PNG en base64 (payload sin prefijo `data:`), o null si cancela.
 */
export async function pickImageBase64FromLibrary(): Promise<string | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    Alert.alert(
      "Permisos",
      "Para elegir una foto del personaje necesitamos acceso a tus imágenes.",
    );
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.82,
    base64: true,
  });

  if (result.canceled || !result.assets?.length) return null;

  const b64 = result.assets[0].base64;
  if (!b64) {
    Alert.alert("Imagen", "No se pudo leer la imagen en base64. Prueba con otra foto.");
    return null;
  }

  return b64.replace(/\s/g, "");
}
