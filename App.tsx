import { ActivityIndicator, ScrollView, StyleSheet, View, Text, ImageBackground, useColorScheme, ImageSourcePropType, TextInput, Pressable, Modal, Alert, FlatList, TextInputComponent, ColorValue} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { useFonts } from 'expo-font'
import { Image } from 'expo-image'
import { SafeAreaView } from 'react-native-safe-area-context'
import React, { ReactNode, useEffect, useState } from 'react'
import axios from "axios";
import dayjs from "dayjs";
import { Picker } from '@react-native-picker/picker'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { globalStyles } from './styles/GlobalStyles'
import Listado from './components/Listado'
import ModalPersonaje from './components/ModalPersonaje'
import { cerrarApp} from './utils/Funciones'
import { CRUDcargarPersonajes, CRUDcrearNuevoPersonaje, CRUDactualizarPersonaje, CRUDeliminarPersonaje } from './utils/CrudPersonajes'
import { Personaje, DatosFormularioPersonaje } from './types/Personaje'

export default function App() {
  const [busqueda, setBusqueda] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [personajeSeleccionado, setPersonajeSeleccionado] = useState<Personaje | null>(null);
  const [personajes, setPersonajes] = useState<Personaje[]>([]);
  const [refrescar, setRefrescar] = useState(0);

  useEffect(() => {cargarListaPersonajes();}, []);

  const cargarListaPersonajes = async () => {
    try {
      const datos = await CRUDcargarPersonajes();
      setPersonajes(datos);
      setRefrescar(prev => prev + 1);
    } catch (error) {
      console.error("Error al cargar personajes:", error);
    }
  };

  const seleccionarPersonaje = (personaje: Personaje) => {
    setPersonajeSeleccionado(personaje);
  };

  const crearNuevoPer = () => {
    setPersonajeSeleccionado(null);
    setModoEdicion(false);
    setModalVisible(true);
  };

  const editarPer = () => {
    if (!personajeSeleccionado) {
      Alert.alert("Error", "Por favor, selecciona un personaje para editar");
      return;
    }
    setModoEdicion(true);
    setModalVisible(true);
  };

  const borrarPer = () => {
    if (!personajeSeleccionado) {
      Alert.alert("Error", "Por favor, selecciona un personaje para borrar");
      return;
    }

    Alert.alert(
      "Confirmar eliminación",
      `¿Estás seguro de que quieres eliminar a ${personajeSeleccionado.nombre_per}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await CRUDeliminarPersonaje(personajeSeleccionado.id);
              await cargarListaPersonajes();
              setPersonajeSeleccionado(null);
              Alert.alert("Éxito", "Personaje eliminado correctamente");
            } catch (error) {
              console.error("Error al eliminar personaje:", error);
              Alert.alert("Error", "No se pudo eliminar el personaje");
            }
          }
        }
      ]
    );
  };

  const guardarPersonaje = async (datos: DatosFormularioPersonaje) => {
    try {
      if (modoEdicion && personajeSeleccionado) {
        await CRUDactualizarPersonaje(personajeSeleccionado.id, datos);
        Alert.alert("Éxito", "Personaje actualizado correctamente");
      } else {
        await CRUDcrearNuevoPersonaje(datos);
        Alert.alert("Éxito", "Personaje creado correctamente");
      }
      await cargarListaPersonajes();
      setModalVisible(false);
      setPersonajeSeleccionado(null);
    } catch (error) {
      console.error("Error al guardar personaje:", error);
      Alert.alert("Error", "No se pudo guardar el personaje");
    }
  };

  return (
    <SafeAreaView style={globalStyles.contenedorSafeArea}>
      <View style={globalStyles.contenedorCabecera}>
        <Image
          source={require("./assets/TavernMaster_Icon.png")}
          style={globalStyles.imagenLogo}
          contentFit='contain'
        />
        <View style={globalStyles.contenedorDatosUsuario}>
          <View>
            <Text style={globalStyles.textoUsuario}> Administrador</Text>
            <Pressable style={globalStyles.botonRojo} onPress={cerrarApp}>
              <Text style={globalStyles.textoBoton}>Cerrar Sesión</Text>
            </Pressable>
          </View>
          <View style={globalStyles.contenedorImagenUsuario}>
            <Image
              source={require("./assets/iconAdmin.png")}
              style={globalStyles.imagenUsuario}
              contentFit='cover'
            />
          </View>
        </View>
      </View>
      
      <View style={globalStyles.contenedorEtiqueta}>
        <Text style={globalStyles.textoEtiqueta}>Personajes</Text>
      </View>
      
      <View style={globalStyles.contenedorPrincipal}>
        <TextInput
          style={globalStyles.barraBusqueda}
          placeholder="Buscar personaje por nombre..."
          value={busqueda}
          onChangeText={setBusqueda}
        />

        <View style={globalStyles.contenedorBotones}>
          <Pressable 
            style={globalStyles.botonVerde}
            onPress={crearNuevoPer}
          >
            <Text style={globalStyles.textoBoton}>Crear Nuevo</Text>
          </Pressable>
          <Pressable 
            style={[
              globalStyles.botonAmarillo,
              !personajeSeleccionado && { opacity: 0.5 }
            ]}
            onPress={editarPer}
            disabled={!personajeSeleccionado}
          >
            <Text style={globalStyles.textoBoton}>Editar</Text>
          </Pressable>
          <Pressable 
            style={[
              globalStyles.botonRojo,
              !personajeSeleccionado && { opacity: 0.5 }
            ]}
            onPress={borrarPer}
            disabled={!personajeSeleccionado}
          >
            <Text style={globalStyles.textoBoton}>Borrar</Text>
          </Pressable>
        </View>

        <Listado 
          busqueda={busqueda}
          onSeleccionarPersonaje={seleccionarPersonaje}
          personajeSeleccionadoId={personajeSeleccionado?.id}
          key={refrescar}
        />
        
        <ModalPersonaje
          visible={modalVisible}
          cerrar={() => setModalVisible(false)}
          guardar={guardarPersonaje}
          personaje={personajeSeleccionado}
          modoEdicion={modoEdicion}
        />
      </View>
    </SafeAreaView>
  );
}