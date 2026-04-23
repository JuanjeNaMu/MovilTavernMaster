
export const TEMA = {
  negro: "#252423",
  negroElevado: "#32302E",
  rojo: "#B84A4A",
  rojoOscuro: "#8F3838",
  crema: "#EDE6DC",
  cremaClaro: "#FAF7F2",
  cremaPanel: "#E8E1D6",
  textoCrema: "#FAF7F2",
  textoNegro: "#252423",
  textoSecundario: "#5C5855",
  overlay: "rgba(37, 36, 35, 0.65)",
} as const;

export type TinteClase = {
  accent: string;
  fondoTarjeta: string;
  bordeTarjeta: string;
  badgeTexto: string;
  textoBotonClase: string;
};

export function tintePorClase(clase: string | null | undefined): TinteClase {
  const c = (clase ?? "").trim().toLowerCase();
  if (c.includes("explorador")) {
    return {
      accent: "#2D6A4F",
      fondoTarjeta: "#E8F2EC",
      bordeTarjeta: "#40916C",
      badgeTexto: TEMA.textoCrema,
      textoBotonClase: TEMA.textoCrema,
    };
  }
  if (c.includes("guerrero")) {
    return {
      accent: "#A63D3D",
      fondoTarjeta: "#F3E4E4",
      bordeTarjeta: "#C45C5C",
      badgeTexto: TEMA.textoCrema,
      textoBotonClase: TEMA.textoCrema,
    };
  }
  if (c.includes("hechicero")) {
    return {
      accent: "#3D6B99",
      fondoTarjeta: "#E4EDF5",
      bordeTarjeta: "#5B8FC4",
      badgeTexto: TEMA.textoCrema,
      textoBotonClase: TEMA.textoCrema,
    };
  }
  return {
    accent: "#C4A035",
    fondoTarjeta: "#F5EDD5",
    bordeTarjeta: "#D4B84A",
    badgeTexto: TEMA.textoNegro,
    textoBotonClase: TEMA.textoNegro,
  };
}
