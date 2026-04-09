import type { Ficha } from "../types/Ficha";

export const STATS = [
  "Fuerza",
  "Destreza",
  "Constitución",
  "Inteligencia",
  "Sabiduría",
  "Carisma",
] as const;

export type StatName = (typeof STATS)[number];

export function modificador(valor: number): number {
  return Math.floor((valor - 10) / 2);
}

export function formatMod(mod: number): string {
  return mod >= 0 ? `+${mod}` : String(mod);
}

export function bonificadorCompetencia(nivel: number): number {
  return Math.floor((nivel - 1) / 4) + 2;
}

export function calcularPG(clase: string, nivel: number, modCon: number): number {
  const c = clase.toLowerCase();
  let dado = 8;
  if (c === "guerrero") dado = 10;
  else if (c === "hechicero" || c.startsWith("hechicer")) dado = 6;
  else if (c === "explorador") dado = 8;

  let pg = dado + modCon;
  for (let i = 2; i <= nivel; i++) pg += Math.floor(dado / 2) + 1 + modCon;
  return Math.max(pg, 1);
}

export function generarFichaPorClase(idFicha: number, clase: string): Ficha {
  const c = clase.toLowerCase();
  let fue = 10,
    des = 10,
    con = 10,
    intel = 10,
    sab = 10,
    car = 10;

  if (c === "guerrero") {
    fue = 15;
    des = 13;
    con = 14;
    intel = 10;
    sab = 12;
    car = 8;
  } else if (c === "explorador") {
    fue = 12;
    des = 15;
    con = 13;
    intel = 10;
    sab = 14;
    car = 8;
  } else if (c.startsWith("hechicer")) {
    fue = 8;
    des = 13;
    con = 14;
    intel = 10;
    sab = 12;
    car = 15;
  }

  return {
    id_ficha: idFicha,
    clase,
    fuerza: fue,
    destreza: des,
    constitucion: con,
    inteligencia: intel,
    sabiduria: sab,
    carisma: car,
  };
}

export type SalvacionKey = "fue" | "des" | "con" | "intel" | "sab" | "car";
export type HabilidadKey =
  | "acrobacias"
  | "atletismo"
  | "arcano"
  | "engano"
  | "historia"
  | "intimidacion"
  | "investigacion"
  | "medicina"
  | "naturaleza"
  | "percepcion"
  | "perspicacia"
  | "persuasion"
  | "sigilo"
  | "supervivencia";

/** Competencias fijas por clase (misma lógica que `ControllerVerFicha.aplicarCompetenciasDeClase`). */
export function keysCompetenciaClase(clase: string): {
  salv: SalvacionKey[];
  hab: HabilidadKey[];
} {
  const c = clase.toLowerCase();
  switch (c) {
    case "guerrero":
      return {
        salv: ["fue", "con"],
        hab: ["atletismo", "intimidacion", "supervivencia", "percepcion", "acrobacias"],
      };
    case "explorador":
      return {
        salv: ["des", "sab"],
        hab: ["naturaleza", "percepcion", "sigilo", "supervivencia", "atletismo"],
      };
    case "hechicero":
    default:
      if (c.startsWith("hechicer")) {
        return {
          salv: ["intel", "car"],
          hab: ["arcano", "historia", "investigacion", "engano", "persuasion"],
        };
      }
      return { salv: [], hab: [] };
  }
}

export function getModPorStat(
  stat: string,
  mods: {
    fue: number;
    des: number;
    con: number;
    intel: number;
    sab: number;
    car: number;
  },
): number {
  switch (stat) {
    case "Fuerza":
      return mods.fue;
    case "Destreza":
      return mods.des;
    case "Constitución":
      return mods.con;
    case "Inteligencia":
      return mods.intel;
    case "Sabiduría":
      return mods.sab;
    case "Carisma":
      return mods.car;
    default:
      return 0;
  }
}
