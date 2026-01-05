import { FlatList, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Platform } from 'react-native'
import axios from "axios";
import { globalStyles } from '../styles/GlobalStyles';
import CardPersonaje from './CardPersonaje'
import { Personaje, Personajes } from '../types/Personaje'

type ListadoProps = {
  busqueda: string;
}

export default function Listado({ busqueda }: ListadoProps) {
  const [personajes, setPersonajes] = useState<Personajes>([]);

  useEffect(() => {
    cargarPersonajes();
  }, []);

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
    <View style={{ flex: 1 }}>
      <FlatList
        data={personajesFiltrados}
        keyExtractor={(item) => item.id_per.toString()}
        renderItem={({item}) => (
          <CardPersonaje
            nombre={item.nombre_per}
            nivel={item.nivel}
            jugador={item.jugador_padre}
            campania={item.cam?.toString() || 'Sin Campaña'}
            id={item.id_per}
            imagenRuta={item.imagen}
          />
        )}
      />
    </View>
  );
}