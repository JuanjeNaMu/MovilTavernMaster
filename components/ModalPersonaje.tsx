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
import { Personaje, DatosFormularioPersonaje } from '../types/Personaje';
import { cogerRuta } from '../utils/Funciones';

type ModalPersonajeProps = {
  visible: boolean;
  cerrar: () => void;
  guardar: (datos: DatosFormularioPersonaje) => void;
  personaje: Personaje | null;
  modoEdicion: boolean;
};

export default function ModalPersonaje({ 
  visible, 
  cerrar, 
  guardar, 
  personaje, 
  modoEdicion 
}: ModalPersonajeProps) {
  const [nombre, setNombre] = useState('');
  const [nivel, setNivel] = useState(1);
  const [jugador, setJugador] = useState('');
  const [campania, setCampania] = useState('');
  const [imagen, setImagen] = useState('icon_usuario.png');
  const [imagenPreview, setImagenPreview] = useState<any>(null);

  useEffect(() => {
    if (personaje && modoEdicion) {
      setNombre(personaje.nombre_per);
      setNivel(personaje.nivel);
      setJugador(personaje.jugador_padre);
      setCampania(personaje.cam || '');
      setImagen(personaje.imagen);
      setImagenPreview(cogerRuta(personaje.imagen));
    } else {
      setNombre('');
      setNivel(1);
      setJugador('');
      setCampania('');
      setImagen('icon_usuario.png');
      setImagenPreview(cogerRuta('icon_usuario.png'));
    }
  }, [personaje, modoEdicion, visible]);

  const opcionesImagenes = [
    { label: 'Icono por defecto', value: 'icon_usuario.png' },
    { label: 'Arkan', value: 'Arkan.jpg' },
    { label: 'Dravok', value: 'Dravok.jpg' },
    { label: 'Nymra', value: 'Nymra.jpg' },
    { label: 'Selene', value: 'Selene.jpg' },
    { label: 'Aragorn', value: 'Aragorn.jpg' },
    { label: 'Gimli', value: 'Gimli.jpg' },
    { label: 'Legolas', value: 'Legolas.jpg' },
    { label: 'Saruman', value: 'Saruman.jpg' },
  ];

  const niveles = Array.from({ length: 20 }, (_, i) => i + 1);

  const cambiarImagen = (value: string) => {
    setImagen(value);
    setImagenPreview(cogerRuta(value));
  };

  const clickEnGuardar = () => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'El nombre del personaje es obligatorio');
      return;
    }
    if (!jugador.trim()) {
      Alert.alert('Error', 'El nombre del jugador es obligatorio');
      return;
    }

    const datos: DatosFormularioPersonaje = {
      nombre_per: nombre,
      nivel: nivel,
      jugador_padre: jugador,
      cam: campania || null,
      imagen: imagen
    };
    
    guardar(datos);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={cerrar}
    >
      <View style={globalStyles.modal}>
        <View style={globalStyles.ventanaModal}>

{/* CABECERA */}
          <View style={globalStyles.contenedorEtiqueta}>
            <Text style={globalStyles.textoEtiqueta}>
              {modoEdicion ? 'Editar Personaje' : 'Crear Nuevo Personaje'}
              {modoEdicion && nombre ? `: ${nombre}` : ''}
            </Text>
          </View>

{/* BODY */}
          <View>
            <View style={globalStyles.modalBody}>

{/* IZQUIERDA*/}
              <View style={globalStyles.modalIzquierda}>
                <Image 
                  source={imagenPreview} 
                  style={globalStyles.imagenModal}
                  resizeMode="cover"
                />


                <View>
                  <Text style={globalStyles.nombreCard}>Imagen Personaje</Text>
                  <View style={globalStyles.barraBusqueda}>
                    <Picker
                      selectedValue={imagen}
                      style={{ height: 50 }}
                      onValueChange={cambiarImagen}
                    >
                      {opcionesImagenes.map(opcion => (
                        <Picker.Item 
                          key={opcion.value} 
                          label={opcion.label} 
                          value={opcion.value}
                        />
                      ))}
                    </Picker>
                  </View>
                </View>

                  <Pressable
                    style={globalStyles.botonRojo}
                    onPress={() => {
                      setImagen('icon_usuario.png');
                      setImagenPreview(cogerRuta('icon_usuario.png'));
                    }}
                  >
                    <Text style={globalStyles.textoBoton}>
                      Quitar Imagen
                    </Text>
                  </Pressable>
              </View>

{/*DERECHA*/}
              <View style={globalStyles.contenedorCard}>
                <View>
                  <Text style={globalStyles.nombreCard}>Nombre Personaje</Text>
                  <TextInput
                    style={globalStyles.barraBusqueda}
                    value={nombre}
                    onChangeText={setNombre}
                    placeholder="Ej: Aragorn"
                  />
                </View>

                <View>
                  <Text style={globalStyles.nombreCard}>Nivel del personaje</Text>
                  <View style={globalStyles.barraBusqueda}>
                    <Picker
                      selectedValue={nivel}
                      style={{ height: 50 }}
                      onValueChange={(itemValue) => setNivel(itemValue)}
                    >
                      {niveles.map(nivel => (
                        <Picker.Item 
                          key={nivel} 
                          label={`Nivel ${nivel}`} 
                          value={nivel} 
                        />
                      ))}
                    </Picker>
                  </View>
                </View>

                <View>
                  <Text style={globalStyles.nombreCard}>Jugador</Text>
                  <TextInput
                    style={globalStyles.barraBusqueda}
                    value={jugador}
                    onChangeText={setJugador}
                    placeholder="Ej: Deichicus"
                  />
                </View>

                <View>
                  <Text style={globalStyles.nombreCard}>Campaña</Text>
                  <TextInput
                    style={globalStyles.barraBusqueda}
                    value={campania}
                    onChangeText={setCampania}
                    placeholder="Ej: Dragon Heist"
                  />
                </View>
              </View>
            </View>
          </View>

{/* BOTONES ABAJO */}
          <View style={globalStyles.contenedorBotones}>
            <Pressable
              style={globalStyles.botonRojo}
              onPress={cerrar}
            >
              <Text style={globalStyles.textoBoton}>
                Cancelar
              </Text>
            </Pressable>
            
            <Pressable
              style={modoEdicion ? globalStyles.botonAmarillo : globalStyles.botonVerde}
              onPress={clickEnGuardar}
            >
              <Text style={globalStyles.textoBoton}>
                {modoEdicion ? 'Guardar Cambios' : 'Crear Personaje'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}