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
import * as R from 'ramda';
import { Platform } from 'react-native'
import { globalStyles } from '../styles/GlobalStyles';
import CardPersonaje from './CardPersonaje'
import { Personaje, Personajes } from '../types/Personaje'

type ListadoProps = {
  busqueda: string;
  onSeleccionarPersonaje: (personaje: Personaje) => void;
  personajeSeleccionadoId?: number;
}

export default function Listado({ busqueda, onSeleccionarPersonaje, personajeSeleccionadoId }: ListadoProps) {
  const [personajes, setPersonajes] = useState<Personajes>([]);

  useEffect(() => {
    cargarPersonajes();}, []);

  const cargarPersonajes = async () => {
    try {
      const IP = Platform.OS === "android" ? "10.0.2.2" : "localhost";
      const url = `http://${IP}:3000/personajes`;
      const respuesta = await axios.get(url);
      setPersonajes(respuesta.data);
    } catch (error) {
      console.error("Error al cargar personajes:", error);
    }
  };

  const personajesFiltrados = personajes.filter(personaje =>
    personaje.nombre_per.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <View style={globalStyles.contenedorCard}>
      <FlatList
        data={personajesFiltrados}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({item}) => (
          <CardPersonaje
            nombre={item.nombre_per}
            nivel={item.nivel}
            jugador={item.jugador_padre}
            campania={item.cam?.toString() || 'Sin Campaña'}
            id={item.id}
            imagenRuta={item.imagen}
            seleccionado={personajeSeleccionadoId === item.id}
            onPress={() => onSeleccionarPersonaje(item)}
          />
        )}
      />
    </View>
  );
}