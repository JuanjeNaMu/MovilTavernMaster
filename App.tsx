import { View, Text, TextInput, Pressable, Alert, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useCallback, useEffect, useState } from "react";
import { globalStyles } from "./styles/GlobalStyles";
import Listado from "./components/Listado";
import ModalPersonaje from "./components/ModalPersonaje";
import ModalFicha from "./components/ModalFicha";
import PantallaLogin from "./components/PantallaLogin";
import {
  CRUDcargarPersonajes,
  CRUDcrearNuevoPersonaje,
  CRUDactualizarPersonaje,
  CRUDeliminarPersonaje,
  CRUDobtenerFicha,
  CRUDobtenerNombreCampana,
} from "./utils/CrudPersonajes";
import { TEMA } from "./utils/temaApp";
import { borrarSesion, obtenerSesion, type Sesion } from "./utils/authSession";
import type { Personaje, DatosFormularioPersonaje } from "./types/Personaje";

export default function App() {
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [booting, setBooting] = useState(true);

  const [busqueda, setBusqueda] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalFichaVisible, setModalFichaVisible] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [personajeSeleccionado, setPersonajeSeleccionado] = useState<Personaje | null>(null);
  const [personajes, setPersonajes] = useState<Personaje[]>([]);
  const [refrescar, setRefrescar] = useState(0);
  const [refrescandoLista, setRefrescandoLista] = useState(false);
  /** Clase de ficha por id (para tinte en tarjetas). */
  const [clasePorPersonajeId, setClasePorPersonajeId] = useState<Record<number, string>>({});
  /** Nombre de campaña por `id_cam` (API o campo en listado). */
  const [nombresCampanaPorIdCam, setNombresCampanaPorIdCam] = useState<Record<number, string>>({});

  useEffect(() => {
    void (async () => {
      const s = await obtenerSesion();
      setSesion(s);
      setBooting(false);
    })();
  }, []);

  useEffect(() => {
    if (!sesion) {
      setPersonajes([]);
      setPersonajeSeleccionado(null);
      setBusqueda("");
      setClasePorPersonajeId({});
      setNombresCampanaPorIdCam({});
    }
  }, [sesion]);

  const cargarListaPersonajes = useCallback(async () => {
    if (!sesion) return;
    try {
      const datos = await CRUDcargarPersonajes(sesion.nombreJug);
      setPersonajes(datos);
      const clases = await Promise.all(
        datos.map(async (p) => {
          try {
            const f = await CRUDobtenerFicha(p.id_per);
            const c = f?.clase?.trim();
            return [p.id_per, c && c.length > 0 ? c : "Principiante"] as const;
          } catch {
            return [p.id_per, "Principiante"] as const;
          }
        }),
      );
      setClasePorPersonajeId(Object.fromEntries(clases));

      const porIdCam: Record<number, string> = {};
      for (const p of datos) {
        const idRaw = p.id_cam;
        if (idRaw == null) continue;
        const id = Number(idRaw);
        if (!Number.isFinite(id)) continue;
        const nm = p.nombre_campana?.trim();
        if (nm) porIdCam[id] = nm;
      }
      const idCams = [
        ...new Set(
          datos
            .map((p) => (p.id_cam == null ? null : Number(p.id_cam)))
            .filter((x): x is number => x != null && Number.isFinite(x)),
        ),
      ];
      await Promise.all(
        idCams.map(async (id) => {
          if (porIdCam[id]) return;
          const n = await CRUDobtenerNombreCampana(id);
          if (n) porIdCam[id] = n;
        }),
      );
      setNombresCampanaPorIdCam(porIdCam);

      setRefrescar((prev) => prev + 1);
    } catch (error) {
      console.error("Error al cargar personajes:", error);
      Alert.alert(
        "Error de conexión",
        "No se pudo hablar con la API TavernMaster (¿Spring en http://8080?).",
      );
    }
  }, [sesion]);

  const refrescarLista = useCallback(async () => {
    setRefrescandoLista(true);
    try {
      await cargarListaPersonajes();
    } finally {
      setRefrescandoLista(false);
    }
  }, [cargarListaPersonajes]);

  useEffect(() => {
    if (sesion) void cargarListaPersonajes();
  }, [sesion, cargarListaPersonajes]);

  const cerrarSesion = () => {
    Alert.alert("Cerrar sesión", "¿Salir de tu cuenta?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar sesión",
        style: "destructive",
        onPress: () => {
          void (async () => {
            await borrarSesion();
            setSesion(null);
          })();
        },
      },
    ]);
  };

  const seleccionarPersonaje = (personaje: Personaje) => {
    setPersonajeSeleccionado(personaje);
  };

  const crearNuevoPer = () => {
    setPersonajeSeleccionado(null);
    setModoEdicion(false);
    setModalVisible(true);
  };

  const verFichaDe = (p: Personaje) => {
    setPersonajeSeleccionado(p);
    setModalFichaVisible(true);
  };

  const editarPersonajeRapido = (p: Personaje) => {
    setPersonajeSeleccionado(p);
    setModoEdicion(true);
    setModalVisible(true);
  };

  const borrarPer = () => {
    if (!personajeSeleccionado) {
      Alert.alert("Error", "Toca un personaje en la lista y pulsa Borrar");
      return;
    }

    Alert.alert(
      "Confirmar eliminación",
      `¿Eliminar a ${personajeSeleccionado.nombre_per}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            void (async () => {
              try {
                await CRUDeliminarPersonaje(personajeSeleccionado.id_per);
                setPersonajeSeleccionado(null);
                await cargarListaPersonajes();
                Alert.alert("Éxito", "Personaje eliminado correctamente");
              } catch (error) {
                console.error("Error al eliminar personaje:", error);
                Alert.alert("Error", "No se pudo eliminar el personaje");
              }
            })();
          },
        },
      ],
    );
  };

  const guardarPersonaje = async (datos: DatosFormularioPersonaje) => {
    if (!sesion) return;
    try {
      if (modoEdicion && personajeSeleccionado) {
        const anterior = personajeSeleccionado;
        await CRUDactualizarPersonaje(
          personajeSeleccionado.id_per,
          datos,
          anterior,
          sesion.nombreJug,
        );
      } else {
        await CRUDcrearNuevoPersonaje(datos, sesion.nombreJug);
      }
      const eraEdicion = modoEdicion && personajeSeleccionado != null;
      setModalVisible(false);
      setPersonajeSeleccionado(null);
      await cargarListaPersonajes();
      Alert.alert(
        "Éxito",
        eraEdicion ? "Personaje actualizado correctamente" : "Personaje creado correctamente",
      );
    } catch (error) {
      console.error("Error al guardar personaje:", error);
      Alert.alert("Error", "No se pudo guardar el personaje");
    }
  };

  if (booting) {
    return (
      <SafeAreaView style={[globalStyles.contenedorSafeArea, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color={TEMA.rojo} />
      </SafeAreaView>
    );
  }

  if (!sesion) {
    return <PantallaLogin onSesionIniciada={setSesion} />;
  }

  return (
    <SafeAreaView style={globalStyles.contenedorSafeArea}>
      <View style={globalStyles.contenedorCabecera}>
        <View style={globalStyles.contenedorLogoCabecera}>
          <Image
            source={require("./assets/TavernMaster_Icon.png")}
            style={globalStyles.imagenLogoCabecera}
            contentFit="contain"
          />
        </View>
        <View style={globalStyles.contenedorDatosUsuario}>
          <View>
            <Text style={globalStyles.textoUsuario}>{sesion.nombreJug}</Text>
            <Pressable style={globalStyles.botonRojo} onPress={cerrarSesion}>
              <Text style={globalStyles.textoBoton}>Cerrar sesión</Text>
            </Pressable>
          </View>
          <View style={globalStyles.contenedorImagenUsuario}>
            <Image
              source={require("./assets/iconAdmin.png")}
              style={globalStyles.imagenUsuario}
              contentFit="cover"
            />
          </View>
        </View>
      </View>

      <View style={globalStyles.contenedorEtiqueta}>
        <Text style={globalStyles.textoEtiqueta}>Mis personajes</Text>
      </View>

      <View style={globalStyles.contenedorPrincipal}>
        <TextInput
          style={globalStyles.barraBusqueda}
          placeholder="Buscar personaje por nombre…"
          placeholderTextColor={TEMA.textoSecundario}
          value={busqueda}
          onChangeText={setBusqueda}
        />

        <View style={globalStyles.barraAccionesLista}>
          <Pressable style={[globalStyles.botonVerde, { flex: 1 }]} onPress={crearNuevoPer}>
            <Text style={globalStyles.textoBoton}>Crear personaje</Text>
          </Pressable>
          <Pressable
            style={[
              globalStyles.botonRojo,
              { backgroundColor: TEMA.rojoOscuro, flex: 1 },
              !personajeSeleccionado && { opacity: 0.45 },
            ]}
            onPress={borrarPer}
            disabled={!personajeSeleccionado}
          >
            <Text style={globalStyles.textoBoton}>Borrar</Text>
          </Pressable>
        </View>

        <Listado
          personajes={personajes}
          busqueda={busqueda}
          clasePorPersonajeId={clasePorPersonajeId}
          nombresCampanaPorIdCam={nombresCampanaPorIdCam}
          onSeleccionarPersonaje={seleccionarPersonaje}
          personajeSeleccionadoId={personajeSeleccionado?.id_per}
          key={refrescar}
          refrescando={refrescandoLista}
          onRefrescar={() => void refrescarLista()}
          onVerFicha={verFichaDe}
          onEditarPersonaje={editarPersonajeRapido}
        />

        <ModalPersonaje
          visible={modalVisible}
          cerrar={() => setModalVisible(false)}
          guardar={(d) => void guardarPersonaje(d)}
          personaje={personajeSeleccionado}
          modoEdicion={modoEdicion}
          nombreJugSesion={sesion.nombreJug}
        />

        <ModalFicha
          visible={modalFichaVisible}
          cerrar={() => setModalFichaVisible(false)}
          personaje={personajeSeleccionado}
        />
      </View>
    </SafeAreaView>
  );
}
