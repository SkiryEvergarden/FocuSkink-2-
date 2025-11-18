import { useNavigation } from "@react-navigation/native";
import { useMemo } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRelatorio } from "../contexts/RelatorioContext";
import { useAppTheme } from "../contexts/ThemeContext";

export default function RelatorioNormal() {
  const navigation = useNavigation();
  const { resumoSemana } = useRelatorio();
  const { colors, isDark } = useAppTheme();

  const {
    dias,
    totalAtividades,
    totalSessoes,
    totalTarefas,
    totalArtigos,
    intervaloLabel,
    semanaNumero,
    ano,
    diaDestaque,
  } = useMemo(() => {
    const r = resumoSemana || {};
    return {
      dias: r.dias || [],
      totalAtividades: r.totalAtividades || 0,
      totalSessoes: r.totalSessoes || 0,
      totalTarefas: r.totalTarefas || 0,
      totalArtigos: r.totalArtigos || 0,
      intervaloLabel: r.intervaloLabel || "",
      semanaNumero: r.semanaNumero || 1,
      ano: r.ano || new Date().getFullYear(),
      diaDestaque: r.diaDestaque || null,
    };
  }, [resumoSemana]);

  const maxValorBarra = useMemo(() => {
    let m = 0;
    dias.forEach((d) => {
      m = Math.max(m, d.sessoes || 0, d.tarefas || 0, d.artigos || 0);
    });
    return m || 1;
  }, [dias]);

  function alturaBarra(v) {
    if (!v || v <= 0) return 4;
    const MAX_ALTURA = 80;
    const MIN_ALTURA = 14;
    return MIN_ALTURA + (v / maxValorBarra) * (MAX_ALTURA - MIN_ALTURA);
  }

  function textoResumo() {
    if (!totalAtividades) {
      return (
        "Nesta semana ainda não registramos atividades. " +
        "À medida que você concluir tarefas, iniciar sessões e ler artigos, " +
        "este espaço vai mostrar um resumo do seu progresso."
      );
    }

    let base =
      `Nesta semana, você realizou ${totalSessoes} sessão(ões) de foco, ` +
      `concluiu ${totalTarefas} tarefa(s) e leu ${totalArtigos} artigo(s), ` +
      `totalizando ${totalAtividades} atividade(s) registradas. `;

    if (diaDestaque && diaDestaque.total > 0) {
      base += `O dia com mais atividades foi ${diaDestaque.label}, com ${diaDestaque.total} ação(ões). `;
    }

    base += "Mantenha a consistência para continuar evoluindo nas próximas semanas.";
    return base;
  }

  const s = styles(colors);

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image source={require("../assets_icons/arrow_icon.png")} style={s.backIcon} />
          </TouchableOpacity>
          <Text style={s.headerText}>Relatório da semana</Text>
        </View>

        <View style={s.weekRow}>
          <View>
            <Text style={s.weekTitle}>Semana {semanaNumero}</Text>
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
                    <View
                      style={[
                        s.bar,
                        { height: alturaBarra(d.sessoes), backgroundColor: "#ff005c" },
                      ]}
                    />
                    <View
                      style={[
                        s.bar,
                        { height: alturaBarra(d.tarefas), backgroundColor: "#ff6aa5" },
                      ]}
                    />
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

        <View style={s.totalCard}>
          <Text style={s.totalNumber}>{totalAtividades}</Text>
          <Text style={s.totalLabel}>atividades realizadas na semana</Text>
        </View>

        <View style={s.legendCard}>
          <View style={s.legendItem}>
            <View style={[s.legendDot, { backgroundColor: "#ff005c" }]} />
            <Text style={s.legendText}>
              Você realizou {totalSessoes} sessão(ões) nessa semana.
            </Text>
          </View>
          <View style={s.legendItem}>
            <View style={[s.legendDot, { backgroundColor: "#ff6aa5" }]} />
            <Text style={s.legendText}>
              Você concluiu {totalTarefas} tarefa(s) nessa semana.
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
              Você leu {totalArtigos} artigo(s) nessa semana.
            </Text>
          </View>
        </View>

        <View style={s.textBlock}>
          <Text style={s.textParagraph}>{textoResumo()}</Text>
        </View>

        <View style={{ height: 60 }} />
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
    weekRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 18,
    },
    weekTitle: {
      fontSize: 18,
      color: colors.textTitle,
      fontWeight: "600",
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
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    yearText: {
      fontSize: 13,
      color: colors.textBody,
      fontWeight: "500",
    },
    chartCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 16,
      paddingVertical: 18,
      marginBottom: 18,
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
      fontWeight: "600",
    },
    totalCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 18,
      paddingHorizontal: 20,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 18,
    },
    totalNumber: {
      fontSize: 28,
      fontWeight: "700",
      color: colors.textTitle,
      marginBottom: 4,
    },
    totalLabel: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    legendCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 14,
      paddingHorizontal: 16,
      marginBottom: 18,
    },
    legendItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
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
      flex: 1,
    },
    textBlock: {
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 18,
    },
    textParagraph: {
      fontSize: 13,
      color: colors.textBody,
      lineHeight: 20,
    },
  });
