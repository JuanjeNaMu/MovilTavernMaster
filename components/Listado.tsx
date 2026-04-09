import React from "react";
import { View, FlatList, RefreshControl } from "react-native";
import { globalStyles } from "../styles/GlobalStyles";
import CardPersonaje from "./CardPersonaje";
import type { Personaje, Personajes } from "../types/Personaje";
import { TEMA } from "../utils/temaApp";

type ListadoProps = {
  personajes: Personajes;
  busqueda: string;
  clasePorPersonajeId?: Record<number, string>;
  nombresCampanaPorIdCam?: Record<number, string>;
  onSeleccionarPersonaje: (personaje: Personaje) => void;
  personajeSeleccionadoId?: number;
  refrescando?: boolean;
  onRefrescar?: () => void;
  onVerFicha?: (personaje: Personaje) => void;
  onEditarPersonaje?: (personaje: Personaje) => void;
};

export default function Listado({
  personajes,
  busqueda,
  clasePorPersonajeId,
  nombresCampanaPorIdCam,
  onSeleccionarPersonaje,
  personajeSeleccionadoId,
  refrescando = false,
  onRefrescar,
  onVerFicha,
  onEditarPersonaje,
}: ListadoProps) {
  const personajesFiltrados = personajes.filter((personaje) =>
    personaje.nombre_per.toLowerCase().includes(busqueda.toLowerCase()),
  );

  return (
    <View style={globalStyles.contenedorCard}>
      <FlatList
        data={personajesFiltrados}
        extraData={{ lista: personajesFiltrados, sel: personajeSeleccionadoId }}
        keyExtractor={(item) => String(item.id_per)}
        refreshControl={
          onRefrescar ? (
            <RefreshControl refreshing={refrescando} onRefresh={onRefrescar} tintColor={TEMA.rojo} />
          ) : undefined
        }
        renderItem={({ item }) => {
          const idCam =
            item.id_cam == null ? null : Number(item.id_cam);
          const nombreCam =
            idCam != null && Number.isFinite(idCam)
              ? nombresCampanaPorIdCam?.[idCam]
              : undefined;
          return (
          <CardPersonaje
            personaje={item}
            claseFicha={clasePorPersonajeId?.[item.id_per]}
            nombreCampana={nombreCam}
            seleccionado={personajeSeleccionadoId === item.id_per}
            onPress={() => onSeleccionarPersonaje(item)}
            onVerFicha={onVerFicha ? () => onVerFicha(item) : undefined}
            onEditar={onEditarPersonaje ? () => onEditarPersonaje(item) : undefined}
          />
          );
        }}
      />
    </View>
  );
}
