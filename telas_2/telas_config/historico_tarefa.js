import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal
} from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { useNavigation } from "@react-navigation/native";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_700Bold
} from "@expo-google-fonts/poppins";
import { useTarefas } from "../../contexts/TarefasContext";
import arrowIcon from "../../assets_icons/arrow_icon.png";

LocaleConfig.locales["pt-br"] = {
  monthNames: [
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
    "Dezembro"
  ],
  monthNamesShort: [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez"
  ],
  dayNames: [
    "Domingo",
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado"
  ],
  dayNamesShort: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
  today: "Hoje"
};
LocaleConfig.defaultLocale = "pt-br";

const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const today = () => startOfDay(new Date());

const parseDDMMYYYY = (s) => {
  const [dd, mm, yyyy] = (s || "").split("/").map(Number);
  if (!dd || !mm || !yyyy) return null;
  const d = new Date(yyyy, mm - 1, dd);
  if (
    d.getFullYear() !== yyyy ||
    d.getMonth() !== mm - 1 ||
    d.getDate() !== dd
  ) {
    return null;
  }
  return startOfDay(d);
};

const formatISO = (d) => {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const dd = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${dd}`;
};

const sameDay = (a, b) => startOfDay(a).getTime() === startOfDay(b).getTime();

export default function HistoricoTarefa() {
  const navigation = useNavigation();
  const { tarefas, historicoTarefas } = useTarefas();

  const [monthSelectedISO, setMonthSelectedISO] = useState(formatISO(today()));
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold
  });

  const todasTarefas = useMemo(() => {
    if (Array.isArray(historicoTarefas)) return historicoTarefas;
    if (Array.isArray(tarefas)) return tarefas;
    return [];
  }, [historicoTarefas, tarefas]);

  const calendarMarks = useMemo(() => {
    const marks = {};

    todasTarefas.forEach((t) => {
      const d = parseDDMMYYYY(t.concluirAte);
      if (!d) return;
      const key = formatISO(d);

      marks[key] = {
        ...(marks[key] || {}),
        marked: true,
        dotColor: "#ff005c"
      };
    });

    marks[monthSelectedISO] = {
      ...(marks[monthSelectedISO] || {}),
      selected: true,
      selectedColor: "#ff005c",
      marked: marks[monthSelectedISO]?.marked || false
    };

    return marks;
  }, [todasTarefas, monthSelectedISO]);

  const tarefasDoDia = useMemo(() => {
    const [y, m, d] = monthSelectedISO.split("-").map(Number);
    const selDate = startOfDay(new Date(y, m - 1, d));

    return todasTarefas.filter((t) => {
      const dt = parseDDMMYYYY(t.concluirAte);
      if (!dt) return false;
      return sameDay(dt, selDate);
    });
  }, [todasTarefas, monthSelectedISO]);

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: "#f6f6f6" }} />;
  }

  const CardTarefaHistorico = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => {
        setSelectedTask(item);
        setDetailVisible(true);
      }}
    >
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.titulo || "(Sem título)"}
          </Text>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {item.apagada
                ? "Apagada"
                : item.concluida
                ? "Concluída"
                : "Em aberto"}
            </Text>
          </View>
        </View>

        {!!item.descricao && (
          <Text style={styles.cardDesc} numberOfLines={3}>
            {item.descricao}
          </Text>
        )}

        {item.concluirAte ? (
          <Text style={styles.cardDue}>Até {item.concluirAte}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={arrowIcon} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Histórico de tarefas</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.calendarCard}>
          <Calendar
            monthFormat={"MMMM yyyy"}
            onDayPress={(day) => setMonthSelectedISO(day.dateString)}
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

        {tarefasDoDia.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              Nenhuma tarefa registrada nesse dia.
            </Text>
          </View>
        ) : (
          tarefasDoDia.map((t) => (
            <CardTarefaHistorico
              key={t.id || Math.random().toString()}
              item={t}
            />
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal
        transparent
        visible={detailVisible && !!selectedTask}
        animationType="fade"
        onRequestClose={() => setDetailVisible(false)}
      >
        <View style={styles.detailOverlay}>
          <View style={styles.detailBox}>
            <Text style={styles.detailTitle}>
              {selectedTask?.titulo || "(Sem título)"}
            </Text>

            {!!selectedTask?.descricao && (
              <Text style={styles.detailDesc}>{selectedTask.descricao}</Text>
            )}

            {selectedTask?.concluirAte ? (
              <Text style={styles.detailDate}>
                Até {selectedTask.concluirAte}
              </Text>
            ) : null}

            <Text style={styles.detailStatus}>
              {selectedTask?.apagada
                ? "Status: Apagada"
                : selectedTask?.concluida
                ? "Status: Concluída"
                : "Status: Em aberto"}
            </Text>

            <TouchableOpacity
              onPress={() => {
                setDetailVisible(false);
                setSelectedTask(null);
              }}
            >
              <Text style={styles.detailClose}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#e6e6e6"
  },
  emptyText: {
    color: "#4B5563",
    fontFamily: "Poppins_400Regular",
    fontSize: 13
  },

  card: {
    backgroundColor: "#ededed",
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#cfcfcf"
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  cardTitle: {
    color: "#0F172A",
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    maxWidth: "70%"
  },
  badge: {
    backgroundColor: "#e6e6e6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10
  },
  badgeText: {
    color: "#374151",
    fontSize: 12,
    fontFamily: "Poppins_400Regular"
  },
  cardDesc: {
    color: "#4B5563",
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    marginTop: 10
  },
  cardDue: {
    color: "#6B7280",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    marginTop: 8
  },

  detailOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24
  },
  detailBox: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    borderWidth: 1,
    borderColor: "#e6e6e6"
  },
  detailTitle: {
    color: "#0F172A",
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    marginBottom: 8
  },
  detailDesc: {
    color: "#374151",
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    marginBottom: 10
  },
  detailDate: {
    color: "#6B7280",
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    marginBottom: 6
  },
  detailStatus: {
    color: "#4B5563",
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    marginBottom: 18
  },
  detailClose: {
    color: "#ff005c",
    fontFamily: "Poppins_700Bold",
    textAlign: "center",
    marginTop: 10,
    fontSize: 15
  }
});
