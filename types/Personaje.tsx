export type Personaje = {
  id_per: number;
  nombre_per: string;
  nivel: number;
  jugador_padre: string;
  cam?: string | null;
  imagen?: string;
}