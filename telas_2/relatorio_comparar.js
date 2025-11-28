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
  const { isDark } = useAppTheme();
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

                  {/* SESSÕES */}
                  <View
                    style={[
                      s.bar,
                      { height: alturaBarra(d.sessoes), backgroundColor: colors.accent },
                    ]}
                  />

                  {/* TAREFAS */}
                  <View
                    style={[
                      s.bar,
                      {
                        height: alturaBarra(d.tarefas),
                        backgroundColor: colors.accentSoft,
                      },
                    ]}
                  />

                  {/* ARTIGOS */}
                  <View
                    style={[
                      s.bar,
                      {
                        height: alturaBarra(d.artigos),
                        backgroundColor: isDark
                          ? colors.textPrimary
                          : "#111827",
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
            Você realizou {totals.sessoes || 0} sessão(ões).
          </Text>
        </View>

        <View style={s.legendItem}>
          <View
            style={[s.legendDot, { backgroundColor: colors.accentSoft }]}
          />
          <Text style={s.legendText}>
            Você concluiu {totals.tarefas || 0} tarefa(s).
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
            Você leu {totals.artigos || 0} artigo(s).
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function RelatorioComparar() {
  const navigation = useNavigation();
  const { historicoSemanas } = useRelatorio();
  const { colors } = useAppTheme();
  const s = styles(colors);

  const semanasDisponiveis = useMemo(
    () => (Array.isArray(historicoSemanas) ? historicoSemanas : []),
    [historicoSemanas]
  );

  const [semana1Id, setSemana1Id] = useState(null);
  const [semana2Id, setSemana2Id] = useState(null);
  const [mostrarComparacao, setMostrarComparacao] = useState(false);

  const semana1 = semanasDisponiveis.find((w) => w.id === semana1Id) || null;
  const semana2 = semanasDisponiveis.find((w) => w.id === semana2Id) || null;

  const temDuasSemanas = semanasDisponiveis.length >= 2;

  function selecionarSemana(id) {
    if (mostrarComparacao) return;

    if (semana1Id === id) return setSemana1Id(null);
    if (semana2Id === id) return setSemana2Id(null);

    if (!semana1Id) return setSemana1Id(id);
    if (!semana2Id && id !== semana1Id) return setSemana2Id(id);
  }

  const textoComparacao = useMemo(() => {
    if (!semana1 || !semana2) return "";

    const t1 = semana1.totals || {};
    const t2 = semana2.totals || {};

    const dif = (a, b) => (a || 0) - (b || 0);

    const dt = dif(t1.tarefas, t2.tarefas);
    const ds = dif(t1.sessoes, t2.sessoes);
    const da = dif(t1.artigos, t2.artigos);

    return [
      dt > 0
        ? `Na primeira semana você realizou ${dt} tarefa(s) a mais.`
        : dt < 0
        ? `Na segunda semana você realizou ${Math.abs(dt)} tarefa(s) a mais.`
        : "Você realizou a mesma quantidade de tarefas.",
      ds > 0
        ? `Na primeira semana você fez ${ds} sessão(ões) a mais.`
        : ds < 0
        ? `Na segunda semana você fez ${Math.abs(ds)} sessão(ões) a mais.`
        : "Você fez a mesma quantidade de sessões.",
      da > 0
        ? `Na primeira semana você leu ${da} artigo(s) a mais.`
        : da < 0
        ? `Na segunda semana você leu ${Math.abs(da)} artigo(s) a mais.`
        : "Você leu a mesma quantidade de artigos.",
    ].join("\n");
  }, [semana1, semana2]);

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.scroll}>
        
        {/* HEADER */}
        {!mostrarComparacao && (
          <View style={s.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Image
                source={require("../assets_icons/arrow_icon.png")}
                style={s.backIcon}
              />
            </TouchableOpacity>
            <Text style={s.headerText}>Comparar relatórios</Text>
          </View>
        )}

        {/* SE NÃO HÁ DUAS SEMANAS */}
        {!mostrarComparacao && !temDuasSemanas && (
          <View style={s.emptyBox}>
            <Text style={s.emptyTitle}>Ainda não há dados suficientes</Text>
            <Text style={s.emptyText}>
              Você precisa de pelo menos duas semanas completas para comparar.
            </Text>
          </View>
        )}

        {/* LISTAGEM DE RELATÓRIOS */}
        {!mostrarComparacao && temDuasSemanas && (
          <>
            <View style={s.monthSelectBox}>
              <Text style={s.monthLabel}>Relatórios feitos</Text>
              <View style={s.monthFakeSelect}>
                <Text style={s.monthValue}>Selecione duas semanas</Text>
              </View>
            </View>

            {semanasDisponiveis.map((wk) => {
              const sel1 = wk.id === semana1Id;
              const sel2 = wk.id === semana2Id;
              const selected = sel1 || sel2;

              return (
                <View key={wk.id} style={s.weekSelectCard}>
                  <View>
                    <Text style={s.weekSelectTitle}>
                      Semana {wk.semanaNumero}
                    </Text>
                    <Text style={s.weekSelectSubtitle}>{wk.intervaloLabel}</Text>
                  </View>

                  <TouchableOpacity
                    style={[s.selectButton, selected && s.selectButtonSelected]}
                    onPress={() => selecionarSemana(wk.id)}
                  >
                    <Text
                      style={[
                        s.selectButtonText,
                        selected && s.selectButtonTextSelected,
                      ]}
                    >
                      {sel1
                        ? "1ª escolhida"
                        : sel2
                        ? "2ª escolhida"
                        : "Selecionar"}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}

            <TouchableOpacity
              style={[
                s.bottomButton,
                !(semana1 && semana2) && s.bottomButtonDisabled,
              ]}
              disabled={!(semana1 && semana2)}
              onPress={() => setMostrarComparacao(true)}
            >
              <Text style={s.bottomButtonText}>Comparar relatórios</Text>
            </TouchableOpacity>
          </>
        )}

        {/* RESULTADO DA COMPARAÇÃO */}
        {mostrarComparacao && (
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

            <TouchableOpacity
              style={[s.bottomButton, { marginTop: 30 }]}
              onPress={() => {
                setMostrarComparacao(false);
                setSemana1Id(null);
                setSemana2Id(null);
              }}
            >
              <Text style={s.bottomButtonText}>Voltar</Text>
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
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
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
      padding: 18,
      marginTop: 18,
    },
    weekRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 12,
      alignItems: "center",
    },
    weekTitle: {
      fontSize: 18,
      color: colors.textTitle,
      fontFamily: "Poppins_600SemiBold",
    },
    weekSubtitle: {
      fontSize: 13,
      color: colors.textSecondary,
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

    chartCard: { marginBottom: 14 },
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
    },
    chartDay: {
      width: 40,
      alignItems: "center",
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
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
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
      padding: 14,
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
      padding: 18,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
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
    bottomButtonDisabled: {
      opacity: 0.4,
    },
    bottomButtonText: {
      fontSize: 15,
      color: colors.accentText,
      fontFamily: "Poppins_700Bold",
    },
  });
