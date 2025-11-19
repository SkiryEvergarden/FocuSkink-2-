import { Inter_400Regular } from "@expo-google-fonts/inter";
import {
  Poppins_400Regular,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { useNavigation } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useAuth } from "../../contexts/AuthContext";
import { useAppTheme } from "../../contexts/ThemeContext";

const { width } = Dimensions.get("window");
const CARD_SIZE = (width - 48 - 12) / 2;

export default function TelaDefinicoes() {
  const navigation = useNavigation();
  const [selected] = useState("Definições");

  const [modalVisible, setModalVisible] = useState(false);
  const [modalText, setModalText] = useState("");
  const [modalAction, setModalAction] = useState(null);
  const [modalType, setModalType] = useState(null);

  const [loadingLogout, setLoadingLogout] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const auth = useAuth() || {};
  const { currentUser, logout, deleteAccount } = auth;

  const displayName = currentUser?.username || "Nome do usuário";
  const avatarUri = currentUser?.avatarUri || null;

  const { colors, isDark, toggleTheme } = useAppTheme();
  const themeIcon = isDark
    ? require("../../assets_icons/iconluaa.png")
    : require("../../assets_icons/iconsoll.png");

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
    Inter_400Regular,
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  function abrirModal(text, type, action) {
    setModalText(text);
    setModalType(type);
    setModalAction(() => action);
    setModalVisible(true);
  }

  async function confirmarAcao() {
    if (!modalAction || (!modalType && modalType !== "logout" && modalType !== "delete")) {
      setModalVisible(false);
      return;
    }

    setModalVisible(false);

    if (modalType === "logout") {
      setLoadingLogout(true);
    } else if (modalType === "delete") {
      setLoadingDelete(true);
    }

    try {
      await modalAction();
    } catch (e) {
    } finally {
      setLoadingLogout(false);
      setLoadingDelete(false);
      setModalType(null);
      setModalAction(null);
    }
  }

  function cancelarAcao() {
    setModalVisible(false);
  }

  const algumCarregando = loadingLogout || loadingDelete;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: colors.chipBg }]} />
            )}
            <Text style={[styles.userName, { color: colors.textPrimary }]}>
              Olá, {displayName}
            </Text>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={toggleTheme}
              activeOpacity={0.8}
              style={styles.themeToggleBtn}
            >
              <Image source={themeIcon} style={[styles.themeIcon, { tintColor: colors.icon }]} />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={[styles.descriptionText, { color: colors.textBody }]}>
          Gerencie sua conta, visualize sua atividade e fale conosco.
        </Text>

        <View
          style={[
            styles.premiumBox,
            { backgroundColor: colors.accent },
          ]}
        >
          <TouchableOpacity style={styles.premiumIconBtn} activeOpacity={0.8}>
            <Image
              source={require("../../assets_icons/seguir.png")}
              style={[styles.premiumIcon, { tintColor: colors.accentText }]}
            />
          </TouchableOpacity>

          <Text style={[styles.premiumText, { color: colors.accentText }]}>
            Plano premium
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickScrollContent}
          style={styles.quickScroll}
        >
          {[
            { name: "Sugestões", screen: "Feedback" },
            { name: "Contatos", screen: "Contato" },
            { name: "Sobre nós", screen: "SobreNos" },
            { name: "Termos", screen: "TermosDois" },
          ].map((item) => (
            <TouchableOpacity
              key={item.name}
              style={[
                styles.quickChip,
                { backgroundColor: colors.chipBg },
              ]}
              onPress={() => navigation.navigate(item.screen)}
              activeOpacity={0.8}
            >
              <Text style={[styles.quickChipText, { color: colors.textPrimary }]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Gerenciar conta
        </Text>

        <View style={styles.gridWrapper}>
          {[
            { label: "Perfil", screen: "EditarPerfil" },
            { label: "Atividade", screen: "Historico" },
            { label: "Administrar", screen: "AdmConta" },
            { label: "Serviços", screen: "Servicos" },
          ].map((item, i) => (
            <TouchableOpacity
              key={item.label}
              style={[
                styles.gridCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
                i % 2 === 1 && { marginRight: 0 },
              ]}
              activeOpacity={0.8}
              onPress={() => navigation.navigate(item.screen)}
            >
              <View
                style={[
                  styles.gridIconWrapper,
                  { backgroundColor: colors.input },
                ]}
              >
                <Image
                  source={require("../../assets_icons/icon_favorite.png")}
                  style={[styles.gridIcon, { tintColor: colors.icon }]}
                />
              </View>
              <Text style={[styles.gridTitle, { color: colors.textPrimary }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.logoutButton,
            { backgroundColor: colors.chipBg },
            algumCarregando && { opacity: 0.6 },
          ]}
          activeOpacity={0.8}
          disabled={algumCarregando}
          onPress={() =>
            abrirModal(
              "Você deseja finalizar a sessão?",
              "logout",
              async () => {
                try {
                  await logout?.();
                } catch (e) {}
                navigation.reset({
                  index: 0,
                  routes: [{ name: "Login" }],
                });
              }
            )
          }
        >
          {loadingLogout ? (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <ActivityIndicator size="small" color={colors.icon} />
              <Text
                style={[
                  styles.logoutButtonText,
                  { marginLeft: 8, color: colors.textPrimary },
                ]}
              >
                Finalizando...
              </Text>
            </View>
          ) : (
            <Text style={[styles.logoutButtonText, { color: colors.textPrimary }]}>
              Finalizar sessão
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.deleteButton,
            {
              borderColor: colors.danger,
            },
            algumCarregando && { opacity: 0.6 },
          ]}
          activeOpacity={0.8}
          disabled={algumCarregando}
          onPress={() =>
            abrirModal(
              "Você realmente deseja excluir sua conta?",
              "delete",
              async () => {
                try {
                  await deleteAccount?.();
                } catch (e) {}
                navigation.reset({
                  index: 0,
                  routes: [{ name: "Login" }],
                });
              }
            )
          }
        >
          {loadingDelete ? (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <ActivityIndicator size="small" color={colors.danger} />
              <Text
                style={[
                  styles.deleteButtonText,
                  { marginLeft: 8, color: colors.danger },
                ]}
              >
                Apagando...
              </Text>
            </View>
          ) : (
            <Text style={[styles.deleteButtonText, { color: colors.danger }]}>
              Excluir conta
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <LinearGradient
        colors={
          isDark
            ? ["rgba(0,0,0,0)", "rgba(0,0,0,0.8)"]
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
          style={styles.navbarWrapper}
          pointerEvents="box-none"
        >
          <View
            style={[
              styles.navbar,
              {
                backgroundColor: colors.card,
                borderColor: colors.navBorder,
              },
            ]}
          >
            {[
              {
                name: "Início",
                icon: require("../../assets_icons/inicio_icon.png"),
                screen: "Inicio",
              },
              {
                name: "Sessão",
                icon: require("../../assets_icons/tarefas_icon.png"),
                screen: "TelaTarefas",
              },
              {
                name: "Artigos",
                icon: require("../../assets_icons/artigo_icon.png"),
                screen: "TelaArtigos",
              },
              {
                name: "Definições",
                icon: require("../../assets_icons/config_icon.png"),
                screen: "TelaDefinicoes",
              },
            ].map((item) => {
              const active = item.name === "Definições";
              return (
                <TouchableOpacity
                  key={item.name}
                  style={styles.navItem}
                  onPress={() => navigation.navigate(item.screen)}
                >
                  <Image
                    source={item.icon}
                    resizeMode="contain"
                    style={[
                      styles.navIcon,
                      {
                        tintColor: active ? colors.accent : colors.icon,
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.navText,
                      {
                        color: active ? colors.accent : colors.textPrimary,
                      },
                    ]}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </BlurView>
      </LinearGradient>

      <Modal transparent visible={modalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <BlurView
            intensity={100}
            tint={isDark ? "dark" : "light"}
            style={StyleSheet.absoluteFill}
          />
          <View
            style={[
              styles.modalBox,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              {modalText}
            </Text>
            <Text style={[styles.modalSubtitle, { color: colors.textBody }]}>
              Essa confirmação ajuda a manter sua conta segura.
            </Text>

            <TouchableOpacity
              style={[
                styles.modalActionBtn,
                { backgroundColor: colors.accent },
              ]}
              onPress={confirmarAcao}
              disabled={algumCarregando}
            >
              <Text style={[styles.modalActionTextLight, { color: colors.accentText }]}>
                Sim, confirmar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modalActionBtn,
                { backgroundColor: colors.chipBg },
              ]}
              onPress={cancelarAcao}
              disabled={algumCarregando}
            >
              <Text style={[styles.modalActionTextDark, { color: colors.textPrimary }]}>
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 260,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  themeToggleBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  themeIcon: {
    width: 26,
    height: 26,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  avatarImage: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  userName: {
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    marginLeft: 14,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "Poppins_400Regular",
    marginBottom: 16,
  },
  premiumBox: {
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 20,
    minHeight: 120,
    justifyContent: "flex-start",
  },
  premiumIconBtn: {
    position: "absolute",
    top: 10,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  premiumIcon: {
    width: 18,
    height: 18,
  },
  premiumText: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
  },
  quickScroll: {
    marginBottom: 28,
  },
  quickScrollContent: {
    paddingRight: 8,
  },
  quickChip: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  quickChipText: {
    fontSize: 12,
    fontFamily: "Poppins_700Bold",
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    marginBottom: 16,
  },
  gridWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 32,
  },
  gridCard: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    marginRight: 12,
    justifyContent: "flex-start",
    borderWidth: 1,
    elevation: 2,
  },
  gridIconWrapper: {
    width: 30,
    height: 30,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  gridIcon: {
    width: 18,
    height: 18,
  },
  gridTitle: {
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
  },
  logoutButton: {
    width: "100%",
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  logoutButtonText: {
    fontSize: 15,
    fontFamily: "Poppins_700Bold",
  },
  deleteButton: {
    width: "100%",
    borderWidth: 2,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 24,
  },
  deleteButtonText: {
    fontSize: 15,
    fontFamily: "Poppins_700Bold",
  },
  gradientWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  navbarWrapper: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderWidth: 1,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  navIcon: {
    width: 28,
    height: 28,
    marginBottom: 6,
  },
  navText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    borderRadius: 20,
    padding: 24,
    width: "85%",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 17,
    fontFamily: "Poppins_700Bold",
    marginBottom: 6,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    marginBottom: 18,
    textAlign: "center",
  },
  modalActionBtn: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 8,
  },
  modalActionTextLight: {
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
  },
  modalActionTextDark: {
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
  },
});
