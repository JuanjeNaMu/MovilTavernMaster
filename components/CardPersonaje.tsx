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
import { Personaje } from '../types/Personaje'
import { cogerRuta } from '../utils/Funciones'

type CardPersonajeProps = {
  nombre: string;
  nivel: number;
  jugador: string;
  campania?: string;
  id: number;
  imagenRuta?: string;
}

export default function CardPersonaje({ 
  nombre, 
  nivel, 
  jugador, 
  campania, 
  id, 
  imagenRuta 
}: CardPersonajeProps) {
  
  const imageSource = cogerRuta(imagenRuta);

  return (
    <View style={globalStyles.cardPersonaje}>
      <Image 
        source={imageSource} 
        style={globalStyles.imagenPersonaje}
        contentFit="cover"
      />
      
      <View style={globalStyles.contenedorCard}>
        <Text style={globalStyles.nombreCard}>{nombre}</Text>
        
        <View style={globalStyles.contenedorCard}>
          <View style={globalStyles.filaCard}>
            <Text style={globalStyles.atributoPersonaje}>Nivel:</Text>
            <Text style={globalStyles.valorAtributo}>{nivel}</Text>
          </View>
          <View style={globalStyles.filaCard}>
            <Text style={globalStyles.atributoPersonaje}>Jugador:</Text>
            <Text style={globalStyles.valorAtributo}>{jugador}</Text>
          </View>
          <View style={globalStyles.filaCard}>
            <Text style={globalStyles.atributoPersonaje}>Campaña:</Text>
            <Text style={globalStyles.valorAtributo}>"{campania || 'Sin campaña'}"</Text>
          </View>
          <View style={globalStyles.filaCard}>
            <Text style={globalStyles.atributoPersonaje}>ID:</Text>
            <Text style={globalStyles.valorAtributo}>{id}</Text>
          </View>
        </View>
      </View>
    </View>
  )
}