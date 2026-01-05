export type Personaje = {
  id_per: number;
  jugador_padre: string;
  cam: string | null;
  nombre_per: string;
  nivel: number;
  imagen: string;
};

export type Personajes = Array<Personaje>;

export type DatosFormularioPersonaje = {
  nombre_per: string;
  nivel: number;
  jugador_padre: string;
  cam: string | null;
  imagen: string;
};