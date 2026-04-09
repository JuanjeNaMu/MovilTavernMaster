import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { globalStyles } from "../styles/GlobalStyles";
import { TEMA } from "../utils/temaApp";
import { loginApi, LoginFallidoError } from "../utils/authApi";
import { guardarSesion, type Sesion } from "../utils/authSession";

type PantallaLoginProps = {
  onSesionIniciada: (sesion: Sesion) => void;
};

export default function PantallaLogin({ onSesionIniciada }: PantallaLoginProps) {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [enviando, setEnviando] = useState(false);

  const entrar = async () => {
    setEnviando(true);
    try {
      const jug = await loginApi(usuario, password);
      const nombreJug = jug.nombreJug?.trim() ?? usuario.trim();
      const sesion: Sesion = { nombreJug };
      await guardarSesion(sesion);
      onSesionIniciada(sesion);
    } catch (e) {
      if (e instanceof LoginFallidoError) {
        Alert.alert("Login", e.message);
      } else {
        console.error(e);
        Alert.alert(
          "Conexión",
          "No se pudo contactar con la API. ¿Está Spring en el puerto 8080?",
        );
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <SafeAreaView style={globalStyles.contenedorSafeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <View style={styles.centrado}>
          <Image
            source={require("../assets/TavernMaster_Icon.png")}
            style={[globalStyles.imagenLogo, styles.logo]}
            contentFit="contain"
          />
          <Text style={styles.titulo}>TavernMaster</Text>
          <Text style={styles.sub}>Inicia sesión con tu usuario de jugador</Text>

          <Text style={styles.label}>Usuario</Text>
          <TextInput
            style={globalStyles.barraBusqueda}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="Nombre de jugador"
            placeholderTextColor={TEMA.textoSecundario}
            value={usuario}
            onChangeText={setUsuario}
            editable={!enviando}
          />

          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={globalStyles.barraBusqueda}
            secureTextEntry
            autoCapitalize="none"
            placeholder="Contraseña"
            placeholderTextColor={TEMA.textoSecundario}
            value={password}
            onChangeText={setPassword}
            editable={!enviando}
            onSubmitEditing={() => void entrar()}
          />

          <Pressable
            style={[globalStyles.botonVerde, styles.botonEntrar, enviando && { opacity: 0.6 }]}
            onPress={() => void entrar()}
            disabled={enviando}
          >
            {enviando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={globalStyles.textoBoton}>Entrar</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  logo: {
    alignSelf: "center",
    marginBottom: 8,
  },
  centrado: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  titulo: {
    fontSize: 28,
    fontWeight: "800",
    color: TEMA.textoCrema,
    textAlign: "center",
    marginBottom: 6,
  },
  sub: {
    fontSize: 15,
    color: TEMA.cremaPanel,
    textAlign: "center",
    marginBottom: 28,
  },
  label: {
    alignSelf: "flex-start",
    fontWeight: "700",
    color: TEMA.crema,
    marginBottom: 6,
    marginTop: 10,
  },
  botonEntrar: {
    marginTop: 24,
    paddingVertical: 16,
  },
});
