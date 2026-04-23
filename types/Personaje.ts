export type Personaje = {
  id_per: number;
  jugador_padre: string;
  nombre_per: string;
  nivel: number;
  imagen_base64: string | null;
  id_cam?: number | null;
  nombre_campana?: string | null;
};

export type Personajes = Personaje[];

export type DatosFormularioPersonaje = {
  nombre_per: string;
  nivel: number;
  jugador_padre: string;
  id_cam: number | null;
  imagen_base64: string | null;
  clase: string;
};
