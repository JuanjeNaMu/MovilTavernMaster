import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  Alert,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { Image } from "expo-image";
import { Picker } from "@react-native-picker/picker";
import { globalStyles } from "../styles/GlobalStyles";
import type { Personaje, DatosFormularioPersonaje } from "../types/Personaje";
import { dataUriFromStoredBase64, extractRawBase64ForApi } from "../utils/imagenAssets";
import { pickImageBase64FromLibrary } from "../utils/pickImageFromGallery";
import { CRUDobtenerFicha } from "../utils/CrudPersonajes";
import { TEMA, tintePorClase } from "../utils/temaApp";

const CLASES = ["Principiante", "Explorador", "Guerrero", "Hechicero"] as const;

const IMAGEN_DEFECTO = require("../assets/Icon_usuario.png");

type ModalPersonajeProps = {
  visible: boolean;
  cerrar: () => void;
  guardar: (datos: DatosFormularioPersonaje) => void;
  personaje: Personaje | null;
  modoEdicion: boolean;
  nombreJugSesion: string;
};

export default function ModalPersonaje({
  visible,
  cerrar,
  guardar,
  personaje,
  modoEdicion,
  nombreJugSesion,
}: ModalPersonajeProps) {
  const { height: winH } = useWindowDimensions();
  const scrollMaxH = Math.max(220, Math.min(winH * 0.58, 520));

  const [nombre, setNombre] = useState("");
  const [nivel, setNivel] = useState(1);
  const [idCamStr, setIdCamStr] = useState("");
  const [clase, setClase] = useState<string>("Principiante");
  const [previewBase64, setPreviewBase64] = useState<string | null>(null);
  /** Sin foto en servidor: icono genérico y `imagen_base64: null`. */
  const [sinImagen, setSinImagen] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      if (personaje && modoEdicion) {
        setNombre(personaje.nombre_per);
        setNivel(personaje.nivel);
        setIdCamStr(
          personaje.id_cam != null && personaje.id_cam !== undefined
            ? String(personaje.id_cam)
            : "",
        );
        const tieneFoto =
          personaje.imagen_base64 != null && String(personaje.imagen_base64).trim() !== "";
        setPreviewBase64(tieneFoto ? String(personaje.imagen_base64).trim() : null);
        setSinImagen(!tieneFoto);

        const f = await CRUDobtenerFicha(personaje.id_per);
        if (f?.clase) {
          const normalizado = f.clase.trim();
          const enc = CLASES.find((c) => c.toLowerCase() === normalizado.toLowerCase());
          setClase(enc ?? "Principiante");
        } else {
          setClase("Principiante");
        }
      } else {
        setNombre("");
        setNivel(1);
        setIdCamStr("");
        setClase("Principiante");
        setPreviewBase64(null);
        setSinImagen(true);
      }
    };
    if (visible) void cargar();
  }, [personaje, modoEdicion, visible]);

  const tinteClase = useMemo(() => tintePorClase(clase), [clase]);

  const imagenPreviewSrc = useMemo(() => {
    if (sinImagen || !previewBase64) {
      return IMAGEN_DEFECTO;
    }
    const uri = dataUriFromStoredBase64(previewBase64);
    return uri ? { uri } : IMAGEN_DEFECTO;
  }, [sinImagen, previewBase64]);

  const clickEnGuardar = () => {
    if (!nombre.trim()) {
      Alert.alert("Error", "El nombre del personaje es obligatorio");
      return;
    }

    let imagen_base64: string | null = null;
    if (!sinImagen) {
      const raw = extractRawBase64ForApi(previewBase64);
      if (!raw) {
        Alert.alert("Foto", "Elige una imagen de la galería o pulsa Quitar foto.");
        return;
      }
      imagen_base64 = raw;
    }

    let id_cam: number | null = null;
    if (idCamStr.trim() !== "") {
      const n = Number.parseInt(idCamStr.trim(), 10);
      if (Number.isNaN(n)) {
        Alert.alert("Error", "El ID de campaña debe ser un número");
        return;
      }
      id_cam = n;
    }

    const datos: DatosFormularioPersonaje = {
      nombre_per: nombre.trim(),
      nivel,
      jugador_padre: nombreJugSesion.trim(),
      id_cam,
      imagen_base64,
      clase,
    };

    guardar(datos);
  };

  const niveles = Array.from({ length: 20 }, (_, i) => i + 1);

  const quitarFoto = () => {
    setPreviewBase64(null);
    setSinImagen(true);
  };

  const elegirFotoMovil = async () => {
    const b64 = await pickImageBase64FromLibrary();
    if (b64) {
      setPreviewBase64(b64);
      setSinImagen(false);
    }
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={cerrar}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.ventana,
            {
              backgroundColor: TEMA.cremaClaro,
              borderColor: TEMA.negro,
              borderLeftWidth: 6,
              borderLeftColor: tinteClase.accent,
            },
          ]}
        >
          <View style={globalStyles.contenedorEtiqueta}>
            <Text style={globalStyles.textoEtiqueta}>
              {modoEdicion ? "Editar Personaje" : "Crear Nuevo Personaje"}
              {modoEdicion && nombre ? `: ${nombre}` : ""}
            </Text>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollPad}
            style={[styles.scroll, { maxHeight: scrollMaxH }]}
          >
            <View style={styles.modalBodyCol}>
              <View style={styles.bloqueFoto}>
                <Image source={imagenPreviewSrc} style={globalStyles.imagenModal} contentFit="cover" />

                <Text style={styles.fotoAyuda}>
                  {sinImagen || !previewBase64
                    ? "Sin foto: icono genérico en la lista."
                    : "Así se verá en la lista."}
                </Text>

                <Pressable style={styles.botonGaleria} onPress={() => void elegirFotoMovil()}>
                  <Text style={styles.botonGaleriaTxt}>Elegir foto</Text>
                </Pressable>

                <Pressable style={globalStyles.botonRojo} onPress={quitarFoto}>
                  <Text style={globalStyles.textoBoton}>Quitar foto</Text>
                </Pressable>
              </View>

              <View style={styles.bloqueForm}>
                <View>
                  <Text style={globalStyles.nombreCard}>Nombre personaje</Text>
                  <TextInput
                    style={globalStyles.barraBusqueda}
                    value={nombre}
                    onChangeText={setNombre}
                    placeholder="Ej: Aragorn"
                  />
                </View>

                <View>
                  <Text style={globalStyles.nombreCard}>Nivel</Text>
                  <View style={globalStyles.barraBusqueda}>
                    <Picker
                      selectedValue={nivel}
                      style={{ height: 50 }}
                      onValueChange={(itemValue) => setNivel(Number(itemValue))}
                    >
                      {niveles.map((n) => (
                        <Picker.Item key={n} label={`Nivel ${n}`} value={n} />
                      ))}
                    </Picker>
                  </View>
                </View>

                <View>
                  <Text style={globalStyles.nombreCard}>Clase (ficha)</Text>
                  <View style={globalStyles.barraBusqueda}>
                    <Picker
                      selectedValue={clase}
                      style={{ height: 50 }}
                      onValueChange={(v) => setClase(String(v))}
                    >
                      {CLASES.map((c) => (
                        <Picker.Item key={c} label={c} value={c} />
                      ))}
                    </Picker>
                  </View>
                </View>

                <View>
                  <Text style={globalStyles.nombreCard}>ID campaña (opcional)</Text>
                  <TextInput
                    style={globalStyles.barraBusqueda}
                    value={idCamStr}
                    onChangeText={setIdCamStr}
                    placeholder="Ej: 1 (vacío = sin campaña)"
                    keyboardType="number-pad"
                  />
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={globalStyles.contenedorBotones}>
            <Pressable style={globalStyles.botonRojo} onPress={cerrar}>
              <Text style={globalStyles.textoBoton}>Cancelar</Text>
            </Pressable>

            <Pressable
              style={modoEdicion ? globalStyles.botonAmarillo : globalStyles.botonVerde}
              onPress={clickEnGuardar}
            >
              {modoEdicion ? (
                <Text style={globalStyles.textoBotonSobreCrema}>Guardar cambios</Text>
              ) : (
                <Text style={globalStyles.textoBoton}>Crear personaje</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: TEMA.overlay,
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
  },
  ventana: {
    width: "100%",
    maxWidth: 440,
    maxHeight: "92%",
    borderRadius: 12,
    borderWidth: 2,
    overflow: "hidden",
  },
  scroll: {},
  scrollPad: { paddingBottom: 12, paddingHorizontal: 4, flexGrow: 1 },
  modalBodyCol: {
    flexDirection: "column",
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  bloqueForm: {
    width: "100%",
    marginTop: 4,
  },
  bloqueFoto: {
    alignItems: "center",
    marginBottom: 12,
    width: "100%",
  },
  fotoAyuda: {
    fontSize: 12,
    color: TEMA.textoSecundario,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 12,
    paddingHorizontal: 8,
    lineHeight: 18,
  },
  botonGaleria: {
    backgroundColor: TEMA.rojo,
    borderWidth: 2,
    borderColor: TEMA.negro,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
    minWidth: 200,
    alignItems: "center",
  },
  botonGaleriaTxt: { color: TEMA.textoCrema, fontWeight: "700", fontSize: 15 },
});
