export type Personaje = {
  id_per: number;
  nombre_per: string;
  nivel: number;
  jugador_padre: string;
  id_cam?: number | null;
  imagen?: string;
}