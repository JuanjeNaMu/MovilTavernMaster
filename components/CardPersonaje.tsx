import React, { useEffect, useMemo, useRef } from "react";
import { View, Text, Pressable, StyleSheet, Animated } from "react-native";
import { Image } from "expo-image";
import { globalStyles } from "../styles/GlobalStyles";
import { origenAvatarPersonaje } from "../utils/Funciones";
import type { Personaje } from "../types/Personaje";
import { TEMA, tintePorClase } from "../utils/temaApp";

type CardPersonajeProps = {
  personaje: Personaje;
  claseFicha?: string | null;
  /** Nombre de campaña (resuelto por `id_cam` en la lista). */
  nombreCampana?: string | null;
  seleccionado?: boolean;
  onPress?: () => void;
  onVerFicha?: () => void;
  onEditar?: () => void;
};

export default function CardPersonaje({
  personaje,
  claseFicha,
  nombreCampana,
  seleccionado = false,
  onPress,
  onVerFicha,
  onEditar,
}: CardPersonajeProps) {
  const imageSource = origenAvatarPersonaje(personaje);
  const idCam =
    personaje.id_cam == null ? null : Number(personaje.id_cam);
  const nombreResuelto = (nombreCampana?.trim() || personaje.nombre_campana?.trim() || "").trim();
  const campania =
    nombreResuelto.length > 0
      ? nombreResuelto
      : idCam != null && Number.isFinite(idCam)
        ? `#${idCam}`
        : "—";

  const tinte = useMemo(() => tintePorClase(claseFicha), [claseFicha]);
  const etiquetaClase = claseFicha?.trim() || "Principiante";
  const meta = `Nv ${personaje.nivel} · ${etiquetaClase} · Camp. ${campania}`;

  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.spring(scale, {
      toValue: seleccionado ? 1.07 : 1,
      friction: 7,
      tension: 140,
      useNativeDriver: true,
    }).start();
  }, [seleccionado, scale]);

  return (
    <Animated.View style={[styles.wrapAnim, { transform: [{ scale }] }]}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: tinte.fondoTarjeta,
            borderColor: seleccionado ? `${TEMA.rojo}99` : `${TEMA.negro}33`,
          },
          seleccionado && styles.cardSeleccionada,
        ]}
      >
        <Pressable style={styles.zonaPrincipal} onPress={onPress}>
          <Image source={imageSource} style={styles.avatar} contentFit="cover" />
          <View style={styles.textos}>
            <Text style={styles.nombre} numberOfLines={1}>
              {personaje.nombre_per}
            </Text>
            <Text style={styles.meta} numberOfLines={2}>
              {meta}
            </Text>
          </View>
        </Pressable>

        <View style={styles.acciones}>
          {onEditar ? (
            <Pressable style={[globalStyles.botonGenerico, styles.botonMitad]} onPress={onEditar}>
              <Text style={[globalStyles.textoBotonSobreCrema, styles.textoBotonCard]}>Editar</Text>
            </Pressable>
          ) : null}
          {onVerFicha ? (
            <Pressable
              style={[
                styles.botonClase,
                styles.botonMitad,
                { backgroundColor: tinte.accent, borderColor: `${TEMA.negro}55` },
              ]}
              onPress={onVerFicha}
            >
              <Text style={[styles.textoBotonCard, { color: tinte.textoBotonClase }]}>Ver ficha</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapAnim: {
    marginHorizontal: 14,
    marginVertical: 7,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  cardSeleccionada: {
    shadowColor: TEMA.negro,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 12,
  },
  zonaPrincipal: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 12,
    backgroundColor: TEMA.cremaPanel,
  },
  textos: {
    flex: 1,
    minWidth: 0,
  },
  nombre: {
    fontSize: 17,
    fontWeight: "700",
    color: TEMA.textoNegro,
    marginBottom: 2,
  },
  meta: {
    fontSize: 13,
    color: TEMA.textoSecundario,
    lineHeight: 18,
  },
  acciones: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: `${TEMA.negro}22`,
  },
  botonMitad: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  botonClase: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  textoBotonCard: {
    fontWeight: "600",
    fontSize: 13,
  },
});
