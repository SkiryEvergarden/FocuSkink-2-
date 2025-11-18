import {
  Poppins_400Regular,
  Poppins_700Bold,
  useFonts
} from "@expo-google-fonts/poppins";
import { useNavigation } from "@react-navigation/native";
import { useMemo, useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";
import arrowIcon from "../../assets_icons/arrow_icon.png";
import { useTarefas } from "../../contexts/TarefasContext";
import { useAppTheme } from "../../contexts/ThemeContext";

LocaleConfig.locales["pt-br"] = {
  monthNames: [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ],
  monthNamesShort: [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez"
  ],
  dayNames: [
    "Domingo", "Segunda-feira", "Terça-feira",
    "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"
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
  if (d.getFullYear() !== yyyy || d.getMonth() !== mm - 1 || d.getDate() !== dd) return null;
  return startOfDay(d);
};

const formatISO = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
};

const sameDay = (a, b) => startOfDay(a).getTime() === startOfDay(b).getTime();

export default function HistoricoTarefa() {
  const navigation = useNavigation();
  const { colors } = useAppTheme();
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
        dotColor: colors.accent
      };
    });

    marks[monthSelectedISO] = {
      ...(marks[monthSelectedISO] || {}),
      selected: true,
      selectedColor: colors.accent,
      marked: marks[monthSelectedISO]?.marked || false
    };

    return marks;
  }, [todasTarefas, monthSelectedISO, colors]);

  const tarefasDoDia = useMemo(() => {
    const [y, m, d] = monthSelectedISO.split("-").map(Number);
    const sel = startOfDay(new Date(y, m - 1, d));

    return todasTarefas.filter((t) => {
      const dt = parseDDMMYYYY(t.concluirAte);
      if (!dt) return false;
      return sameDay(dt, sel);
    });
  }, [todasTarefas, monthSelectedISO]);

  const styles = useMemo(() => makeStyles(colors), [colors]);

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  const CardTarefa = ({ item }) => (
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
              backgroundColor: colors.card,
              calendarBackground: colors.card,
              dayTextColor: colors.textPrimary,
              monthTextColor: colors.textPrimary,
              textDisabledColor: colors.textMuted,
              arrowColor: colors.accent,
              todayTextColor: colors.accent,
              textSectionTitleColor: colors.textSecondary,
              selectedDayBackgroundColor: colors.accent,
              selectedDayTextColor: colors.accentText
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
            <CardTarefa key={t.id || Math.random().toString()} item={t} />
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

function makeStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background
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
      tintColor: colors.icon,
      marginRight: 10
    },
    headerTitle: {
      fontSize: 18,
      fontFamily: "Poppins_700Bold",
      color: colors.textTitle
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: 40
    },
    calendarCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 10,
      marginTop: 6,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border
    },
    emptyBox: {
      backgroundColor: colors.input,
      borderRadius: 12,
      padding: 18,
      alignItems: "center",
      marginTop: 10,
      borderWidth: 1,
      borderColor: colors.border
    },
    emptyText: {
      color: colors.textBody,
      fontFamily: "Poppins_400Regular",
      fontSize: 13
    },
    card: {
      backgroundColor: colors.input,
      borderRadius: 16,
      padding: 16,
      marginTop: 12,
      borderWidth: 1,
      borderColor: colors.softBorder
    },
    cardHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between"
    },
    cardTitle: {
      color: colors.textTitle,
      fontSize: 16,
      fontFamily: "Poppins_700Bold",
      maxWidth: "70%"
    },
    badge: {
      backgroundColor: colors.badgeBg,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 10
    },
    badgeText: {
      color: colors.textSecondary,
      fontSize: 12,
      fontFamily: "Poppins_400Regular"
    },
    cardDesc: {
      color: colors.textBody,
      fontSize: 13,
      fontFamily: "Poppins_400Regular",
      marginTop: 10
    },
    cardDue: {
      color: colors.textSecondary,
      fontSize: 12,
      fontFamily: "Poppins_400Regular",
      marginTop: 8
    },
    detailOverlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 24
    },
    detailBox: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      width: "100%",
      borderWidth: 1,
      borderColor: colors.border
    },
    detailTitle: {
      color: colors.textTitle,
      fontSize: 18,
      fontFamily: "Poppins_700Bold",
      marginBottom: 8
    },
    detailDesc: {
      color: colors.textBody,
      fontSize: 14,
      fontFamily: "Poppins_400Regular",
      marginBottom: 10
    },
    detailDate: {
      color: colors.textSecondary,
      fontSize: 13,
      fontFamily: "Poppins_400Regular",
      marginBottom: 6
    },
    detailStatus: {
      color: colors.textBody,
      fontSize: 13,
      fontFamily: "Poppins_400Regular",
      marginBottom: 18
    },
    detailClose: {
      color: colors.accent,
      fontFamily: "Poppins_700Bold",
      textAlign: "center",
      marginTop: 10,
      fontSize: 15
    }
  });
}
