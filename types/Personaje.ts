/** Personaje tal como lo expone la API Spring (`dam.tavernmaster.entity.Personaje`). */
export type Personaje = {
  id_per: number;
  jugador_padre: string;
  nombre_per: string;
  nivel: number;
  imagen_base64: string | null;
  id_cam?: number | null;
  /** Si el backend lo incluye al listar personajes (p. ej. JOIN). */
  nombre_campana?: string | null;
};

export type Personajes = Personaje[];

export type DatosFormularioPersonaje = {
  nombre_per: string;
  nivel: number;
  jugador_padre: string;
  /** ID numérico de campaña en BD, o null si no tiene. */
  id_cam: number | null;
  imagen_base64: string | null;
  /** Igual que en TavernMaster JavaFX: Principiante, Explorador, Guerrero, Hechicero */
  clase: string;
};
