import { useNavigation } from "@react-navigation/native";
import { useMemo, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRelatorio } from "../contexts/RelatorioContext";
import { useAppTheme } from "../contexts/ThemeContext";

const { width } = Dimensions.get("window");

function SemanaChartCard({ semana, tituloExtra, colors }) {
  const { isDark } = useAppTheme(); // << ADICIONADO
  const s = styles(colors);

  const dias = useMemo(
    () => (semana && Array.isArray(semana.dias) ? semana.dias : []),
    [semana]
  );

  const maxValorBarra = useMemo(() => {
    let m = 0;
    dias.forEach((d) => {
      m = Math.max(m, d.sessoes || 0, d.tarefas || 0, d.artigos || 0);
    });
    return m || 1;
  }, [dias]);

  function alturaBarra(v) {
    if (!v || v <= 0) return 4;
    const MAX = 80;
    const MIN = 14;
    return MIN + (v / maxValorBarra) * (MAX - MIN);
  }

  if (!semana) return null;

  const { semanaNumero, intervaloLabel, ano, totals = {} } = semana;

  return (
    <View style={s.compareCard}>
      <View style={s.weekRow}>
        <View>
          <Text style={s.weekTitle}>
            Semana {semanaNumero}
            {tituloExtra ? ` • ${tituloExtra}` : ""}
          </Text>
          <Text style={s.weekSubtitle}>{intervaloLabel}</Text>
        </View>

        <View style={s.yearPill}>
          <Text style={s.yearText}>{ano}</Text>
        </View>
      </View>

      <View style={s.chartCard}>
        <View style={s.chartInner}>
          {[0, 1, 2, 3, 4].map((i) => (
            <View key={i} style={[s.chartLine, { top: 8 + i * 28 }]} />
          ))}

          <View style={s.chartBarsRow}>
            {dias.map((d) => (
              <View key={d.label} style={s.chartDay}>
                <View style={s.barsWrapper}>

                  {/* ROSA PRINCIPAL */}
                  <View
                    style={[
                      s.bar,
                      { height: alturaBarra(d.sessoes), backgroundColor: colors.accent },
                    ]}
                  />

                  {/* ROSA SUAVE */}
                  <View
                    style={[
                      s.bar,
                      { height: alturaBarra(d.tarefas), backgroundColor: colors.accentSoft },
                    ]}
                  />

                  {/* ARTIGOS – AGORA BRANCO NO TEMA ESCURO */}
                  <View
                    style={[
                      s.bar,
                      {
                        height: alturaBarra(d.artigos),
                        backgroundColor: isDark ? colors.textPrimary : "#111827",
                      },
                    ]}
                  />
                </View>

                <Text style={s.dayLabel}>{d.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={s.totalCardSmall}>
        <Text style={s.totalNumber}>{totals.totalGeral || 0}</Text>
        <Text style={s.totalLabel}>atividades realizadas</Text>
      </View>

      <View style={s.legendCardSmall}>
        <View style={s.legendItem}>
          <View style={[s.legendDot, { backgroundColor: colors.accent }]} />
          <Text style={s.legendText}>
            Você realizou {totals.sessoes || 0} sessão(ões) nessa semana.
          </Text>
        </View>

        <View style={s.legendItem}>
          <View style={[s.legendDot, { backgroundColor: colors.accentSoft }]} />
          <Text style={s.legendText}>
            Você concluiu {totals.tarefas || 0} tarefa(s) nessa semana.
          </Text>
        </View>

        <View style={s.legendItem}>
          <View
            style={[
              s.legendDot,
              { backgroundColor: isDark ? colors.textPrimary : "#111827" },
            ]}
          />
          <Text style={s.legendText}>
            Você leu {totals.artigos || 0} artigo(s) nessa semana.
          </Text>
        </View>
      </View>

    </View>
  );
}

const MESES = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
];

export default function RelatorioComparar() {
  const navigation = useNavigation();
  const { historicoSemanas } = useRelatorio();
  const { colors } = useAppTheme();
  const s = styles(colors);

  const semanasDisponiveis = Array.isArray(historicoSemanas)
    ? historicoSemanas
    : [];

  const [primeiroMesIndex] = useState(new Date().getMonth());
  const [semana1Id, setSemana1Id] = useState(null);
  const [semana2Id, setSemana2Id] = useState(null);

  const semanasFiltradasMes = useMemo(() => {
    return semanasDisponiveis.filter((wk) => {
      if (!wk.weekStartISO) return true;
      const dt = new Date(wk.weekStartISO);
      return dt.getMonth() === primeiroMesIndex;
    });
  }, [semanasDisponiveis, primeiroMesIndex]);

  const semana1 = semanasDisponiveis.find((w) => w.id === semana1Id) || null;
  const semana2 = semanasDisponiveis.find((w) => w.id === semana2Id) || null;

  const textoComparacao = useMemo(() => {
    if (!semana1 || !semana2) return "";

    const t1 = semana1.totals || {};
    const t2 = semana2.totals || {};

    const dif = (a, b) => (a || 0) - (b || 0);

    const lines = [];

    const dt = dif(t1.tarefas, t2.tarefas);
    const ds = dif(t1.sessoes, t2.sessoes);
    const da = dif(t1.artigos, t2.artigos);

    lines.push(
      dt > 0
        ? `Na primeira semana você realizou ${dt} tarefa(s) a mais que na segunda.`
        : dt < 0
        ? `Na segunda semana você realizou ${Math.abs(dt)} tarefa(s) a mais que na primeira.`
        : "Você realizou a mesma quantidade de tarefas nas duas semanas."
    );

    lines.push(
      ds > 0
        ? `Na primeira semana você realizou ${ds} sessão(ões) a mais.`
        : ds < 0
        ? `Na segunda semana você realizou ${Math.abs(ds)} sessão(ões) a mais.`
        : "Você realizou a mesma quantidade de sessões nas duas semanas."
    );

    lines.push(
      da > 0
        ? `Na primeira semana você leu ${da} artigo(s) a mais.`
        : da < 0
        ? `Na segunda semana você leu ${Math.abs(da)} artigo(s) a mais.`
        : "Você leu a mesma quantidade de artigos nas duas semanas."
    );

    return lines.join("\n");
  }, [semana1, semana2]);

  const temDuasSemanas = semanasDisponiveis.length >= 2;

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={require("../assets_icons/arrow_icon.png")}
              style={s.backIcon}
            />
          </TouchableOpacity>
          <Text style={s.headerText}>Comparar relatórios</Text>
        </View>

        {!temDuasSemanas ? (
          <View style={s.emptyBox}>
            <Text style={s.emptyTitle}>Ainda não há dados suficientes</Text>
            <Text style={s.emptyText}>
              Você precisa de pelo menos duas semanas completas registradas para comparar relatórios.
            </Text>
          </View>
        ) : (
          <>
            <View style={s.monthSelectBox}>
              <Text style={s.monthLabel}>Selecionar primeiro mês</Text>
              <View style={s.monthFakeSelect}>
                <Text style={s.monthValue}>{MESES[primeiroMesIndex]}</Text>
              </View>
            </View>

            {semanasFiltradasMes.map((wk, index) => {
              const sel1 = wk.id === semana1Id;
              const sel2 = wk.id === semana2Id;
              const selected = sel1 || sel2;

              return (
                <View key={wk.id || index} style={s.weekSelectCard}>
                  <View>
                    <Text style={s.weekSelectTitle}>Semana {wk.semanaNumero}</Text>
                    <Text style={s.weekSelectSubtitle}>{wk.intervaloLabel}</Text>
                  </View>

                  <TouchableOpacity
                    style={[s.selectButton, selected && s.selectButtonSelected]}
                    onPress={() => {
                      if (!semana1Id) setSemana1Id(wk.id);
                      else if (!semana2Id && wk.id !== semana1Id) setSemana2Id(wk.id);
                      else if (wk.id === semana1Id) setSemana1Id(null);
                      else if (wk.id === semana2Id) setSemana2Id(null);
                    }}
                  >
                    <Text
                      style={[
                        s.selectButtonText,
                        selected && s.selectButtonTextSelected,
                      ]}
                    >
                      {sel1 ? "1ª escolhida" : sel2 ? "2ª escolhida" : "Selecionar"}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}

            {semana1 && semana2 && (
              <>
                <SemanaChartCard semana={semana1} tituloExtra="Primeira semana" colors={colors} />
                <SemanaChartCard semana={semana2} tituloExtra="Segunda semana" colors={colors} />

                <View style={s.textBlock}>
                  {textoComparacao.split("\n").map((linha, idx) => (
                    <Text key={idx} style={s.textParagraph}>
                      • {linha}
                    </Text>
                  ))}
                </View>
              </>
            )}

            <TouchableOpacity
              style={[
                s.bottomButton,
                !(semana1 && semana2) && s.bottomButtonDisabled,
              ]}
              disabled={!(semana1 && semana2)}
            >
              <Text style={s.bottomButtonText}>Comparar relatórios</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scroll: {
      paddingHorizontal: 24,
      paddingBottom: 40,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 50,
      marginBottom: 22,
    },
    backIcon: {
      width: 36,
      height: 36,
      tintColor: colors.icon,
      marginRight: 10,
    },
    headerText: {
      fontSize: 20,
      color: colors.textTitle,
      fontFamily: "Poppins_700Bold",
    },

    emptyBox: {
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 18,
      marginTop: 10,
    },
    emptyTitle: {
      fontSize: 16,
      color: colors.textTitle,
      fontFamily: "Poppins_700Bold",
      marginBottom: 6,
    },
    emptyText: {
      fontSize: 13,
      color: colors.textBody,
      lineHeight: 20,
      fontFamily: "Poppins_400Regular",
    },

    monthSelectBox: { marginBottom: 16 },
    monthLabel: {
      fontSize: 13,
      color: colors.textSecondary,
      marginBottom: 6,
    },
    monthFakeSelect: {
      height: 40,
      borderRadius: 10,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: "center",
      paddingHorizontal: 12,
    },
    monthValue: {
      fontSize: 14,
      color: colors.textBody,
    },

    weekSelectCard: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 16,
      paddingVertical: 14,
      marginBottom: 12,
    },
    weekSelectTitle: {
      fontSize: 15,
      color: colors.textTitle,
      fontFamily: "Poppins_600SemiBold",
    },
    weekSelectSubtitle: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    selectButton: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 10,
      backgroundColor: colors.input,
    },
    selectButtonSelected: {
      backgroundColor: colors.accent,
    },
    selectButtonText: {
      fontSize: 12,
      color: colors.textBody,
    },
    selectButtonTextSelected: {
      color: colors.accentText,
    },

    compareCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 16,
      paddingVertical: 18,
      marginTop: 18,
      marginBottom: 4,
    },
    weekRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    weekTitle: {
      fontSize: 18,
      color: colors.textTitle,
      fontFamily: "Poppins_600SemiBold",
    },
    weekSubtitle: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 4,
    },
    yearPill: {
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.softBorder,
      backgroundColor: colors.cardElevated,
    },
    yearText: {
      fontSize: 13,
      color: colors.textBody,
    },

    chartCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      marginBottom: 14,
    },
    chartInner: {
      height: 170,
      justifyContent: "flex-end",
      position: "relative",
    },
    chartLine: {
      position: "absolute",
      left: 0,
      right: 0,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
      opacity: 0.35,
    },
    chartBarsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      height: 130,
      paddingHorizontal: 4,
    },
    chartDay: {
      alignItems: "center",
      width: 40,
    },
    barsWrapper: {
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "center",
      height: 100,
    },
    bar: {
      width: 8,
      borderRadius: 999,
      marginHorizontal: 3,
    },
    dayLabel: {
      marginTop: 6,
      fontSize: 11,
      color: colors.textSecondary,
    },

    totalCardSmall: {
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 12,
      alignItems: "center",
      marginBottom: 10,
    },
    totalNumber: {
      fontSize: 24,
      color: colors.textTitle,
      fontFamily: "Poppins_700Bold",
    },
    totalLabel: {
      fontSize: 12,
      color: colors.textSecondary,
    },

    legendCardSmall: {
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 10,
      paddingHorizontal: 14,
    },
    legendItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 6,
    },
    legendDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginRight: 8,
    },
    legendText: {
      fontSize: 12,
      color: colors.textBody,
    },

    textBlock: {
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 18,
      marginTop: 18,
    },
    textParagraph: {
      fontSize: 13,
      color: colors.textBody,
      lineHeight: 20,
      marginBottom: 4,
    },

    bottomButton: {
      marginTop: 22,
      backgroundColor: colors.accent,
      paddingVertical: 12,
      borderRadius: 999,
      alignItems: "center",
    },
    bottomButtonDisabled: { opacity: 0.45 },
    bottomButtonText: {
      color: colors.accentText,
      fontSize: 15,
      fontFamily: "Poppins_700Bold",
    },
  });
