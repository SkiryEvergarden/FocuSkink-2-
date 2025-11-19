import { Inter_400Regular } from "@expo-google-fonts/inter";
import { Poppins_400Regular, Poppins_700Bold, useFonts } from "@expo-google-fonts/poppins";
import { Ionicons } from "@expo/vector-icons";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { Video } from "expo-av";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";

import iconartigo from "../assets_icons/artigo_icon.png";
import iconconfig from "../assets_icons/config_icon.png";
import iconinicio from "../assets_icons/inicio_icon.png";
import iconseguir from "../assets_icons/seguir.png";
import icontarefas from "../assets_icons/tarefas_icon.png";

import { useAchievements } from "../contexts/AchievementsContext";
import { useAuth } from "../contexts/AuthContext";
import { StreakContext } from "../contexts/StreakContext";
import { useTarefas } from "../contexts/TarefasContext";
import { useAppTheme } from "../contexts/ThemeContext";

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
  if (d.getFullYear() !== yyyy || d.getMonth() !== mm - 1 || d.getDate() !== dd) return null;
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
  const isFocused = useIsFocused();
  const [selected, setSelected] = useState("Início");

  const { colors, isDark } = useAppTheme();
  const styles = createStyles(colors);

  const { tarefas, concluirTarefa, excluirTarefa } = useTarefas();
  const { currentUser } = useAuth() || {};
  const avatarUri = currentUser?.avatarUri || null;
  const displayName = currentUser?.username || "Nome do usuário";

  const [selectedTask, setSelectedTask] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [loadingConcluir, setLoadingConcluir] = useState(false);
  const [loadingApagar, setLoadingApagar] = useState(false);

  const { weekProgress } = useContext(StreakContext);

  const achievementsCtx = useAchievements() || {};
  const { lastAchievementsHome = [] } = achievementsCtx;

  const [achievementDetail, setAchievementDetail] = useState(null);
  const [showHomeInfo, setShowHomeInfo] = useState(false);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
    Inter_400Regular
  });

  const fireVideoRef = useRef(null);

  useEffect(() => {
    if (!isFocused && fireVideoRef.current) {
      fireVideoRef.current.stopAsync().catch(() => {});
    }
  }, [isFocused]);

  useEffect(() => {
    return () => {
      if (fireVideoRef.current) {
        fireVideoRef.current.stopAsync().catch(() => {});
        fireVideoRef.current.unloadAsync().catch(() => {});
      }
    };
  }, []);

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

    const bgHoje = colors.border;
    const bgOutros = colors.border;
    const bgCompleted = colors.accent;

    const textHoje = isDark ? "#ffffff" : "#000000";
    const textDefault = colors.textSecondary;

    if (isHoje) {
      if (completed) {
        return {
          boxStyle: [styles.dayBoxBase, { backgroundColor: bgCompleted }],
          textStyle: [styles.dayTextBase, { color: "#ffffff" }]
        };
      }
      return {
        boxStyle: [styles.dayBoxBase, { backgroundColor: bgHoje }],
        textStyle: [styles.dayTextBase, { color: textHoje }]
      };
    }

    if (completed) {
      return {
        boxStyle: [styles.dayBoxBase, { backgroundColor: bgCompleted }],
        textStyle: [styles.dayTextBase, { color: "#ffffff" }]
      };
    }

    return {
      boxStyle: [styles.dayBoxBase, { backgroundColor: bgOutros }],
      textStyle: [styles.dayTextBase, { color: textDefault }]
    };
  }

  const showFireBig = !!weekProgress[hojeIdx];

  const videoSource = isDark
    ? require("../assets_videos/fogoanimation_b.mp4")
    : require("../assets_videos/fogoanimation_w.mp4");

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.profileCircleImage} />
            ) : (
              <View style={styles.profileCircle} />
            )}
            <Text style={styles.userName}>Olá, {displayName}</Text>
          </View>

          <TouchableOpacity onPress={() => setShowHomeInfo(true)} activeOpacity={0.9} style={styles.infoIconBtn}>
            <Image source={require("../assets_images/iconfoco.png")} style={styles.infoIcon} />
          </TouchableOpacity>
        </View>

        <View style={styles.sequenceCard}>
          <View style={styles.sequenceHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sequenceTitle}>Sequência de leitura diária</Text>
              <Text style={styles.sequenceSubtitle}>Leia um artigo para manter sua sequência ativa hoje.</Text>
            </View>

            {showFireBig && isFocused && (
              <Video
                key={isDark ? "fire-dark" : "fire-light"}
                ref={fireVideoRef}
                source={videoSource}
                style={styles.fireIconBig}
                isLooping
                shouldPlay
                resizeMode="contain"
              />
            )}
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
                <Image source={ach.image} style={styles.achievementImage} />
                <Text style={styles.achievementText} numberOfLines={1}>
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
            <Text style={styles.noTasksText}>Nenhuma tarefa próxima.</Text>
          ) : (
            proximasTarefas.map((t) => (
              <TouchableOpacity
                key={t.id}
                style={styles.taskCard}
                onPress={() => {
                  setSelectedTask(t);
                  setDetailVisible(true);
                }}
                activeOpacity={0.9}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.taskTitle} numberOfLines={1}>
                    {t.titulo}
                  </Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{categoriaFromDate(t.concluirAte)}</Text>
                  </View>
                </View>

                {t.descricao ? (
                  <Text style={styles.taskDesc} numberOfLines={3}>
                    {t.descricao}
                  </Text>
                ) : null}

                {t.concluirAte ? <Text style={styles.taskDue}>Até {t.concluirAte}</Text> : null}
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        <View style={{ height: 140 }} />
      </ScrollView>

      <LinearGradient
        colors={
          isDark
            ? ["rgba(0,0,0,0)", "rgba(0,0,0,1)"]
            : ["rgba(246,246,246,0)", "rgba(246,246,246,0.95)"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradientWrapper}
        pointerEvents="box-none"
      >
        <BlurView
          intensity={25}
          tint={isDark ? "dark" : "light"}
          style={[styles.navbarWrapper, isDark && { backgroundColor: "rgba(0,0,0,0.7)" }]}
          pointerEvents="box-none"
        >
          <View style={styles.navbar}>
            {[
              { name: "Início", icon: iconinicio, screen: "Inicio" },
              { name: "Sessão", icon: icontarefas, screen: "TelaTarefas" },
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
                  style={[styles.navIcon, selected === item.name && { tintColor: colors.accent }]}
                />
                <Text style={[styles.navText, selected === item.name && { color: colors.accent }]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </BlurView>
      </LinearGradient>

      {achievementDetail && (
        <View style={styles.achievementOverlay}>
          <BlurView
            intensity={80}
            tint={isDark ? "dark" : "light"}
            style={[StyleSheet.absoluteFill, isDark && { backgroundColor: "rgba(0,0,0,0.7)" }]}
          />
          <TouchableWithoutFeedback onPress={() => setAchievementDetail(null)}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>

          <View style={styles.achievementModalBox}>
            <Text style={styles.achievementModalTitle}>Detalhes da conquista</Text>
            <Image source={achievementDetail.image} style={styles.achievementModalImage} />
            <Text style={styles.achievementModalName}>{achievementDetail.title}</Text>
            <Text style={styles.achievementModalDesc}>{achievementDetail.description}</Text>

            <TouchableOpacity
              style={styles.achievementModalButton}
              onPress={() => setAchievementDetail(null)}
            >
              <Text style={styles.achievementModalButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {showHomeInfo && (
        <View style={styles.achievementOverlay}>
          <BlurView
            intensity={80}
            tint={isDark ? "dark" : "light"}
            style={[StyleSheet.absoluteFill, isDark && { backgroundColor: "rgba(0,0,0,0.7)" }]}
          />

          <View style={styles.achievementModalBox}>
            <Text style={styles.achievementModalTitle}>Como funciona esta tela?</Text>
            <Text style={styles.achievementModalDesc}>
              • Sequência de leitura diária: mostra os dias da semana e se você leu um artigo em
              cada dia. Leia ao menos um artigo hoje para manter sua sequência ativa.
              {"\n\n"}
              • Últimas conquistas: aqui aparecem as conquistas mais recentes que você desbloqueou
              usando o app.
              {"\n\n"}
              • Relatórios: o botão "Ver relatórios" leva para uma tela com estatísticas de uso e
              seu progresso.
              {"\n\n"}
              • Próximas tarefas: mostra algumas das tarefas com prazo mais próximo.
            </Text>

            <TouchableOpacity style={styles.achievementModalButton} onPress={() => setShowHomeInfo(false)}>
              <Text style={styles.achievementModalButtonText}>Entendi</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {detailVisible && selectedTask && (
        <View style={styles.detailOverlay}>
          <BlurView intensity={80} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
          <TouchableWithoutFeedback onPress={() => setDetailVisible(false)}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>

          <View style={[styles.detailBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {!selectedTask.concluida ? (
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                <TouchableOpacity
                  onPress={() => setDetailVisible(false)}
                  style={[styles.arrowBtn, { backgroundColor: colors.input, borderColor: colors.border }]}
                >
                  <Ionicons name="chevron-back" size={20} color={colors.accent} />
                </TouchableOpacity>
                <Text style={[styles.detailTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                  {selectedTask.titulo}
                </Text>
              </View>
            ) : (
              <Text style={[styles.detailTitle, { color: colors.textPrimary }]}>{selectedTask.titulo}</Text>
            )}

            {!!selectedTask.descricao && (
              <Text style={[styles.detailDesc, { color: colors.textSecondary }]}>
                {selectedTask.descricao}
              </Text>
            )}
            <Text style={[styles.detailDate, { color: colors.textSecondary }]}>
              Até {selectedTask.concluirAte}
            </Text>

            {!selectedTask.concluida ? (
              <>
                <TouchableOpacity
                  style={[styles.detailButton, { backgroundColor: colors.accent }]}
                  onPress={() => setConfirmVisible(true)}
                >
                  <Text style={styles.detailButtonTextPrimary}>Concluir</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.detailButton, { backgroundColor: colors.input }]}
                  onPress={() => setDeleteVisible(true)}
                >
                  <Text style={[styles.detailButtonTextSecondary, { color: colors.textPrimary }]}>
                    Apagar
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity onPress={() => setDetailVisible(false)}>
                <Text style={[styles.detailClose, { color: colors.accent }]}>Fechar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {confirmVisible && selectedTask && (
        <View style={styles.confirmOverlay}>
          <BlurView intensity={80} tint={isDark ? "dark" : "light"} style={styles.confirmBlur} />
          <TouchableWithoutFeedback
            onPress={() => {
              setConfirmVisible(false);
              setLoadingConcluir(false);
            }}
          >
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>

          <View style={[styles.confirmBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.confirmTitle, { color: colors.textPrimary }]}>
              Você deseja concluir a tarefa?
            </Text>
            <Text style={[styles.confirmText, { color: colors.textSecondary }]}>
              Essa confirmação ajuda a manter seu progresso atualizado e os relatórios mais precisos.
            </Text>
            <TouchableOpacity
              style={[styles.confirmButton, { backgroundColor: colors.accent }, loadingConcluir && { opacity: 0.5 }]}
              disabled={loadingConcluir}
              onPress={async () => {
                if (!selectedTask || loadingConcluir) return;
                setLoadingConcluir(true);
                try {
                  await concluirTarefa(selectedTask.id);
                } catch (e) {
                } finally {
                  setLoadingConcluir(false);
                  setConfirmVisible(false);
                  setDetailVisible(false);
                  setSelectedTask(null);
                }
              }}
            >
              <Text style={styles.confirmButtonTextPrimary}>
                {loadingConcluir ? "Concluindo..." : "Sim, desejo concluir"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmButton, { backgroundColor: colors.input }]}
              onPress={() => {
                setLoadingConcluir(false);
                setConfirmVisible(false);
              }}
            >
              <Text style={[styles.confirmButtonTextSecondary, { color: colors.textPrimary }]}>
                Não desejo concluir
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {deleteVisible && selectedTask && (
        <View style={styles.confirmOverlay}>
          <BlurView intensity={80} tint={isDark ? "dark" : "light"} style={styles.confirmBlur} />
          <TouchableWithoutFeedback
            onPress={() => {
              setDeleteVisible(false);
              setLoadingApagar(false);
            }}
          >
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>

          <View style={[styles.confirmBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.confirmTitle, { color: colors.textPrimary }]}>
              Deseja apagar a tarefa?
            </Text>
            <Text style={[styles.confirmText, { color: colors.textSecondary }]}>
              Essa ação é permanente e removerá a tarefa da sua lista.
            </Text>

            <TouchableOpacity
              style={[styles.confirmButton, { backgroundColor: colors.accent }, loadingApagar && { opacity: 0.5 }]}
              disabled={loadingApagar}
              onPress={async () => {
                if (!selectedTask || loadingApagar) return;
                setLoadingApagar(true);
                try {
                  await excluirTarefa(selectedTask.id);
                } catch (e) {
                } finally {
                  setLoadingApagar(false);
                  setDeleteVisible(false);
                  setDetailVisible(false);
                  setSelectedTask(null);
                }
              }}
            >
              <Text style={styles.confirmButtonTextPrimary}>
                {loadingApagar ? "Apagando..." : "Sim, desejo apagar"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmButton, { backgroundColor: colors.input }]}
              onPress={() => {
                setLoadingApagar(false);
                setDeleteVisible(false);
              }}
            >
              <Text style={[styles.confirmButtonTextSecondary, { color: colors.textPrimary }]}>
                Não desejo apagar
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

const createStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
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
      backgroundColor: colors.border
    },
    profileCircleImage: {
      width: 46,
      height: 46,
      borderRadius: 23
    },
    userName: {
      color: colors.textPrimary,
      fontSize: 16,
      fontFamily: "Poppins_400Regular",
      marginLeft: 14
    },
    infoIconBtn: { marginLeft: 12 },
    infoIcon: {
      width: 28,
      height: 28,
      tintColor: colors.textPrimary
    },
    sequenceCard: {
      backgroundColor: colors.card,
      marginHorizontal: 20,
      borderRadius: 16,
      paddingHorizontal: 18,
      paddingVertical: 22,
      marginTop: 10,
      borderWidth: 1,
      borderColor: colors.border
    },
    sequenceHeader: { flexDirection: "row", alignItems: "center" },
    sequenceTitle: {
      color: colors.textPrimary,
      fontFamily: "Poppins_700Bold",
      fontSize: 16
    },
    sequenceSubtitle: {
      color: colors.textSecondary,
      fontFamily: "Poppins_400Regular",
      fontSize: 12,
      marginTop: 6
    },
    fireIconBig: {
      width: 50,
      height: 50,
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
      color: colors.textSecondary
    },
    reportButton: {
      backgroundColor: colors.accent,
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
      color: colors.textPrimary,
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
      backgroundColor: colors.card,
      width: width * 0.4,
      borderRadius: 14,
      alignItems: "center",
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
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
      color: colors.textPrimary,
      fontSize: 14,
      fontFamily: "Poppins_700Bold",
      textAlign: "center"
    },
    yearText: {
      color: colors.textSecondary,
      fontSize: 12,
      fontFamily: "Poppins_400Regular",
      marginTop: 4
    },
    noAchievementsText: {
      color: colors.textSecondary,
      fontSize: 13,
      fontFamily: "Poppins_400Regular",
      marginTop: 12,
      marginLeft: 26,
      marginRight: 26
    },
    taskCarousel: { paddingHorizontal: 20, marginTop: 12 },
    taskCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginRight: 16,
      width: width * 0.7,
      borderWidth: 1,
      borderColor: colors.border
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between"
    },
    taskTitle: {
      color: colors.textPrimary,
      fontSize: 16,
      fontFamily: "Poppins_700Bold",
      maxWidth: "70%"
    },
    badge: {
      backgroundColor: colors.border,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 10
    },
    badgeText: {
      color: colors.textSecondary,
      fontSize: 12,
      fontFamily: "Poppins_400Regular"
    },
    taskDesc: {
      color: colors.textSecondary,
      fontSize: 13,
      fontFamily: "Poppins_400Regular",
      marginTop: 10
    },
    taskDue: {
      color: colors.textSecondary,
      fontSize: 12,
      fontFamily: "Poppins_400Regular",
      marginTop: 8
    },
    noTasksText: {
      color: colors.textSecondary,
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
      backgroundColor: colors.card,
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      borderRadius: 20,
      paddingVertical: 14,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderColor: colors.border
    },
    navItem: { alignItems: "center", justifyContent: "center", flex: 1 },
    navIcon: {
      width: 28,
      height: 28,
      tintColor: colors.textPrimary,
      marginBottom: 6
    },
    navText: {
      fontSize: 13,
      color: colors.textPrimary,
      fontFamily: "Inter_400Regular"
    },
    achievementOverlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: "center",
      alignItems: "center"
    },
    achievementModalBox: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 24,
      width: "80%",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border
    },
    achievementModalTitle: {
      color: colors.textPrimary,
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
      color: colors.textPrimary,
      fontSize: 15,
      fontFamily: "Poppins_700Bold",
      marginBottom: 6,
      textAlign: "center"
    },
    achievementModalDesc: {
      color: colors.textSecondary,
      fontSize: 13,
      fontFamily: "Poppins_400Regular",
      textAlign: "center",
      marginBottom: 16
    },
    achievementModalButton: {
      backgroundColor: colors.accent,
      borderRadius: 12,
      paddingVertical: 10,
      paddingHorizontal: 22
    },
    achievementModalButtonText: {
      color: "#ffffff",
      fontSize: 14,
      fontFamily: "Poppins_700Bold"
    },
    detailOverlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: "center",
      alignItems: "center"
    },
    detailBox: {
      padding: 24,
      borderRadius: 14,
      width: "85%",
      borderWidth: 1
    },
    arrowBtn: {
      width: 34,
      height: 34,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 8,
      borderWidth: 1
    },
    detailTitle: {
      fontSize: 18,
      fontFamily: "Poppins_700Bold",
      flexShrink: 1
    },
    detailDesc: {
      fontSize: 14,
      fontFamily: "Poppins_400Regular",
      marginBottom: 10
    },
    detailDate: {
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
    detailButtonTextPrimary: {
      color: "#ffffff",
      fontFamily: "Poppins_700Bold"
    },
    detailButtonTextSecondary: {
      fontFamily: "Poppins_700Bold"
    },
    detailClose: {
      fontFamily: "Poppins_700Bold",
      textAlign: "center",
      marginTop: 10
    },
    confirmOverlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: "center",
      alignItems: "center"
    },
    confirmBlur: { ...StyleSheet.absoluteFillObject },
    confirmBox: {
      borderRadius: 20,
      padding: 24,
      width: "85%",
      borderWidth: 1
    },
    confirmTitle: {
      fontSize: 17,
      fontFamily: "Poppins_700Bold",
      marginBottom: 6
    },
    confirmText: {
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
    confirmButtonTextPrimary: {
      color: "#ffffff",
      fontSize: 14,
      fontFamily: "Poppins_700Bold"
    },
    confirmButtonTextSecondary: {
      fontSize: 14,
      fontFamily: "Poppins_700Bold"
    }
  });
