import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Animated,
  Dimensions,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet as RNStyleSheet,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { useTarefas } from "../contexts/TarefasContext";

const { height } = Dimensions.get("window");

LocaleConfig.locales["pt"] = {
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
    "Dezembro",
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
    "Dez",
  ],
  dayNames: [
    "Domingo",
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
  ],
  dayNamesShort: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
  today: "Hoje",
};
LocaleConfig.defaultLocale = "pt";

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
  if (d.getFullYear() !== yyyy || d.getMonth() !== mm - 1 || d.getDate() !== dd)
    return null;
  return startOfDay(d);
};
const formatISO = (d) => {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const dd = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${dd}`;
};
const daysDiffFromToday = (d) => {
  const t0 = today().getTime();
  const t1 = startOfDay(d).getTime();
  return Math.floor((t1 - t0) / (1000 * 60 * 60 * 24));
};
const sameDay = (a, b) => startOfDay(a).getTime() === startOfDay(b).getTime();
const getNext7Days = () => {
  const base = today();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    return d;
  });
};

export default function Tela_Geren_Tarefas() {
  const navigation = useNavigation();
  const { tarefas, addTarefa, concluirTarefa, excluirTarefa } = useTarefas();

  const tabs = ["Atrasadas", "Diário", "Semanal", "Mensal", "Concluídas"];
  const [selectedTab, setSelectedTab] = useState("Diário");

  const [weekDays, setWeekDays] = useState(getNext7Days());
  const [weekSelectedDate, setWeekSelectedDate] = useState(weekDays[0]);

  const [monthSelectedISO, setMonthSelectedISO] = useState(formatISO(today()));

  const [modalVisible, setModalVisible] = useState(false);
  const modalOpacity = useRef(new Animated.Value(0)).current;
  const modalTranslateY = useRef(new Animated.Value(50)).current;

  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);

  const [titulo, setTitulo] = useState("");
  const [concluirAte, setConcluirAte] = useState("");
  const [descricao, setDescricao] = useState("");
  const [erroData, setErroData] = useState("");

  useEffect(() => {
    const id = setInterval(() => {
      const next = getNext7Days();
      setWeekDays(next);
      setWeekSelectedDate(next[0]);
    }, 60 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  function formatarData(texto) {
    const numeros = texto.replace(/\D/g, "");
    let x = numeros;
    if (numeros.length > 2 && numeros.length <= 4) {
      x = `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
    } else if (numeros.length > 4) {
      x = `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(
        4,
        8
      )}`;
    }
    setConcluirAte(x);
    if (erroData) validarData(x);
  }

  function validarData(texto) {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(texto)) {
      setErroData("Use o formato DD/MM/AAAA.");
      return false;
    }
    const d = parseDDMMYYYY(texto);
    if (!d) {
      setErroData("Data inválida.");
      return false;
    }
    const hoje = today();
    const max = new Date(hoje);
    max.setFullYear(max.getFullYear() + 3);
    if (d < hoje) {
      setErroData("A data não pode estar no passado.");
      return false;
    }
    if (d > max) {
      setErroData("A data não pode ultrapassar 3 anos.");
      return false;
    }
    setErroData("");
    return true;
  }

  function openModal() {
    setModalVisible(true);
    Animated.parallel([
      Animated.timing(modalOpacity, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.timing(modalTranslateY, {
        toValue: 0,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start();
  }

  function closeModal() {
    Animated.parallel([
      Animated.timing(modalOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(modalTranslateY, {
        toValue: 50,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false);
      setTitulo("");
      setConcluirAte("");
      setDescricao("");
      setErroData("");
    });
  }

  async function handleCreateTask() {
    const okTitulo = titulo.trim().length > 0;
    const okData = validarData(concluirAte);
    if (!okTitulo || !okData) return;

    try {
      await addTarefa({
        titulo: titulo.slice(0, 100),
        concluirAte,
        descricao: descricao.slice(0, 300),
      });
      closeModal();
    } catch (e) {
      console.log("Erro ao criar tarefa:", e);
    }
  }

  const basePorAba = useMemo(() => {
    const now = today();
    if (selectedTab === "Concluídas") {
      return tarefas.filter((t) => t.concluida);
    }
    if (selectedTab === "Atrasadas") {
      return tarefas.filter((t) => {
        if (t.concluida) return false;
        const d = parseDDMMYYYY(t.concluirAte);
        return d && d < now;
      });
    }
    return tarefas.filter((t) => {
      if (t.concluida) return false;
      const d = parseDDMMYYYY(t.concluirAte);
      if (!d) return false;
      if (d < now) return false;
      const diff = daysDiffFromToday(d);
      if (selectedTab === "Diário") return diff === 0;
      if (selectedTab === "Semanal") return diff >= 0 && diff <= 7;
      if (selectedTab === "Mensal") return diff >= 0;
      return false;
    });
  }, [tarefas, selectedTab]);

  const tarefasFiltradas = useMemo(() => {
    if (
      selectedTab === "Diário" ||
      selectedTab === "Concluídas" ||
      selectedTab === "Atrasadas"
    ) {
      return basePorAba;
    }
    if (selectedTab === "Semanal") {
      return basePorAba.filter((t) => {
        const d = parseDDMMYYYY(t.concluirAte);
        return d && sameDay(d, weekSelectedDate);
      });
    }
    if (selectedTab === "Mensal") {
      const [y, m, d] = monthSelectedISO.split("-").map(Number);
      const sel = startOfDay(new Date(y, m - 1, d));
      return basePorAba.filter((t) => {
        const dt = parseDDMMYYYY(t.concluirAte);
        return dt && sameDay(dt, sel);
      });
    }
    return basePorAba;
  }, [basePorAba, selectedTab, weekSelectedDate, monthSelectedISO]);

  const calendarMarks = useMemo(() => {
    const marks = {};
    tarefas.forEach((t) => {
      if (t.concluida) return;
      const d = parseDDMMYYYY(t.concluirAte);
      if (!d) return;
      if (d >= today()) {
        const key = formatISO(d);
        marks[key] = {
          ...(marks[key] || {}),
          marked: true,
          dotColor: "#ff005c",
        };
      }
    });
    marks[monthSelectedISO] = {
      ...(marks[monthSelectedISO] || {}),
      selected: true,
      selectedColor: "#ff005c",
      marked: marks[monthSelectedISO]?.marked || false,
    };
    return marks;
  }, [tarefas, monthSelectedISO]);

  const CardTarefa = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => {
        setSelectedTask(item);
        setDetailVisible(true);
      }}
    >
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.titulo}
          </Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {(() => {
                if (item.concluida) return "Concluída";
                const d = parseDDMMYYYY(item.concluirAte);
                if (!d) return "";
                if (d < today()) return "Atrasada";
                const diff = daysDiffFromToday(d);
                if (diff === 0) return "Diária";
                if (diff > 0 && diff <= 7) return "Semanal";
                return "Mensal";
              })()}
            </Text>
          </View>
        </View>

        {!!item.descricao && (
          <Text style={styles.cardDesc} numberOfLines={3}>
            {item.descricao}
          </Text>
        )}
        <Text style={styles.cardDue}>Até {item.concluirAte}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={require("../assets_icons/arrow_icon.png")}
            style={styles.backIcon}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={openModal} style={styles.addFab}>
          <Ionicons name="add" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.fixedTabs}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsRow}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabChip,
                selectedTab === tab && styles.tabChipActive,
              ]}
              onPress={() => setSelectedTab(tab)}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTab === tab && styles.tabTextActive,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {selectedTab === "Semanal" && (
        <View style={styles.weekRow}>
          {weekDays.map((d, i) => {
            const isSelected = sameDay(d, weekSelectedDate);
            const weekday = d
              .toLocaleDateString("pt-BR", { weekday: "short" })
              .replace(".", "");
            return (
              <TouchableOpacity
                key={i}
                style={styles.dayWrapper}
                onPress={() => setWeekSelectedDate(d)}
                activeOpacity={0.9}
              >
                <Text style={styles.dayLabel}>{weekday}</Text>
                <View
                  style={[
                    styles.dayBox,
                    isSelected && {
                      backgroundColor: "#ff005c",
                      borderColor: "#ff005c",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      isSelected && { color: "#ffffff" },
                    ]}
                  >
                    {`${d.getDate()}`.padStart(2, "0")}
                  </Text>
                </View>
                {isSelected && <View style={styles.selectedLine} />}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {selectedTab === "Mensal" && (
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
              selectedDayTextColor: "#ffffff",
            }}
          />
        </View>
      )}

      <FlatList
        data={tarefasFiltradas}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => <CardTarefa item={item} />}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              Nenhuma tarefa para este período.
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      />

      {modalVisible && (
        <Animated.View
          style={[styles.modalOverlay, { opacity: modalOpacity }]}
        >
          <BlurView
            intensity={40}
            tint="light"
            style={RNStyleSheet.absoluteFill}
          />
          <TouchableWithoutFeedback onPress={closeModal}>
            <View style={RNStyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={[styles.modalWrapper, { justifyContent: "flex-end" }]}
            keyboardVerticalOffset={20}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <Animated.ScrollView
                contentContainerStyle={[
                  styles.modalContent,
                  {
                    transform: [{ translateY: modalTranslateY }],
                    marginBottom: height * 0.12,
                  },
                ]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={closeModal}>
                    <Image
                      source={require("../assets_icons/arrow_icon.png")}
                      style={styles.backIcon}
                    />
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>Criar nova tarefa</Text>
                </View>

                <TextInput
                  placeholder="Título (até 100)"
                  placeholderTextColor="#6B7280"
                  style={styles.input}
                  value={titulo}
                  onChangeText={(t) => setTitulo(t.slice(0, 100))}
                />
                <Text style={styles.counter}>{titulo.length}/100</Text>

                <TextInput
                  placeholder="Data (DD/MM/AAAA)"
                  placeholderTextColor="#6B7280"
                  keyboardType="numeric"
                  style={[styles.input, erroData ? styles.inputError : null]}
                  value={concluirAte}
                  onChangeText={formatarData}
                  onBlur={() => concluirAte && validarData(concluirAte)}
                  maxLength={10}
                />
                {!!erroData && (
                  <Text style={styles.errorText}>{erroData}</Text>
                )}

                <TextInput
                  placeholder="Descrição (até 300)"
                  placeholderTextColor="#6B7280"
                  multiline
                  numberOfLines={4}
                  style={[styles.input, styles.textArea]}
                  value={descricao}
                  onChangeText={(t) => setDescricao(t.slice(0, 300))}
                />
                <Text style={styles.counter}>{descricao.length}/300</Text>

                <TouchableOpacity
                  style={styles.createButton}
                  onPress={handleCreateTask}
                >
                  <LinearGradient
                    colors={["#ff2b6b", "#ff005c"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.createButtonInner}
                  >
                    <Text style={styles.createButtonText}>Criar tarefa</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.ScrollView>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </Animated.View>
      )}

      {detailVisible && selectedTask && (
        <View style={styles.detailOverlay}>
          <BlurView
            intensity={60}
            tint="light"
            style={RNStyleSheet.absoluteFill}
          />
          <TouchableWithoutFeedback onPress={() => setDetailVisible(false)}>
            <View style={RNStyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>

          <View style={styles.detailBox}>
            {!selectedTask.concluida ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <TouchableOpacity
                  onPress={() => setDetailVisible(false)}
                  style={styles.arrowBtn}
                >
                  <Ionicons name="chevron-back" size={20} color="#ff005c" />
                </TouchableOpacity>
                <Text style={styles.detailTitle} numberOfLines={1}>
                  {selectedTask.titulo}
                </Text>
              </View>
            ) : (
              <Text style={styles.detailTitle}>{selectedTask.titulo}</Text>
            )}

            {!!selectedTask.descricao && (
              <Text style={styles.detailDesc}>{selectedTask.descricao}</Text>
            )}
            <Text style={styles.detailDate}>
              Até {selectedTask.concluirAte}
            </Text>

            {selectedTab !== "Concluídas" && !selectedTask.concluida && (
              <>
                <TouchableOpacity
                  style={[styles.detailButton, { backgroundColor: "#ff005c" }]}
                  onPress={() => setConfirmVisible(true)}
                >
                  <Text style={styles.detailButtonTextPrimary}>
                    Concluir
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.detailButton, { backgroundColor: "#e3e3e3" }]}
                  onPress={() => setDeleteVisible(true)}
                >
                  <Text style={styles.detailButtonTextSecondary}>Apagar</Text>
                </TouchableOpacity>
              </>
            )}

            {selectedTask.concluida && (
              <TouchableOpacity onPress={() => setDetailVisible(false)}>
                <Text style={styles.detailClose}>Fechar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {confirmVisible && (
        <View style={styles.confirmOverlay}>
          <BlurView
            intensity={70}
            tint="light"
            style={styles.confirmBlur}
          />
          <TouchableWithoutFeedback
            onPress={() => setConfirmVisible(false)}
          >
            <View style={RNStyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>

          <View style={styles.confirmBox}>
            <Text style={styles.confirmTitle}>
              Você deseja concluir a tarefa?
            </Text>
            <Text style={styles.confirmText}>
              Essa confirmação ajuda a manter seu progresso atualizado e os
              relatórios mais precisos.
            </Text>
            <TouchableOpacity
              style={[
                styles.confirmButton,
                { backgroundColor: "#ff005c" },
              ]}
              onPress={async () => {
                if (selectedTask) {
                  try {
                    await concluirTarefa(selectedTask.id);
                  } catch (e) {
                    console.log("Erro ao concluir tarefa:", e);
                  }
                }
                setConfirmVisible(false);
                setDetailVisible(false);
              }}
            >
              <Text style={styles.confirmButtonTextPrimary}>
                Sim, desejo concluir
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.confirmButton,
                { backgroundColor: "#e3e3e3" },
              ]}
              onPress={() => setConfirmVisible(false)}
            >
              <Text style={styles.confirmButtonTextSecondary}>
                Não desejo concluir
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {deleteVisible && (
        <View style={styles.confirmOverlay}>
          <BlurView
            intensity={70}
            tint="light"
            style={styles.confirmBlur}
          />
          <TouchableWithoutFeedback
            onPress={() => setDeleteVisible(false)}
          >
            <View style={RNStyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>

          <View style={styles.confirmBox}>
            <Text style={styles.confirmTitle}>Deseja apagar a tarefa?</Text>
            <Text style={styles.confirmText}>
              Essa ação é permanente e removerá a tarefa da sua lista.
            </Text>
            <TouchableOpacity
              style={[
                styles.confirmButton,
                { backgroundColor: "#ff005c" },
              ]}
              onPress={async () => {
                if (selectedTask) {
                  try {
                    await excluirTarefa(selectedTask.id);
                  } catch (e) {
                    console.log("Erro ao apagar tarefa:", e);
                  }
                }
                setDeleteVisible(false);
                setDetailVisible(false);
              }}
            >
              <Text style={styles.confirmButtonTextPrimary}>
                Sim, desejo apagar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.confirmButton,
                { backgroundColor: "#e3e3e3" },
              ]}
              onPress={() => setDeleteVisible(false)}
            >
              <Text style={styles.confirmButtonTextSecondary}>
                Não desejo apagar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f6f6",
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    marginBottom: 6,
  },
  backIcon: { width: 36, height: 36, tintColor: "#0F172A" },
  addFab: {
    width: 48,
    height: 48,
    backgroundColor: "#ff005c",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  fixedTabs: {
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  tabsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  tabChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#e6e6e6",
    backgroundColor: "#ededed",
    justifyContent: "center",
    alignItems: "center",
  },
  tabChipActive: {
    borderColor: "#ff005c",
  },
  tabText: {
    fontSize: 13,
    color: "#374151",
    fontFamily: "Poppins_400Regular",
    textAlignVertical: "center",
    textAlign: "center",
  },
  tabTextActive: {
    color: "#ff005c",
    fontFamily: "Poppins_700Bold",
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 12,
    marginTop: 6,
    marginBottom: 4,
  },
  dayWrapper: { alignItems: "center", flex: 1 },
  dayLabel: {
    fontSize: 11,
    color: "#6B7280",
    fontFamily: "Poppins_400Regular",
    marginBottom: 4,
    textTransform: "capitalize",
  },
  dayBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: "#e6e6e6",
    borderWidth: 1,
    borderColor: "#d2d2d2",
    justifyContent: "center",
    alignItems: "center",
  },
  dayText: {
    fontSize: 15,
    fontFamily: "Poppins_700Bold",
    color: "#0F172A",
  },
  selectedLine: {
    width: 28,
    height: 3,
    backgroundColor: "#ff005c",
    borderRadius: 2,
    marginTop: 4,
  },
  calendarCard: {
    backgroundColor: "#e4e4e4",
    borderRadius: 16,
    padding: 10,
    marginHorizontal: 16,
    marginTop: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#e6e6e6",
  },
  emptyBox: {
    backgroundColor: "#ededed",
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#e6e6e6",
  },
  emptyText: { color: "#6B7280", fontFamily: "Poppins_400Regular" },
  card: {
    backgroundColor: "#ededed",
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: "#cfcfcf",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: {
    color: "#0F172A",
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    maxWidth: "70%",
  },
  badge: {
    backgroundColor: "#e6e6e6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: {
    color: "#374151",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
  },
  cardDesc: {
    color: "#4B5563",
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    marginTop: 10,
  },
  cardDue: {
    color: "#6B7280",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    marginTop: 8,
  },
  modalOverlay: {
    ...RNStyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
  },
  modalWrapper: { width: "100%", justifyContent: "flex-end" },
  modalContent: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
    minHeight: height * 0.75,
    borderTopWidth: 1,
    borderColor: "#e6e6e6",
  },
  modalHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  modalTitle: {
    color: "#0F172A",
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    marginLeft: 10,
  },
  input: {
    backgroundColor: "#ededed",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#0F172A",
    fontFamily: "Poppins_400Regular",
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#cfcfcf",
  },
  inputError: { borderColor: "#ff3b3b" },
  textArea: { height: 110, textAlignVertical: "top" },
  counter: {
    alignSelf: "flex-end",
    color: "#6B7280",
    fontSize: 12,
    marginBottom: 8,
  },
  errorText: { color: "#b91c1c", fontSize: 13, marginBottom: 6 },
  createButton: { marginTop: 10, alignSelf: "stretch" },
  createButtonInner: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  createButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
  },
  detailOverlay: {
    ...RNStyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  detailBox: {
    backgroundColor: "#ededed",
    padding: 24,
    borderRadius: 14,
    width: "85%",
    borderWidth: 1,
    borderColor: "#e6e6e6",
  },
  arrowBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "#e6e6e6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  detailTitle: {
    color: "#0F172A",
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    flexShrink: 1,
  },
  detailDesc: {
    color: "#374151",
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    marginBottom: 10,
  },
  detailDate: {
    color: "#6B7280",
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    marginBottom: 18,
  },
  detailButton: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 8,
  },
  detailButtonTextPrimary: {
    color: "#ffffff",
    fontFamily: "Poppins_700Bold",
  },
  detailButtonTextSecondary: {
    color: "#0F172A",
    fontFamily: "Poppins_700Bold",
  },
  detailClose: {
    color: "#ff005c",
    fontFamily: "Poppins_700Bold",
    textAlign: "center",
    marginTop: 10,
  },
  confirmOverlay: {
    ...RNStyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  confirmBlur: { ...RNStyleSheet.absoluteFillObject },
  confirmBox: {
    backgroundColor: "#ededed",
    borderRadius: 20,
    padding: 24,
    width: "85%",
    borderWidth: 1,
    borderColor: "#e6e6e6",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  confirmTitle: {
    color: "#0F172A",
    fontSize: 17,
    fontFamily: "Poppins_700Bold",
    marginBottom: 6,
  },
  confirmText: {
    color: "#4B5563",
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    marginBottom: 18,
  },
  confirmButton: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 8,
  },
  confirmButtonTextPrimary: {
    color: "#ffffff",
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
  },
  confirmButtonTextSecondary: {
    color: "#0F172A",
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
  },
});
