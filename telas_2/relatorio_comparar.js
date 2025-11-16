import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useRelatorio } from "../contexts/RelatorioContext";

const { width } = Dimensions.get("window");

function SemanaChartCard({ semana, tituloExtra }) {
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
    const MAX_ALTURA = 80;
    const MIN_ALTURA = 14;
    return MIN_ALTURA + (v / maxValorBarra) * (MAX_ALTURA - MIN_ALTURA);
  }

  if (!semana) return null;

  const { semanaNumero, intervaloLabel, ano, totals = {} } = semana;
  const totalAtividades = totals.totalGeral || 0;
  const totalSessoes = totals.sessoes || 0;
  const totalTarefas = totals.tarefas || 0;
  const totalArtigos = totals.artigos || 0;

  return (
    <View style={styles.compareCard}>
      <View style={styles.weekRow}>
        <View>
          <Text style={styles.weekTitle}>
            Semana {semanaNumero}
            {tituloExtra ? ` • ${tituloExtra}` : ""}
          </Text>
          <Text style={styles.weekSubtitle}>{intervaloLabel}</Text>
        </View>
        <View style={styles.yearPill}>
          <Text style={styles.yearText}>{ano}</Text>
        </View>
      </View>

      <View style={styles.chartCard}>
        <View style={styles.chartInner}>
          {[0, 1, 2, 3, 4].map((i) => (
            <View key={i} style={[styles.chartLine, { top: 8 + i * 28 }]} />
          ))}

          <View style={styles.chartBarsRow}>
            {dias.map((d) => (
              <View key={d.label} style={styles.chartDay}>
                <View style={styles.barsWrapper}>
                  <View
                    style={[
                      styles.bar,
                      { height: alturaBarra(d.sessoes), backgroundColor: "#ff005c" },
                    ]}
                  />
                  <View
                    style={[
                      styles.bar,
                      { height: alturaBarra(d.tarefas), backgroundColor: "#ff6aa5" },
                    ]}
                  />
                  <View
                    style={[
                      styles.bar,
                      { height: alturaBarra(d.artigos), backgroundColor: "#111827" },
                    ]}
                  />
                </View>
                <Text style={styles.dayLabel}>{d.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.totalCardSmall}>
        <Text style={styles.totalNumber}>{totalAtividades}</Text>
        <Text style={styles.totalLabel}>atividades realizadas</Text>
      </View>

      <View style={styles.legendCardSmall}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#ff005c" }]} />
          <Text style={styles.legendText}>
            Você realizou {totalSessoes} sessão(ões) nessa semana.
          </Text>
        </View>

        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#ff6aa5" }]} />
          <Text style={styles.legendText}>
            Você concluiu {totalTarefas} tarefa(s) nessa semana.
          </Text>
        </View>

        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#111827" }]} />
          <Text style={styles.legendText}>
            Você leu {totalArtigos} artigo(s) nessa semana.
          </Text>
        </View>
      </View>
    </View>
  );
}

const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export default function RelatorioComparar() {
  const navigation = useNavigation();
  const { historicoSemanas } = useRelatorio();

  const semanasDisponiveis = useMemo(
    () => (Array.isArray(historicoSemanas) ? historicoSemanas : []),
    [historicoSemanas]
  );

  const [primeiroMesIndex, setPrimeiroMesIndex] = useState(
    new Date().getMonth()
  );
  const [semana1Id, setSemana1Id] = useState(null);
  const [semana2Id, setSemana2Id] = useState(null);

  const semanasFiltradasMes = useMemo(() => {
    return semanasDisponiveis.filter((wk) => {
      if (!wk.weekStartISO) return true;
      const dt = new Date(wk.weekStartISO);
      return dt.getMonth() === primeiroMesIndex;
    });
  }, [semanasDisponiveis, primeiroMesIndex]);

  const semana1 = useMemo(
    () => semanasDisponiveis.find((w) => w.id === semana1Id) || null,
    [semanasDisponiveis, semana1Id]
  );

  const semana2 = useMemo(
    () => semanasDisponiveis.find((w) => w.id === semana2Id) || null,
    [semanasDisponiveis, semana2Id]
  );

  const temDuasSemanas = semanasDisponiveis.length >= 2;

  const textoComparacao = useMemo(() => {
    if (!semana1 || !semana2) return "";

    const t1 = semana1.totals || {};
    const t2 = semana2.totals || {};

    const difTarefas = (t1.tarefas || 0) - (t2.tarefas || 0);
    const difSessoes = (t1.sessoes || 0) - (t2.sessoes || 0);
    const difArtigos = (t1.artigos || 0) - (t2.artigos || 0);

    const linhas = [];

    if (difTarefas > 0)
      linhas.push(`Na primeira semana você realizou ${difTarefas} tarefa(s) a mais que na segunda.`);
    else if (difTarefas < 0)
      linhas.push(`Na segunda semana você realizou ${Math.abs(difTarefas)} tarefa(s) a mais que na primeira.`);
    else linhas.push("Você realizou a mesma quantidade de tarefas nas duas semanas.");

    if (difSessoes > 0)
      linhas.push(`Na primeira semana você realizou ${difSessoes} sessão(ões) de foco a mais que na segunda.`);
    else if (difSessoes < 0)
      linhas.push(`Na segunda semana você realizou ${Math.abs(difSessoes)} sessão(ões) de foco a mais que na primeira.`);
    else linhas.push("Você realizou a mesma quantidade de sessões de foco nas duas semanas.");

    if (difArtigos > 0)
      linhas.push(`Na primeira semana você leu ${difArtigos} artigo(s) a mais que na segunda.`);
    else if (difArtigos < 0)
      linhas.push(`Na segunda semana você leu ${Math.abs(difArtigos)} artigo(s) a mais que na primeira.`);
    else linhas.push("Você leu a mesma quantidade de artigos nas duas semanas.");

    return linhas.join("\n");
  }, [semana1, semana2]);

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
          <Text style={styles.headerText}>Comparar relatórios</Text>
        </View>

        {!temDuasSemanas ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>Ainda não há dados suficientes</Text>
            <Text style={styles.emptyText}>
              Você precisa de pelo menos duas semanas completas registradas para
              poder comparar relatórios. Continue usando o app e volte depois
              para ver sua evolução.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.monthSelectBox}>
              <Text style={styles.monthLabel}>Selecionar primeiro mês</Text>
              <View style={styles.monthFakeSelect}>
                <Text style={styles.monthValue}>
                  {MESES[primeiroMesIndex] || "Mês"}
                </Text>
              </View>
            </View>

            {semanasFiltradasMes.map((wk, index) => {
              const selecionadaComo1 = wk.id === semana1Id;
              const selecionadaComo2 = wk.id === semana2Id;
              const selecionada = selecionadaComo1 || selecionadaComo2;

              return (
                <View key={wk.id || index} style={styles.weekSelectCard}>
                  <View>
                    <Text style={styles.weekSelectTitle}>
                      Semana {wk.semanaNumero}
                    </Text>
                    <Text style={styles.weekSelectSubtitle}>
                      {wk.intervaloLabel}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.selectButton,
                      selecionada && styles.selectButtonSelected,
                    ]}
                    onPress={() => {
                      if (!semana1Id) setSemana1Id(wk.id);
                      else if (!semana2Id && wk.id !== semana1Id) setSemana2Id(wk.id);
                      else if (wk.id === semana1Id) setSemana1Id(null);
                      else if (wk.id === semana2Id) setSemana2Id(null);
                    }}
                  >
                    <Text
                      style={[
                        styles.selectButtonText,
                        selecionada && styles.selectButtonTextSelected,
                      ]}
                    >
                      {selecionadaComo1
                        ? "1ª escolhida"
                        : selecionadaComo2
                        ? "2ª escolhida"
                        : "Selecionar"}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}

            {semana1 && semana2 && (
              <>
                <SemanaChartCard
                  semana={semana1}
                  tituloExtra="Primeira semana"
                />
                <SemanaChartCard
                  semana={semana2}
                  tituloExtra="Segunda semana"
                />

                <View style={styles.textBlock}>
                  {textoComparacao.split("\n").map((linha, idx) => (
                    <Text key={idx} style={styles.textParagraph}>
                      • {linha}
                    </Text>
                  ))}
                </View>
              </>
            )}

            <TouchableOpacity
              style={[
                styles.bottomButton,
                !(semana1 && semana2) && styles.bottomButtonDisabled,
              ]}
              disabled={!(semana1 && semana2)}
            >
              <Text style={styles.bottomButtonText}>Comparar relatórios</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={{ height: 40 }} />
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
  emptyBox: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e6e6e6",
    padding: 18,
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 16,
    color: "#0F172A",
    fontWeight: "700",
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    color: "#4B5563",
    lineHeight: 20,
  },
  monthSelectBox: {
    marginBottom: 16,
  },
  monthLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 6,
  },
  monthFakeSelect: {
    height: 40,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e6e6e6",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  monthValue: {
    fontSize: 14,
    color: "#4B5563",
  },
  weekSelectCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e6e6e6",
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
  },
  weekSelectTitle: {
    fontSize: 15,
    color: "#0F172A",
    fontWeight: "600",
  },
  weekSelectSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  selectButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
  },
  selectButtonSelected: {
    backgroundColor: "#ff005c",
  },
  selectButtonText: {
    fontSize: 12,
    color: "#4B5563",
    fontWeight: "600",
  },
  selectButtonTextSelected: {
    color: "#ffffff",
  },
  compareCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e6e6e6",
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
  totalCardSmall: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e6e6e6",
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  totalNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 2,
  },
  totalLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  legendCardSmall: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e6e6e6",
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
    color: "#4B5563",
    flex: 1,
  },
  textBlock: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e6e6e6",
    padding: 18,
    marginTop: 18,
  },
  textParagraph: {
    fontSize: 13,
    color: "#4B5563",
    lineHeight: 20,
    marginBottom: 4,
  },
  bottomButton: {
    marginTop: 22,
    backgroundColor: "#ff005c",
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
    marginHorizontal: 4,
  },
  bottomButtonDisabled: {
    opacity: 0.4,
  },
  bottomButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
});

