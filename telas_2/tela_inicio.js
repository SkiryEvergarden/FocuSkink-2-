import React, {
  useMemo,
  useState,
  useContext,
  useEffect
} from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  TouchableWithoutFeedback
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_700Bold
} from "@expo-google-fonts/poppins";
import { Inter_400Regular } from "@expo-google-fonts/inter";
import { Ionicons } from "@expo/vector-icons";

import { useTarefas } from "../contexts/TarefasContext";
import { StreakContext } from "../contexts/StreakContext";
import { useAchievements } from "../contexts/AchievementsContext";
import { useAuth } from "../contexts/AuthContext";

import iconfire from "../assets_icons/icon_fire.png";
import iconseguir from "../assets_icons/seguir.png";
import iconinicio from "../assets_icons/inicio_icon.png";
import icontarefas from "../assets_icons/tarefas_icon.png";
import iconartigo from "../assets_icons/artigo_icon.png";
import iconconfig from "../assets_icons/config_icon.png";

const { width } = Dimensions.get("window");

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

const daysDiffFromToday = (d) => {
  const t0 = today().getTime();
  const t1 = startOfDay(d).getTime();
  const diffMs = t1 - t0;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diffMs / oneDay);
};

export default function TelaInicio() {
  const navigation = useNavigation();
  const [selected, setSelected] = useState("Início");

  const { tarefas, concluirTarefa, excluirTarefa } = useTarefas();

  const { currentUser } = useAuth() || {};
  const displayName = currentUser?.username || "Nome do usuário";
  const avatarUri = currentUser?.avatarUri || null;

  const [selectedTask, setSelectedTask] = useState(null);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);

  const { weekProgress } = useContext(StreakContext);

  const achievementsCtx = useAchievements() || {};
  const {
    lastAchievementsHome = [],
    lastUnlockedAchievement,
    modalVisible,
    closeModal
  } = achievementsCtx;

  const [achievementDetail, setAchievementDetail] = useState(null);
  const [showHomeInfo, setShowHomeInfo] = useState(false);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
    Inter_400Regular
  });

  const proximasTarefas = useMemo(() => {
    const futuras = tarefas
      .filter((t) => {
        if (t.concluida) return false;
        const d = parseDDMMYYYY(t.concluirAte);
        if (!d) return false;
        const diff = daysDiffFromToday(d);
        return diff >= 0;
      })
      .sort((a, b) => {
        const da = parseDDMMYYYY(a.concluirAte);
        const db = parseDDMMYYYY(b.concluirAte);
        return da - db;
      });
    return futuras.slice(0, 4);
  }, [tarefas]);

  const categoriaFromDate = (dateStr) => {
    const d = parseDDMMYYYY(dateStr);
    if (!d) return "";
    const diff = daysDiffFromToday(d);
    if (diff === 0) return "Diária";
    if (diff > 0 && diff <= 7) return "Semanal";
    return "Mensal";
  };

  const diasSemana = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
  const hojeIdx = new Date().getDay();

  function getDayStyles(index) {
    const completed = !!weekProgress[index];
    const isHoje = index === hojeIdx;

    const rosa = "#ff005c";
    const cinzaHoje = "#ededed";
    const cinzaOutros = "#e4e4e4";

    if (isHoje) {
      if (completed) {
        return {
          boxStyle: [styles.dayBoxBase, { backgroundColor: rosa }],
          textStyle: [styles.dayTextBase, { color: "#ffffff" }]
        };
      }
      return {
        boxStyle: [styles.dayBoxBase, { backgroundColor: cinzaHoje }],
        textStyle: [styles.dayTextBase, { color: "#6B7280" }]
      };
    }
    if (completed) {
      return {
        boxStyle: [styles.dayBoxBase, { backgroundColor: rosa }],
        textStyle: [styles.dayTextBase, { color: "#ffffff" }]
      };
    }
    return {
      boxStyle: [styles.dayBoxBase, { backgroundColor: cinzaOutros }],
      textStyle: [styles.dayTextBase, { color: "#9CA3AF" }]
    };
  }

  const showFireBig = !!weekProgress[hojeIdx];

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: "#f6f6f6" }} />;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                style={styles.profileCircleImage}
              />
            ) : (
              <View style={styles.profileCircle} />
            )}
            <Text style={styles.userName}>Olá, {displayName}</Text>
          </View>

          <TouchableOpacity
            onPress={() => setShowHomeInfo(true)}
            activeOpacity={0.9}
            style={styles.infoIconBtn}
          >
            <Image
              source={require("../assets_images/iconfoco.png")}
              style={styles.infoIcon}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.sequenceCard}>
          <View style={styles.sequenceHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sequenceTitle}>
                Sequência de leitura diária
              </Text>
              <Text style={styles.sequenceSubtitle}>
                Leia um artigo para manter sua sequência ativa hoje.
              </Text>
            </View>
            {showFireBig ? (
              <Image source={iconfire} style={styles.fireIconBig} />
            ) : null}
          </View>

          <View style={styles.sequenceDaysRow}>
            {diasSemana.map((label, i) => {
              const { boxStyle, textStyle } = getDayStyles(i);
              return (
                <View key={i} style={styles.dayWrapper}>
                  <View style={boxStyle}>
                    <Text style={textStyle}>{label}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <TouchableOpacity
          style={styles.reportButton}
          onPress={() => navigation.navigate("RelatorioInicio")}
          activeOpacity={0.9}
        >
          <Text style={styles.reportButtonText}>Ver relatórios</Text>
          <Image source={iconseguir} style={styles.reportIcon} />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Últimas conquistas</Text>

        {lastAchievementsHome.length === 0 ? (
          <Text style={styles.noAchievementsText}>
            Nenhuma conquista desbloqueada ainda. Continue usando o app!
          </Text>
        ) : (
          <View style={styles.achievementsRow}>
            {lastAchievementsHome.map((ach) => (
              <TouchableOpacity
                key={ach.id}
                style={styles.achievementCard}
                activeOpacity={0.9}
                onPress={() => setAchievementDetail(ach)}
              >
                <Image
                  source={ach.image}
                  style={styles.achievementImage}
                  resizeMode="cover"
                />
                <Text
                  style={styles.achievementText}
                  numberOfLines={1}
                >
                  {ach.title}
                </Text>
                <Text style={styles.yearText}>Conquistada</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.sectionTitle}>Próximas tarefas</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.taskCarousel}
        >
          {proximasTarefas.length === 0 ? (
            <Text style={styles.noTasksText}>
              Nenhuma tarefa próxima.
            </Text>
          ) : (
            proximasTarefas.map((t) => (
              <TouchableOpacity
                key={t.id}
                style={styles.taskCard}
                onPress={() => setSelectedTask(t)}
                activeOpacity={0.9}
              >
                <View style={styles.cardHeader}>
                  <Text
                    style={styles.taskTitle}
                    numberOfLines={1}
                  >
                    {t.titulo}
                  </Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {categoriaFromDate(t.concluirAte)}
                    </Text>
                  </View>
                </View>

                {t.descricao ? (
                  <Text
                    style={styles.taskDesc}
                    numberOfLines={3}
                  >
                    {t.descricao}
                  </Text>
                ) : null}

                {t.concluirAte ? (
                  <Text style={styles.taskDue}>Até {t.concluirAte}</Text>
                ) : null}
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        <View style={{ height: 140 }} />
      </ScrollView>

      <LinearGradient
        colors={["rgba(246,246,246,0)", "rgba(246,246,246,0.95)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradientWrapper}
        pointerEvents="box-none"
      >
        <BlurView
          intensity={25}
          tint="light"
          style={styles.navbarWrapper}
          pointerEvents="box-none"
        >
          <View style={styles.navbar}>
            {[
              { name: "Início", icon: iconinicio, screen: "Inicio" },
              { name: "Tarefas", icon: icontarefas, screen: "TelaTarefas" },
              { name: "Artigos", icon: iconartigo, screen: "TelaArtigos" },
              { name: "Definições", icon: iconconfig, screen: "TelaDefinicoes" }
            ].map((item) => (
              <TouchableOpacity
                key={item.name}
                style={styles.navItem}
                onPress={() => {
                  setSelected(item.name);
                  navigation.navigate(item.screen);
                }}
              >
                <Image
                  source={item.icon}
                  style={[
                    styles.navIcon,
                    selected === item.name && { tintColor: "#ff005c" }
                  ]}
                  resizeMode="contain"
                />
                <Text
                  style={[
                    styles.navText,
                    selected === item.name && { color: "#ff005c" }
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </BlurView>
      </LinearGradient>

      {selectedTask && (
        <View style={styles.modalOverlay}>
          <BlurView
            intensity={60}
            tint="light"
            style={StyleSheet.absoluteFill}
          />
          <TouchableWithoutFeedback onPress={() => setSelectedTask(null)}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>

          <View style={styles.detailBox}>
            {!selectedTask.concluida ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 10
                }}
              >
                <TouchableOpacity
                  onPress={() => setSelectedTask(null)}
                  style={styles.arrowBtn}
                >
                  <Ionicons
                    name="chevron-back"
                    size={20}
                    color="#ff005c"
                  />
                </TouchableOpacity>
                <Text
                  style={[styles.detailTitle, { marginLeft: 8 }]}
                  numberOfLines={1}
                >
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

            {!selectedTask.concluida && (
              <>
                <TouchableOpacity
                  style={[
                    styles.detailButton,
                    { backgroundColor: "#ff005c" }
                  ]}
                  onPress={() => setConfirmVisible(true)}
                >
                  <Text
                    style={[
                      styles.detailButtonText,
                      { color: "#ffffff" }
                    ]}
                  >
                    Concluir
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.detailButton,
                    { backgroundColor: "#e3e3e3" }
                  ]}
                  onPress={() => setDeleteVisible(true)}
                >
                  <Text style={styles.detailButtonText}>Apagar</Text>
                </TouchableOpacity>
              </>
            )}

            {selectedTask.concluida && (
              <TouchableOpacity onPress={() => setSelectedTask(null)}>
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
            <View style={StyleSheet.absoluteFill} />
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
                { backgroundColor: "#ff005c" }
              ]}
              onPress={() => {
                if (selectedTask) concluirTarefa(selectedTask.id);
                setConfirmVisible(false);
                setSelectedTask(null);
              }}
            >
              <Text
                style={[
                  styles.confirmButtonText,
                  { color: "#ffffff" }
                ]}
              >
                Sim, desejo concluir
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.confirmButton,
                { backgroundColor: "#e3e3e3" }
              ]}
              onPress={() => setConfirmVisible(false)}
            >
              <Text
                style={[
                  styles.confirmButtonText,
                  { color: "#0F172A" }
                ]}
              >
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
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>

          <View style={styles.confirmBox}>
            <Text style={styles.confirmTitle}>
              Deseja apagar a tarefa?
            </Text>
            <Text style={styles.confirmText}>
              Essa ação é permanente e removerá a tarefa da sua lista.
            </Text>

            <TouchableOpacity
              style={[
                styles.confirmButton,
                { backgroundColor: "#ff005c" }
              ]}
              onPress={() => {
                if (selectedTask) excluirTarefa(selectedTask.id);
                setDeleteVisible(false);
                setSelectedTask(null);
              }}
            >
              <Text
                style={[
                  styles.confirmButtonText,
                  { color: "#ffffff" }
                ]}
              >
                Sim, desejo apagar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.confirmButton,
                { backgroundColor: "#e3e3e3" }
              ]}
              onPress={() => setDeleteVisible(false)}
            >
              <Text
                style={[
                  styles.confirmButtonText,
                  { color: "#0F172A" }
                ]}
              >
                Não desejo apagar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {modalVisible && lastUnlockedAchievement && (
        <View style={styles.achievementOverlay}>
          <BlurView
            intensity={80}
            tint="light"
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.achievementModalBox}>
            <Text style={styles.achievementModalTitle}>
              Nova conquista desbloqueada!
            </Text>
            <Image
              source={lastUnlockedAchievement.image}
              style={styles.achievementModalImage}
            />
            <Text style={styles.achievementModalName}>
              {lastUnlockedAchievement.title}
            </Text>
            <Text style={styles.achievementModalDesc}>
              {lastUnlockedAchievement.description}
            </Text>

            <TouchableOpacity
              style={styles.achievementModalButton}
              onPress={closeModal}
            >
              <Text style={styles.achievementModalButtonText}>
                Continuar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {achievementDetail && (
        <View style={styles.achievementOverlay}>
          <BlurView
            intensity={80}
            tint="light"
            style={StyleSheet.absoluteFill}
          />
          <TouchableWithoutFeedback
            onPress={() => setAchievementDetail(null)}
          >
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>

          <View style={styles.achievementModalBox}>
            <Text style={styles.achievementModalTitle}>
              Detalhes da conquista
            </Text>
            <Image
              source={achievementDetail.image}
              style={styles.achievementModalImage}
            />
            <Text style={styles.achievementModalName}>
              {achievementDetail.title}
            </Text>
            <Text style={styles.achievementModalDesc}>
              {achievementDetail.description}
            </Text>

            <TouchableOpacity
              style={styles.achievementModalButton}
              onPress={() => setAchievementDetail(null)}
            >
              <Text style={styles.achievementModalButtonText}>
                Fechar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {showHomeInfo && (
        <View style={styles.achievementOverlay}>
          <BlurView
            intensity={80}
            tint="light"
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.achievementModalBox}>
            <Text style={styles.achievementModalTitle}>
              Como funciona esta tela?
            </Text>
            <Text style={styles.achievementModalDesc}>
              • Sequência de leitura diária: mostra os dias da semana e se você
              leu um artigo em cada dia. Leia ao menos um artigo hoje para
              manter sua sequência ativa.
              {"\n\n"}
              • Últimas conquistas: aqui aparecem as conquistas mais recentes
              que você desbloqueou usando o app. Toque em uma conquista para ver
              mais detalhes.
              {"\n\n"}
              • Relatórios: o botão "Ver relatórios" leva para uma tela com
              estatísticas de uso, tempo de estudo/leitura e seu progresso ao
              longo dos dias.
              {"\n\n"}
              • Próximas tarefas: mostra algumas das tarefas com prazo mais
              próximo. Você pode tocar em uma delas para ver detalhes, concluir
              ou apagar a tarefa.
            </Text>

            <TouchableOpacity
              style={styles.achievementModalButton}
              onPress={() => setShowHomeInfo(false)}
            >
              <Text style={styles.achievementModalButtonText}>
                Entendi
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const BOX_WIDTH = 38;
const BOX_GAP = 4;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f6f6" },
  scroll: { paddingBottom: 180 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 50,
    paddingHorizontal: 25,
    marginBottom: 30
  },
  profileCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#e6e6e6"
  },
  profileCircleImage: {
    width: 46,
    height: 46,
    borderRadius: 23
  },
  userName: {
    color: "#0F172A",
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    marginLeft: 14
  },
  infoIconBtn: {
    marginLeft: 12
  },
  infoIcon: {
    width: 28,
    height: 28,
    tintColor: "#0F172A"
  },

  sequenceCard: {
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 22,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#e6e6e6"
  },
  sequenceHeader: {
    flexDirection: "row",
    alignItems: "center"
  },
  sequenceTitle: {
    color: "#0F172A",
    fontFamily: "Poppins_700Bold",
    fontSize: 16
  },
  sequenceSubtitle: {
    color: "#6B7280",
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    marginTop: 6
  },
  fireIconBig: {
    width: 50,
    height: 50,
    tintColor: "#ff005c",
    marginLeft: 12
  },

  sequenceDaysRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "nowrap",
    marginTop: 18
  },
  dayWrapper: { marginHorizontal: BOX_GAP },
  dayBoxBase: {
    width: BOX_WIDTH,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6
  },
  dayTextBase: {
    fontSize: 11,
    fontFamily: "Poppins_700Bold",
    color: "#6B7280"
  },

  reportButton: {
    backgroundColor: "#ff005c",
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 26,
    marginHorizontal: 20
  },
  reportButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontFamily: "Poppins_700Bold",
    marginRight: 8
  },
  reportIcon: { width: 20, height: 20, tintColor: "#ffffff" },

  sectionTitle: {
    color: "#0F172A",
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    marginTop: 42,
    marginLeft: 26
  },

  achievementsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginTop: 16,
    paddingHorizontal: 26
  },

  achievementCard: {
    backgroundColor: "#ffffff",
    width: width * 0.4,
    borderRadius: 14,
    alignItems: "center",
    padding: 16,
    borderWidth: 1,
    borderColor: "#e6e6e6",
    marginRight: 12,
    marginBottom: 12
  },
  achievementImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginBottom: 10
  },
  achievementText: {
    color: "#0F172A",
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
    textAlign: "center"
  },
  yearText: {
    color: "#6B7280",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    marginTop: 4
  },
  noAchievementsText: {
    color: "#6B7280",
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    marginTop: 12,
    marginLeft: 26,
    marginRight: 26
  },

  taskCarousel: { paddingHorizontal: 20, marginTop: 12 },
  taskCard: {
    backgroundColor: "#ededed",
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    width: width * 0.7,
    borderWidth: 1,
    borderColor: "#cfcfcf"
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  taskTitle: {
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
  taskDesc: {
    color: "#4B5563",
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    marginTop: 10
  },
  taskDue: {
    color: "#6B7280",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    marginTop: 8
  },
  noTasksText: {
    color: "#6B7280",
    fontFamily: "Poppins_400Regular"
  },

  gradientWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 200
  },
  navbarWrapper: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    paddingHorizontal: 20
  },
  navbar: {
    backgroundColor: "#ffffff",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#e6e6e6"
  },
  navItem: { alignItems: "center", justifyContent: "center", flex: 1 },
  navIcon: {
    width: 28,
    height: 28,
    tintColor: "#0F172A",
    marginBottom: 6
  },
  navText: {
    fontSize: 13,
    color: "#0F172A",
    fontFamily: "Inter_400Regular"
  },

  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center"
  },
  confirmOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center"
  },
  confirmBlur: {
    ...StyleSheet.absoluteFillObject
  },

  detailBox: {
    backgroundColor: "#ededed",
    borderRadius: 14,
    padding: 24,
    width: "85%",
    borderWidth: 1,
    borderColor: "#e6e6e6"
  },
  arrowBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "#e6e6e6",
    alignItems: "center",
    justifyContent: "center"
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
    marginBottom: 18
  },
  detailButton: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 8
  },
  detailButtonText: {
    fontFamily: "Poppins_700Bold",
    fontSize: 14,
    color: "#0F172A"
  },
  detailClose: {
    color: "#ff005c",
    fontFamily: "Poppins_700Bold",
    textAlign: "center",
    marginTop: 10
  },

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
    elevation: 6
  },
  confirmTitle: {
    color: "#0F172A",
    fontSize: 17,
    fontFamily: "Poppins_700Bold",
    marginBottom: 6
  },
  confirmText: {
    color: "#4B5563",
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    marginBottom: 18
  },
  confirmButton: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 8
  },
  confirmButtonText: {
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
    color: "#ffffff"
  },

  achievementOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center"
  },
  achievementModalBox: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 24,
    width: "80%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e5e5"
  },
  achievementModalTitle: {
    color: "#0F172A",
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    marginBottom: 10,
    textAlign: "center"
  },
  achievementModalImage: {
    width: 90,
    height: 90,
    borderRadius: 14,
    marginBottom: 12
  },
  achievementModalName: {
    color: "#0F172A",
    fontSize: 15,
    fontFamily: "Poppins_700Bold",
    marginBottom: 6,
    textAlign: "center"
  },
  achievementModalDesc: {
    color: "#4B5563",
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    marginBottom: 16
  },
  achievementModalButton: {
    backgroundColor: "#ff005c",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 22
  },
  achievementModalButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontFamily: "Poppins_700Bold"
  }
});
