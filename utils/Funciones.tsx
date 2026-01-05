export const cogerRuta = (imagenNombre?: string): any => {
  const defaultImage = require('../assets/Icon_usuario.png');
  
  if (!imagenNombre) return defaultImage;
  
  const listadoImagenes: Record<string, any> = {
    'Arkan.jpg': require('../assets/Arkan.jpg'),
    'Dravok.jpg': require('../assets/Dravok.jpg'),
    'Nymra.jpg': require('../assets/Nymra.jpg'),
    'Selene.jpg': require('../assets/Selene.jpg'),
    'Aragorn.jpg': require('../assets/Aragorn.jpg'),
    'Gimli.jpg': require('../assets/Gimli.jpg'),
    'Legolas.jpg': require('../assets/Legolas.jpg'),
    'Saruman.jpg': require('../assets/Saruman.jpg'),
  };
  
  return listadoImagenes[imagenNombre] || defaultImage;
};

import { Alert, BackHandler} from 'react-native';

export const cerrarApp = (): void => {
  Alert.alert(
    "Cerrar sesión",
    "¿Estás seguro de que quieres cerrar la aplicación?",
    [
      {
        text: "Cancelar",
        style: "cancel"
      },
      {
        text: "Sí, cerrar",
        onPress: () => BackHandler.exitApp()
      }
    ]
  );
};