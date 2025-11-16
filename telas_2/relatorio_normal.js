import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useRelatorio } from "../contexts/RelatorioContext";

export default function RelatorioNormal() {
  const navigation = useNavigation();
  const { resumoSemana } = useRelatorio();

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

    base +=
      "Mantenha a consistência para continuar evoluindo nas próximas semanas.";
    return base;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={require("../assets_icons/arrow_icon.png")}
              style={styles.backIcon}
            />
          </TouchableOpacity>
          <Text style={styles.headerText}>Relatório da semana</Text>
        </View>

        <View style={styles.weekRow}>
          <View>
            <Text style={styles.weekTitle}>Semana {semanaNumero}</Text>
            <Text style={styles.weekSubtitle}>{intervaloLabel}</Text>
          </View>
          <View style={styles.yearPill}>
            <Text style={styles.yearText}>{ano}</Text>
          </View>
        </View>

        <View style={styles.chartCard}>
          <View style={styles.chartInner}>
            {[0, 1, 2, 3, 4].map((i) => (
              <View
                key={i}
                style={[styles.chartLine, { top: 8 + i * 28 }]}
              />
            ))}

            <View style={styles.chartBarsRow}>
              {dias.map((d) => (
                <View key={d.label} style={styles.chartDay}>
                  <View style={styles.barsWrapper}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: alturaBarra(d.sessoes),
                          backgroundColor: "#ff005c",
                        },
                      ]}
                    />
                    <View
                      style={[
                        styles.bar,
                        {
                          height: alturaBarra(d.tarefas),
                          backgroundColor: "#ff6aa5",
                        },
                      ]}
                    />
                    <View
                      style={[
                        styles.bar,
                        {
                          height: alturaBarra(d.artigos),
                          backgroundColor: "#111827",
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.dayLabel}>{d.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.totalCard}>
          <Text style={styles.totalNumber}>{totalAtividades}</Text>
          <Text style={styles.totalLabel}>atividades realizadas na semana</Text>
        </View>

        <View style={styles.legendCard}>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: "#ff005c" }]}
            />
            <Text style={styles.legendText}>
              Você realizou {totalSessoes} sessão(ões) nessa semana.
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: "#ff6aa5" }]}
            />
            <Text style={styles.legendText}>
              Você concluiu {totalTarefas} tarefa(s) nessa semana.
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: "#111827" }]}
            />
            <Text style={styles.legendText}>
              Você leu {totalArtigos} artigo(s) nessa semana.
            </Text>
          </View>
        </View>

        <View style={styles.textBlock}>
          <Text style={styles.textParagraph}>{textoResumo()}</Text>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f6f6",
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
    tintColor: "#0F172A",
    marginRight: 10,
  },
  headerText: {
    fontSize: 20,
    color: "#0F172A",
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
    color: "#0F172A",
    fontWeight: "600",
  },
  weekSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },
  yearPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#d4d4d4",
    backgroundColor: "#ffffff",
  },
  yearText: {
    fontSize: 13,
    color: "#4B5563",
    fontWeight: "500",
  },
  chartCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e6e6e6",
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
    borderBottomColor: "#e5e7eb",
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
    color: "#6B7280",
    fontWeight: "600",
  },
  totalCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e6e6e6",
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  totalNumber: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  totalLabel: {
    fontSize: 13,
    color: "#6B7280",
  },
  legendCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e6e6e6",
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
    color: "#4B5563",
    flex: 1,
  },
  textBlock: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e6e6e6",
    padding: 18,
  },
  textParagraph: {
    fontSize: 13,
    color: "#4B5563",
    lineHeight: 20,
  },
});
