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
import { globalStyles } from '../styles/GlobalStyles';
import CardPersonaje from './CardPersonaje'
import personajesData from '../assets/PERSONAJE.json';
import { Personaje } from '../types/Personaje'

export default function Listado() {
  const personajes: Personaje[] = personajesData;

  return (
    <FlatList
      data={personajes}
      keyExtractor={(item) => item.id_per.toString()}
      renderItem={({item}) => (
        <CardPersonaje
          nombre={item.nombre_per}
          nivel={item.nivel}
          jugador={item.jugador_padre}
          campania={item.id_cam?.toString() || 'Sin campaña'}
          id={item.id_per}
          imagenRuta={item.imagen}
        />
      )}
      contentContainerStyle={{ paddingBottom: 20 }}
    />
  )
}