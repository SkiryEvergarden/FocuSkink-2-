import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_700Bold
} from "@expo-google-fonts/poppins";
import { Calendar, LocaleConfig } from "react-native-calendars";
import * as SplashScreen from "expo-splash-screen";

import { useSessao } from "../../contexts/SessaoContext";
import arrowIcon from "../../assets_icons/arrow_icon.png";

LocaleConfig.locales["pt-br"] = {
  monthNames: [
    "janeiro",
    "fevereiro",
    "março",
    "abril",
    "maio",
    "junho",
    "julho",
    "agosto",
    "setembro",
    "outubro",
    "novembro",
    "dezembro"
  ],
  monthNamesShort: [
    "jan",
    "fev",
    "mar",
    "abr",
    "mai",
    "jun",
    "jul",
    "ago",
    "set",
    "out",
    "nov",
    "dez"
  ],
  dayNames: [
    "domingo",
    "segunda-feira",
    "terça-feira",
    "quarta-feira",
    "quinta-feira",
    "sexta-feira",
    "sábado"
  ],
  dayNamesShort: ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"],
  today: "Hoje"
};
LocaleConfig.defaultLocale = "pt-br";

const startOfDayLocal = (dLike) => {
  const d = new Date(dLike);
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setHours(0, 0, 0, 0);
  return x;
};
const toLocalDateKey = (dLike) => {
  if (!dLike) return null;
  const d = new Date(dLike);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
};
const todayISO = toLocalDateKey(new Date());

const getStartISO = (s) =>
  s?.inicioEm || s?.startedAtISO || s?.inicioISO || s?.startAtISO || null;
const getEndISO = (s) => s?.fimEm || s?.endedAtISO || s?.endAtISO || null;

const getSessionLocalKey = (s) => {
  const end = getEndISO(s);
  if (end) return toLocalDateKey(end);
  const start = getStartISO(s);
  if (start) return toLocalDateKey(start);
  return null;
};

function fmtDur(sec) {
  const s = Math.max(0, Number(sec) || 0);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  const mm = String(m).padStart(2, "0");
  const sss = String(ss).padStart(2, "0");
  return h > 0 ? `${h}h${mm}m` : `${m}m${sss}s`;
}

function getElapsedSec(s) {
  const direct =
    s?.duracaoAtivaSec ??
    s?.duracaoSec ??
    s?.elapsedSec ??
    s?.elapsedSecs ??
    s?.tempoPermanenciaSec ??
    s?.tempoAtivoSec ??
    null;

  if (Number.isFinite(direct) && direct >= 0) return direct;

  const endISO = getEndISO(s);
  const startISO = getStartISO(s);
  if (endISO && startISO) {
    const end = new Date(endISO).getTime();
    const start = new Date(startISO).getTime();
    if (Number.isFinite(end) && Number.isFinite(start) && end >= start) {
      return Math.floor((end - start) / 1000);
    }
  }
  return 0;
}

function getHasTask(s) {
  if (typeof s?.tarefaInclusa === "boolean") return s.tarefaInclusa;
  if (typeof s?.temTarefa === "boolean") return s.temTarefa;
  return Boolean(s?.tarefaSelecionada || s?.tarefa);
}

function getMusicFlag(s) {
  if (typeof s?.musicaAtiva === "boolean") return s.musicaAtiva;
  return Boolean(s?.musicQueue?.length);
}

function getMethodName(s) {
  if (s?.tipoSessao) return s.tipoSessao;
  if (s?.metodo === "pomodoro") return "Pomodoro";
  if (s?.metodo === "deepwork") return "Deepwork";
  return "Sessão";
}

SplashScreen.preventAutoHideAsync();

export default function HistoricoSessao() {
  const navigation = useNavigation();
  const { historicoSessoes = [] } = useSessao();

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold
  });

  const [selectedISO, setSelectedISO] = useState(todayISO);

  const calendarMarks = useMemo(() => {
    const marks = {};
    (historicoSessoes || []).forEach((s) => {
      const key = getSessionLocalKey(s);
      if (key) {
        marks[key] = {
          ...(marks[key] || {}),
          marked: true,
          dotColor: "#ff005c"
        };
      }
    });
    marks[selectedISO] = {
      ...(marks[selectedISO] || {}),
      selected: true,
      selectedColor: "#ff005c",
      marked: marks[selectedISO]?.marked || false
    };
    return marks;
  }, [historicoSessoes, selectedISO]);

  const sessoesDoDia = useMemo(() => {
    return (historicoSessoes || [])
      .filter((s) => getSessionLocalKey(s) === selectedISO)
      .sort((a, b) => {
        const bt = new Date(getEndISO(b) || getStartISO(b) || 0).getTime();
        const at = new Date(getEndISO(a) || getStartISO(a) || 0).getTime();
        return bt - at;
      });
  }, [historicoSessoes, selectedISO]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: "#f6f6f6" }} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={arrowIcon} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Histórico de sessões</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.calendarCard}>
          <Calendar
            monthFormat={"MMMM yyyy"}
            onDayPress={(d) => setSelectedISO(d.dateString)}
            markedDates={calendarMarks}
            hideExtraDays={false}
            enableSwipeMonths
            theme={{
              backgroundColor: "#e4e4e4",
              calendarBackground: "#e4e4e4",
              dayTextColor: "#0F172A",
              monthTextColor: "#0F172A",
              textDisabledColor: "#9CA3AF",
              arrowColor: "#ff005c",
              todayTextColor: "#ff005c",
              textSectionTitleColor: "#6B7280",
              selectedDayBackgroundColor: "#ff005c",
              selectedDayTextColor: "#ffffff"
            }}
          />
        </View>

        {sessoesDoDia.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>
              Nenhuma sessão finalizada neste dia.
            </Text>
            <Text style={styles.emptyText}>
              Finalize uma sessão para ela aparecer aqui.
            </Text>
          </View>
        ) : (
          sessoesDoDia.map((s) => {
            const metodoStr = getMethodName(s);
            const titulo =
              (s?.nomeSessao && s.nomeSessao.trim()) || metodoStr;

            const resumo =
              s?.metodo === "pomodoro"
                ? `Estudo ${s?.estudoMin ?? 0}min • Descanso ${
                    s?.descansoMin ?? 0
                  }min • ${s?.ciclosTotais ?? 0} ciclos`
                : s?.metodo === "deepwork"
                ? `Foco contínuo previsto ${s?.horas ?? 0}h${String(
                    s?.minutos ?? 0
                  ).padStart(2, "0")}`
                : `Permanência ${fmtDur(getElapsedSec(s))}`;

            const flags = [
              getMusicFlag(s) ? "com música" : "sem música",
              s?.focoAtivo ? "modo foco" : "modo normal",
              getHasTask(s) ? "com tarefa" : "sem tarefa"
            ].join(" • ");

            const fim = getEndISO(s);
            const fimStr = fim
              ? new Date(fim).toLocaleString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })
              : "—";

            return (
              <View key={s.id} style={styles.card}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {titulo}
                  </Text>
                  <View style={styles.methodPill}>
                    <Text style={styles.methodText}>{metodoStr}</Text>
                  </View>
                </View>

                <Text style={styles.cardResumo}>{resumo}</Text>
                <Text style={styles.cardFlags}>{flags}</Text>
                <Text style={styles.cardData}>Finalizada em {fimStr}</Text>

                <View style={styles.permBox}>
                  <Text style={styles.permLabel}>Tempo de permanência</Text>
                  <Text style={styles.permValue}>
                    {fmtDur(getElapsedSec(s))}
                  </Text>
                </View>
              </View>
            );
          })
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f6f6"
  },

  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center"
  },
  backIcon: {
    width: 36,
    height: 36,
    tintColor: "#0F172A",
    marginRight: 10
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    color: "#0F172A"
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40
  },

  calendarCard: {
    backgroundColor: "#e4e4e4",
    borderRadius: 16,
    padding: 10,
    marginTop: 6,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e6e6e6"
  },

  emptyBox: {
    backgroundColor: "#ededed",
    borderRadius: 14,
    padding: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#e6e6e6"
  },
  emptyTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 15,
    color: "#0F172A",
    marginBottom: 6
  },
  emptyText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: "#4B5563",
    lineHeight: 18
  },

  card: {
    backgroundColor: "#ededed",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#cfcfcf"
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
    alignItems: "center"
  },
  cardTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 15,
    color: "#0F172A",
    maxWidth: "70%"
  },
  methodPill: {
    backgroundColor: "#e6e6e6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10
  },
  methodText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: "#374151"
  },
  cardResumo: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: "#4B5563",
    marginBottom: 6
  },
  cardFlags: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 6
  },
  cardData: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: "#9CA3AF"
  },

  permBox: {
    marginTop: 10,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e6e6e6"
  },
  permLabel: {
    color: "#6B7280",
    fontFamily: "Poppins_400Regular",
    fontSize: 12
  },
  permValue: {
    color: "#ff005c",
    fontFamily: "Poppins_700Bold",
    fontSize: 14
  }
});
