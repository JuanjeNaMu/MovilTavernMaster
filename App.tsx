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
import { globalStyles } from './styles/GlobalStyles'
import Listado from './components/Listado'

export default function App() {
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
            <Text style={globalStyles.textoUsuario}>Nombre Usuario</Text>
            <Pressable style={globalStyles.botonRojo}>
              <Text style={globalStyles.textoBoton}>Cerrar Sesión</Text>
            </Pressable>
          </View>
          <View style={globalStyles.contenedorImagenUsuario}>
            <Image
              source={require("./assets/Icon_usuario.png")}
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
        <View style={globalStyles.contenedorBotones}>
          <Pressable style={globalStyles.botonVerde}>
            <Text style={globalStyles.textoBoton}>Crear Nuevo</Text>
          </Pressable>
          <Pressable style={globalStyles.botonAmarillo}>
            <Text style={globalStyles.textoBoton}>Editar</Text>
          </Pressable>
          <Pressable style={globalStyles.botonRojo}>
            <Text style={globalStyles.textoBoton}>Borrar</Text>
          </Pressable>
        </View>

        <Listado/>
        
        <View style={globalStyles.contenedorBotones}>
          <Pressable style={globalStyles.botonAmarillo}>
            <Text style={globalStyles.textoBoton}>Buscarle Campaña</Text>
          </Pressable>
          <Pressable style={globalStyles.botonRojo}>
            <Text style={globalStyles.textoBoton}>Quitar de Campaña</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  )
}