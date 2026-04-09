import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { Image } from "expo-image";
import { Picker } from "@react-native-picker/picker";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import type { Personaje } from "../types/Personaje";
import type { Ficha } from "../types/Ficha";
import { dataUriFromStoredBase64 } from "../utils/imagenAssets";
import {
  STATS,
  bonificadorCompetencia,
  calcularPG,
  formatMod,
  getModPorStat,
  modificador,
  keysCompetenciaClase,
  type HabilidadKey,
  type SalvacionKey,
} from "../utils/fichaDnD";
import { CRUDobtenerFicha } from "../utils/CrudPersonajes";
import { TEMA, tintePorClase } from "../utils/temaApp";

type ModalFichaProps = {
  visible: boolean;
  cerrar: () => void;
  personaje: Personaje | null;
};

type AtkRow = { nombre: string; stat: string; comp: boolean };

const salvOrder: { key: SalvacionKey; label: string }[] = [
  { key: "fue", label: "Fuerza" },
  { key: "des", label: "Destreza" },
  { key: "con", label: "Constitución" },
  { key: "intel", label: "Inteligencia" },
  { key: "sab", label: "Sabiduría" },
  { key: "car", label: "Carisma" },
];

const habOrder: { key: HabilidadKey; label: string }[] = [
  { key: "acrobacias", label: "Acrobacias (Des)" },
  { key: "atletismo", label: "Atletismo (Fue)" },
  { key: "arcano", label: "Arcano (Int)" },
  { key: "engano", label: "Engaño (Car)" },
  { key: "historia", label: "Historia (Int)" },
  { key: "intimidacion", label: "Intimidación (Car)" },
  { key: "investigacion", label: "Investigación (Int)" },
  { key: "medicina", label: "Medicina (Sab)" },
  { key: "naturaleza", label: "Naturaleza (Int)" },
  { key: "percepcion", label: "Percepción (Sab)" },
  { key: "perspicacia", label: "Perspicacia (Sab)" },
  { key: "persuasion", label: "Persuasión (Car)" },
  { key: "sigilo", label: "Sigilo (Des)" },
  { key: "supervivencia", label: "Supervivencia (Sab)" },
];

type Mods = { fue: number; des: number; con: number; intel: number; sab: number; car: number };

const modPorSalv: Record<SalvacionKey, keyof Mods> = {
  fue: "fue",
  des: "des",
  con: "con",
  intel: "intel",
  sab: "sab",
  car: "car",
};

const modPorHab: Record<HabilidadKey, keyof Mods> = {
  acrobacias: "des",
  atletismo: "fue",
  arcano: "intel",
  engano: "car",
  historia: "intel",
  intimidacion: "car",
  investigacion: "intel",
  medicina: "sab",
  naturaleza: "intel",
  percepcion: "sab",
  perspicacia: "sab",
  persuasion: "car",
  sigilo: "des",
  supervivencia: "sab",
};

function buildMods(f: Ficha): Mods {
  return {
    fue: modificador(f.fuerza),
    des: modificador(f.destreza),
    con: modificador(f.constitucion),
    intel: modificador(f.inteligencia),
    sab: modificador(f.sabiduria),
    car: modificador(f.carisma),
  };
}

type TiradaResultado = {
  nombre: string;
  bono: number;
  d1: number;
  d2: number;
  t1: number;
  t2: number;
};

function calcularTirada(nombre: string, bono: number): TiradaResultado {
  const d1 = Math.floor(Math.random() * 20) + 1;
  const d2 = Math.floor(Math.random() * 20) + 1;
  return {
    nombre,
    bono,
    d1,
    d2,
    t1: d1 + bono,
    t2: d2 + bono,
  };
}

/** Color del total según el d20 natural (escritorio: 1 crítico mal, 20 crítico bien). */
function colorPorD20Natural(d: number): string {
  if (d === 1) return "#c0392b";
  if (d === 20) return "#27ae60";
  return "#2c2c2c";
}

function LineaRegistroTirada({ t }: { t: TiradaResultado }) {
  const c1 = colorPorD20Natural(t.d1);
  const c2 = colorPorD20Natural(t.d2);
  return (
    <Text style={styles.regLineBase}>
      <Text>🎲 {t.nombre} ({formatMod(t.bono)}) → </Text>
      <Text style={[styles.regTotal, { color: c1 }]}>{t.t1}</Text>
      <Text>  |  </Text>
      <Text style={[styles.regTotal, { color: c2 }]}>{t.t2}</Text>
    </Text>
  );
}

function SectionTitle({ children, accent }: { children: string; accent: string }) {
  return (
    <View style={[styles.sectionBar, { borderLeftColor: accent }]}>
      <Text style={styles.sectionBarText}>{children}</Text>
    </View>
  );
}

export default function ModalFicha({ visible, cerrar, personaje }: ModalFichaProps) {
  const { width: winW, height: winH } = useWindowDimensions();
  const scrollMaxH = Math.min(winH * 0.72, 640);

  const [ficha, setFicha] = useState<Ficha | null>(null);
  const [cargando, setCargando] = useState(false);
  const [salv, setSalv] = useState<Record<SalvacionKey, { sel: boolean; locked: boolean }>>(() =>
    Object.fromEntries(salvOrder.map(({ key }) => [key, { sel: false, locked: false }])) as Record<
      SalvacionKey,
      { sel: boolean; locked: boolean }
    >,
  );
  const [hab, setHab] = useState<Record<HabilidadKey, { sel: boolean; locked: boolean }>>(() =>
    Object.fromEntries(habOrder.map(({ key }) => [key, { sel: false, locked: false }])) as Record<
      HabilidadKey,
      { sel: boolean; locked: boolean }
    >,
  );
  const [atk, setAtk] = useState<AtkRow[]>([
    { nombre: "", stat: "Fuerza", comp: false },
    { nombre: "", stat: "Fuerza", comp: false },
    { nombre: "", stat: "Fuerza", comp: false },
  ]);
  const [logTiradas, setLogTiradas] = useState<TiradaResultado[]>([]);
  const [pgActualStr, setPgActualStr] = useState("0");
  const [popupTirada, setPopupTirada] = useState<TiradaResultado | null>(null);

  const recargarFicha = useCallback(async () => {
    if (!personaje) return;
    setCargando(true);
    try {
      const f = await CRUDobtenerFicha(personaje.id_per);
      setFicha(f);
    } finally {
      setCargando(false);
    }
  }, [personaje]);

  useEffect(() => {
    if (!visible || !personaje) return;
    setLogTiradas([]);
    recargarFicha();
  }, [visible, personaje, recargarFicha]);

  const mods = useMemo(() => (ficha ? buildMods(ficha) : null), [ficha]);
  const nivel = personaje?.nivel ?? 1;
  const bonifComp = useMemo(() => bonificadorCompetencia(nivel), [nivel]);
  const tinte = useMemo(() => tintePorClase(ficha?.clase ?? "Principiante"), [ficha?.clase]);

  useEffect(() => {
    if (!ficha || !mods) return;
    const { salv: sKeys, hab: hKeys } = keysCompetenciaClase(ficha.clase);
    const nextSalv = Object.fromEntries(
      salvOrder.map(({ key }) => [
        key,
        sKeys.includes(key) ? { sel: true, locked: true } : { sel: false, locked: false },
      ]),
    ) as Record<SalvacionKey, { sel: boolean; locked: boolean }>;
    const nextHab = Object.fromEntries(
      habOrder.map(({ key }) => [
        key,
        hKeys.includes(key) ? { sel: true, locked: true } : { sel: false, locked: false },
      ]),
    ) as Record<HabilidadKey, { sel: boolean; locked: boolean }>;
    setSalv(nextSalv);
    setHab(nextHab);

    const maxPg = calcularPG(ficha.clase, nivel, mods.con);
    setPgActualStr(String(maxPg));
  }, [ficha, mods, nivel]);

  const pgMax = useMemo(() => {
    if (!ficha || !mods) return 0;
    return calcularPG(ficha.clase, nivel, mods.con);
  }, [ficha, mods, nivel]);

  const bonoSalv = (key: SalvacionKey) => {
    if (!mods) return 0;
    const m = mods[modPorSalv[key]];
    const s = salv[key];
    return m + (s.sel ? bonifComp : 0);
  };

  const bonoHab = (key: HabilidadKey) => {
    if (!mods) return 0;
    const m = mods[modPorHab[key]];
    const s = hab[key];
    return m + (s.sel ? bonifComp : 0);
  };

  const bonoAtaque = (i: number) => {
    if (!mods || !ficha) return 0;
    const row = atk[i];
    const m = getModPorStat(row.stat, mods);
    return m + (row.comp ? bonifComp : 0);
  };

  const pushTirada = (nombre: string, bono: number) => {
    const t = calcularTirada(nombre, bono);
    setPopupTirada(t);
    setLogTiradas((prev) => [...prev, t]);
  };

  if (!personaje) return null;

  const avatarUri = dataUriFromStoredBase64(personaje.imagen_base64);
  const avatarSrc = avatarUri ? { uri: avatarUri } : require("../assets/Icon_usuario.png");

  const statBox = (titulo: string, mod: number, val: number, nombreTirada: string) => (
    <View style={styles.statBox}>
      <Text style={styles.statTitulo} numberOfLines={2}>
        {titulo}
      </Text>
      <Pressable onPress={() => pushTirada(nombreTirada, mod)} hitSlop={6}>
        <Text style={styles.statMod}>{formatMod(mod)}</Text>
      </Pressable>
      <Text style={styles.statVal}>{val}</Text>
    </View>
  );

  return (
    <>
    <Modal visible={visible} animationType="slide" transparent onRequestClose={cerrar}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.sheet,
            {
              maxWidth: Math.min(520, winW - 20),
              maxHeight: winH * 0.9,
              borderLeftColor: tinte.accent,
              borderBottomColor: tinte.accent,
            },
          ]}
        >
          <View style={[styles.headerBand, { borderBottomColor: tinte.accent }]}>
            <Image
              source={avatarSrc}
              style={[styles.avatar, { marginRight: 14 }]}
              contentFit="cover"
              transition={120}
              cachePolicy="memory-disk"
            />
            <View style={styles.headerTextCol}>
              <Text style={styles.headerNombre} numberOfLines={2}>
                {personaje.nombre_per}
              </Text>
              <Text style={styles.headerMeta}>
                {ficha ? `${ficha.clase} · Nv. ${nivel}` : `Sin ficha · Nv. ${nivel}`}
              </Text>
              <Text style={styles.headerMetaSm}>Jugador: {personaje.jugador_padre ?? "—"}</Text>
            </View>
          </View>

          {cargando ? (
            <Text style={styles.cargandoTxt}>Cargando ficha…</Text>
          ) : null}

          <ScrollView
            style={{ maxHeight: scrollMaxH }}
            contentContainerStyle={[
              styles.scrollContent,
              ficha ? { backgroundColor: tinte.fondoTarjeta } : null,
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator
          >
            {!ficha && !cargando ? (
              <Text style={styles.aviso}>
                No hay ficha en el servidor para este personaje.
              </Text>
            ) : null}

            {ficha && mods ? (
              <>
                <SectionTitle accent={tinte.accent}>CARACTERÍSTICAS</SectionTitle>
                <View style={styles.statRow}>
                  {statBox("FUERZA", mods.fue, ficha.fuerza, "Fuerza")}
                  {statBox("DESTREZA", mods.des, ficha.destreza, "Destreza")}
                  {statBox("CONSTITUCIÓN", mods.con, ficha.constitucion, "Constitución")}
                </View>
                <View style={styles.statRow}>
                  {statBox("INTELIGENCIA", mods.intel, ficha.inteligencia, "Inteligencia")}
                  {statBox("SABIDURÍA", mods.sab, ficha.sabiduria, "Sabiduría")}
                  {statBox("CARISMA", mods.car, ficha.carisma, "Carisma")}
                </View>

                <SectionTitle accent={tinte.accent}>COMBATE</SectionTitle>
                <View style={styles.combateGrid}>
                  <View style={styles.combCell}>
                    <Text style={styles.combLabel}>CA</Text>
                    <Text style={styles.combVal}>{10 + mods.des}</Text>
                  </View>
                  <Pressable style={styles.combCell} onPress={() => pushTirada("Iniciativa", mods.des)}>
                    <Text style={styles.combLabel}>Iniciativa</Text>
                    <Text style={styles.combVal}>{formatMod(mods.des)}</Text>
                  </Pressable>
                  <View style={styles.combCell}>
                    <Text style={styles.combLabel}>Velocidad</Text>
                    <Text style={styles.combValSm}>30 ft</Text>
                  </View>
                  <View style={styles.combCell}>
                    <Text style={styles.combLabel}>Bonif. comp.</Text>
                    <Text style={styles.combVal}>{formatMod(bonifComp)}</Text>
                  </View>
                </View>

                <View style={styles.pgRow}>
                  <View style={styles.pgCard}>
                    <Text style={styles.pgLabel}>Puntos de golpe</Text>
                    <View style={styles.pgInner}>
                      <TextInput
                        style={styles.pgInput}
                        keyboardType="number-pad"
                        value={pgActualStr}
                        onChangeText={(t) => setPgActualStr(t.replace(/[^0-9]/g, ""))}
                        onEndEditing={() => {
                          const n = parseInt(pgActualStr, 10);
                          if (Number.isNaN(n) || n < 0) {
                            setPgActualStr("0");
                            return;
                          }
                          if (n > pgMax) {
                            Alert.alert("PG", `El máximo es ${pgMax}`);
                            setPgActualStr(String(pgMax));
                          }
                        }}
                      />
                      <Text style={styles.pgSlash}>/</Text>
                      <Text style={styles.pgMax}>{pgMax}</Text>
                    </View>
                  </View>
                  <View style={[styles.pgCard, styles.pgCardNarrow]}>
                    <Text style={styles.pgLabel}>Percepción pasiva</Text>
                    <Text style={styles.percVal}>{10 + mods.sab}</Text>
                  </View>
                </View>

                <SectionTitle accent={tinte.accent}>TIRADAS DE SALVACIÓN</SectionTitle>
                <View style={styles.listPanel}>
                  {salvOrder.map(({ key, label }, idx) => (
                    <View
                      key={key}
                      style={[styles.listRow, idx % 2 === 0 ? styles.listRowAlt : null]}
                    >
                      <View style={styles.chkWrap}>
                        <BouncyCheckbox
                          size={22}
                          fillColor={TEMA.rojo}
                          unFillColor={TEMA.cremaClaro}
                          innerIconStyle={{ borderWidth: 2 }}
                          text=""
                          disabled={salv[key].locked}
                          isChecked={salv[key].sel}
                          onPress={(checked: boolean) => {
                            if (salv[key].locked) return;
                            setSalv((p) => ({ ...p, [key]: { ...p[key], sel: checked } }));
                          }}
                        />
                      </View>
                      <Pressable
                        style={styles.listMid}
                        onPress={() => pushTirada(`Salvación ${label}`, bonoSalv(key))}
                      >
                        <Text style={styles.listLabelText}>Salvación · {label}</Text>
                      </Pressable>
                      <Pressable
                        style={styles.listBonoWrap}
                        onPress={() => pushTirada(`Salvación ${label}`, bonoSalv(key))}
                      >
                        <Text style={styles.listBono}>{formatMod(bonoSalv(key))}</Text>
                      </Pressable>
                    </View>
                  ))}
                </View>

                <SectionTitle accent={tinte.accent}>HABILIDADES</SectionTitle>
                <View style={styles.listPanel}>
                  {habOrder.map(({ key, label }, idx) => (
                    <View
                      key={key}
                      style={[styles.listRow, idx % 2 === 0 ? styles.listRowAlt : null]}
                    >
                      <View style={styles.chkWrap}>
                        <BouncyCheckbox
                          size={22}
                          fillColor={TEMA.rojo}
                          unFillColor={TEMA.cremaClaro}
                          innerIconStyle={{ borderWidth: 2 }}
                          text=""
                          disabled={hab[key].locked}
                          isChecked={hab[key].sel}
                          onPress={(checked: boolean) => {
                            if (hab[key].locked) return;
                            setHab((p) => ({ ...p, [key]: { ...p[key], sel: checked } }));
                          }}
                        />
                      </View>
                      <Pressable
                        style={styles.listMid}
                        onPress={() => pushTirada(label.split(" (")[0], bonoHab(key))}
                      >
                        <Text style={styles.listLabelText}>{label}</Text>
                      </Pressable>
                      <Pressable
                        style={styles.listBonoWrap}
                        onPress={() => pushTirada(label.split(" (")[0], bonoHab(key))}
                      >
                        <Text style={styles.listBono}>{formatMod(bonoHab(key))}</Text>
                      </Pressable>
                    </View>
                  ))}
                </View>

                <SectionTitle accent={tinte.accent}>ATAQUES</SectionTitle>
                {atk.map((row, i) => (
                  <View key={i} style={styles.atkCard}>
                    <TextInput
                      style={styles.atkNombre}
                      placeholder={`Nombre del ataque ${i + 1}`}
                      placeholderTextColor="#9a8a78"
                      value={row.nombre}
                      onChangeText={(t) =>
                        setAtk((prev) => prev.map((r, j) => (j === i ? { ...r, nombre: t } : r)))
                      }
                    />
                    <View style={styles.atkRow2}>
                      <View style={[styles.atkPickBox, { marginRight: 8 }]}>
                        <Picker
                          selectedValue={row.stat}
                          style={styles.atkPick}
                          itemStyle={{ fontSize: 15 }}
                          onValueChange={(v) =>
                            setAtk((prev) =>
                              prev.map((r, j) => (j === i ? { ...r, stat: String(v) } : r)),
                            )
                          }
                        >
                          {STATS.map((s) => (
                            <Picker.Item key={s} label={s} value={s} />
                          ))}
                        </Picker>
                      </View>
                      <View style={[styles.atkComp, { marginRight: 8 }]}>
                        <Text style={styles.atkCompLbl}>Comp.</Text>
                        <BouncyCheckbox
                          size={22}
                          fillColor={TEMA.rojo}
                          unFillColor={TEMA.cremaClaro}
                          innerIconStyle={{ borderWidth: 2 }}
                          text=""
                          isChecked={row.comp}
                          onPress={(checked: boolean) =>
                            setAtk((prev) =>
                              prev.map((r, j) => (j === i ? { ...r, comp: checked } : r)),
                            )
                          }
                        />
                      </View>
                      <Pressable
                        style={styles.atkBonoBtn}
                        onPress={() =>
                          pushTirada(row.nombre.trim() || `Ataque ${i + 1}`, bonoAtaque(i))
                        }
                      >
                        <Text style={styles.atkBonoTxt}>{formatMod(bonoAtaque(i))}</Text>
                      </Pressable>
                    </View>
                  </View>
                ))}

                <SectionTitle accent={tinte.accent}>REGISTRO DE TIRADAS</SectionTitle>
                <View style={styles.regBox}>
                  <View style={styles.regHead}>
                    <Text style={styles.regHint}>2d20 · totales en color</Text>
                    <Pressable style={styles.btnLimpiar} onPress={() => setLogTiradas([])}>
                      <Text style={styles.btnLimpiarTxt}>Limpiar</Text>
                    </Pressable>
                  </View>
                  <ScrollView style={styles.regScroll} nestedScrollEnabled>
                    {logTiradas.map((tir, idx) => (
                      <LineaRegistroTirada key={`${tir.nombre}-${idx}-${tir.t1}-${tir.t2}`} t={tir} />
                    ))}
                  </ScrollView>
                </View>
              </>
            ) : null}

            <Pressable style={styles.btnCerrar} onPress={cerrar}>
              <Text style={styles.btnCerrarTxt}>Cerrar</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>

    <Modal
      visible={popupTirada != null}
      transparent
      animationType="fade"
      onRequestClose={() => setPopupTirada(null)}
    >
      <View style={styles.rollWrap}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setPopupTirada(null)} />
        <View style={styles.rollCard}>
          {popupTirada ? (
            <>
              <Text style={styles.rollTitulo}>{popupTirada.nombre}</Text>
              <View style={styles.rollDosFilas}>
                <View style={styles.rollFilaCompact}>
                  <Text
                    style={[
                      styles.rollDNat,
                      { color: colorPorD20Natural(popupTirada.d1) },
                    ]}
                  >
                    {popupTirada.d1}
                  </Text>
                  <Text style={styles.rollMid}>
                    {" "}
                    {formatMod(popupTirada.bono)} ={" "}
                  </Text>
                  <Text
                    style={[
                      styles.rollTot,
                      { color: colorPorD20Natural(popupTirada.d1) },
                    ]}
                  >
                    {popupTirada.t1}
                  </Text>
                </View>
                <View style={styles.rollFilaCompact}>
                  <Text
                    style={[
                      styles.rollDNat,
                      { color: colorPorD20Natural(popupTirada.d2) },
                    ]}
                  >
                    {popupTirada.d2}
                  </Text>
                  <Text style={styles.rollMid}>
                    {" "}
                    {formatMod(popupTirada.bono)} ={" "}
                  </Text>
                  <Text
                    style={[
                      styles.rollTot,
                      { color: colorPorD20Natural(popupTirada.d2) },
                    ]}
                  >
                    {popupTirada.t2}
                  </Text>
                </View>
              </View>
              <Pressable style={styles.rollBtnOk} onPress={() => setPopupTirada(null)}>
                <Text style={styles.rollBtnOkTxt}>OK</Text>
              </Pressable>
            </>
          ) : null}
        </View>
      </View>
    </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: TEMA.overlay,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  sheet: {
    width: "100%",
    maxHeight: "92%",
    backgroundColor: TEMA.cremaClaro,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: TEMA.negro,
    borderLeftWidth: 6,
    borderBottomWidth: 4,
    elevation: 8,
    shadowColor: TEMA.negro,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  headerBand: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: TEMA.negro,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 4,
    borderBottomColor: TEMA.rojo,
  },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 14,
    borderWidth: 3,
    borderColor: TEMA.crema,
    backgroundColor: TEMA.negroElevado,
  },
  headerTextCol: { flex: 1, minWidth: 0 },
  headerNombre: {
    fontSize: 22,
    fontWeight: "800",
    color: TEMA.textoCrema,
    marginBottom: 4,
  },
  headerMeta: { fontSize: 16, color: TEMA.crema, fontWeight: "600" },
  headerMetaSm: { fontSize: 13, color: TEMA.cremaPanel, marginTop: 4 },
  cargandoTxt: { textAlign: "center", padding: 10, color: TEMA.rojoOscuro },
  scrollContent: { paddingHorizontal: 14, paddingBottom: 24 },
  aviso: {
    color: TEMA.rojoOscuro,
    textAlign: "center",
    marginVertical: 12,
    padding: 12,
    backgroundColor: TEMA.cremaClaro,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: TEMA.rojo,
  },
  sectionBar: {
    backgroundColor: TEMA.negro,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 18,
    marginBottom: 10,
    borderLeftWidth: 5,
    borderLeftColor: TEMA.rojo,
  },
  sectionBarText: {
    color: TEMA.textoCrema,
    fontWeight: "800",
    fontSize: 13,
    letterSpacing: 0.6,
  },
  statRow: {
    flexDirection: "row",
    marginBottom: 8,
    justifyContent: "space-between",
  },
  statBox: {
    flex: 1,
    minWidth: 88,
    minHeight: 102,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: TEMA.cremaClaro,
    borderWidth: 2,
    borderColor: TEMA.negro,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 4,
    marginHorizontal: 2,
  },
  statTitulo: {
    fontSize: 10,
    fontWeight: "800",
    color: TEMA.rojoOscuro,
    textAlign: "center",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  statMod: { fontSize: 20, fontWeight: "800", color: TEMA.negro },
  statVal: { fontSize: 18, fontWeight: "700", color: TEMA.textoSecundario, marginTop: 2 },
  combateGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  combCell: {
    width: "48%",
    backgroundColor: TEMA.cremaClaro,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: TEMA.negro,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  combLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: TEMA.rojoOscuro,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  combVal: { fontSize: 22, fontWeight: "800", color: TEMA.negro },
  combValSm: { fontSize: 17, fontWeight: "700", color: TEMA.negro, marginTop: 2 },
  pgRow: { flexDirection: "row", marginBottom: 4 },
  pgCard: {
    flex: 1,
    marginRight: 6,
    backgroundColor: TEMA.cremaClaro,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: TEMA.negro,
    padding: 12,
  },
  pgCardNarrow: { flex: 0, minWidth: 120, alignItems: "center", marginRight: 0 },
  pgLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: TEMA.rojoOscuro,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  pgInner: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
  pgInput: {
    minWidth: 52,
    borderWidth: 2,
    borderColor: TEMA.negro,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: TEMA.cremaClaro,
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    color: TEMA.negro,
  },
  pgSlash: { fontSize: 22, fontWeight: "700", marginHorizontal: 8, color: TEMA.rojoOscuro },
  pgMax: { fontSize: 22, fontWeight: "800", color: TEMA.negro },
  percVal: { fontSize: 28, fontWeight: "800", color: TEMA.negro },
  listPanel: {
    borderRadius: 10,
    borderWidth: 2,
    borderColor: TEMA.negro,
    overflow: "hidden",
    backgroundColor: TEMA.cremaClaro,
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    minHeight: 48,
    width: "100%",
  },
  listRowAlt: { backgroundColor: TEMA.cremaPanel },
  chkWrap: {
    width: 44,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  listMid: {
    flex: 1,
    minWidth: 0,
    marginLeft: 4,
    justifyContent: "center",
    paddingVertical: 2,
  },
  listLabelText: {
    fontSize: 14,
    lineHeight: 20,
    color: TEMA.negro,
    fontWeight: "600",
  },
  listBonoWrap: {
    width: 52,
    flexShrink: 0,
    alignItems: "flex-end",
    justifyContent: "center",
    paddingLeft: 4,
  },
  listBono: { textAlign: "right", fontWeight: "800", fontSize: 15, color: TEMA.negro },
  atkCard: {
    backgroundColor: TEMA.cremaClaro,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: TEMA.negro,
    padding: 10,
    marginBottom: 10,
  },
  atkNombre: {
    borderWidth: 2,
    borderColor: TEMA.negro,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 15,
    color: TEMA.negro,
    marginBottom: 10,
    backgroundColor: TEMA.cremaClaro,
  },
  atkRow2: { flexDirection: "row", alignItems: "center", flexWrap: "wrap" },
  atkPickBox: {
    flex: 1,
    minWidth: 140,
    borderWidth: 2,
    borderColor: TEMA.negro,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: TEMA.cremaClaro,
  },
  atkPick: { height: 48 },
  atkComp: { flexDirection: "row", alignItems: "center", gap: 6 },
  atkCompLbl: { fontSize: 12, fontWeight: "700", color: TEMA.rojoOscuro },
  atkBonoBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: TEMA.cremaPanel,
    borderRadius: 8,
    minWidth: 52,
    alignItems: "center",
    borderWidth: 2,
    borderColor: TEMA.negro,
  },
  atkBonoTxt: { fontWeight: "900", fontSize: 16, color: TEMA.negro },
  regBox: {
    borderWidth: 2,
    borderColor: TEMA.negro,
    borderRadius: 10,
    backgroundColor: TEMA.cremaClaro,
    padding: 10,
    maxHeight: 200,
  },
  regHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  regHint: { flex: 1, fontSize: 11, color: TEMA.rojoOscuro },
  btnLimpiar: {
    backgroundColor: TEMA.negro,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: TEMA.rojo,
  },
  btnLimpiarTxt: { fontWeight: "800", color: TEMA.textoCrema, fontSize: 12 },
  regScroll: { maxHeight: 120 },
  regLineBase: { fontSize: 12, color: TEMA.negro, marginVertical: 4, lineHeight: 20 },
  regTotal: { fontSize: 12, fontWeight: "800" },
  btnCerrar: {
    marginTop: 20,
    alignSelf: "stretch",
    backgroundColor: TEMA.rojo,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 2,
    borderColor: TEMA.negro,
  },
  btnCerrarTxt: { color: TEMA.textoCrema, fontWeight: "800", fontSize: 16 },
  rollWrap: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  rollCard: {
    width: "100%",
    maxWidth: 280,
    zIndex: 2,
    backgroundColor: TEMA.cremaClaro,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderWidth: 2,
    borderColor: TEMA.negro,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  rollTitulo: {
    fontSize: 16,
    fontWeight: "800",
    color: TEMA.negro,
    textAlign: "center",
    marginBottom: 14,
  },
  rollDosFilas: { marginBottom: 14 },
  rollFilaCompact: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  rollDNat: {
    fontSize: 34,
    fontWeight: "900",
    minWidth: 44,
    textAlign: "right",
  },
  rollMid: { fontSize: 15, color: TEMA.textoSecundario, fontWeight: "600" },
  rollTot: { fontSize: 26, fontWeight: "900" },
  rollBtnOk: {
    backgroundColor: TEMA.rojo,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 2,
    borderColor: TEMA.negro,
  },
  rollBtnOkTxt: { color: TEMA.textoCrema, fontWeight: "800", fontSize: 15 },
});
