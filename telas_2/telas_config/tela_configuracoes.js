import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Modal,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import { Inter_400Regular } from "@expo-google-fonts/inter";

import { useAuth } from "../../contexts/AuthContext";

const { width } = Dimensions.get("window");
const CARD_SIZE = (width - 48 - 12) / 2;

export default function TelaDefinicoes() {
  const navigation = useNavigation();
  const [selected] = useState("Definições");

  const [modalVisible, setModalVisible] = useState(false);
  const [modalText, setModalText] = useState("");
  const [modalAction, setModalAction] = useState(null);

  const auth = useAuth() || {};
  const { currentUser, logout, deleteAccount } = auth;

  const displayName = currentUser?.username || "Nome do usuário";
  const avatarUri = currentUser?.avatarUri || null;

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
    Inter_400Regular,
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: "#f6f6f6" }} />;
  }

  function abrirModal(text, action) {
    setModalText(text);
    setModalAction(() => action);
    setModalVisible(true);
  }

  function confirmarAcao() {
    setModalVisible(false);
    if (modalAction) modalAction();
  }

  function cancelarAcao() {
    setModalVisible(false);
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar} />
            )}
            <Text style={styles.userName}>Olá, {displayName}</Text>
          </View>
        </View>

        <Text style={styles.descriptionText}>
          Gerencie sua conta, visualize sua atividade e fale conosco.
        </Text>

        <View style={styles.premiumBox}>
          <TouchableOpacity style={styles.premiumIconBtn} activeOpacity={0.8}>
            <Image
              source={require("../../assets_icons/seguir.png")}
              style={styles.premiumIcon}
            />
          </TouchableOpacity>

          <Text style={styles.premiumText}>Plano premium</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickScrollContent}
          style={styles.quickScroll}
        >
          <TouchableOpacity
            style={styles.quickChip}
            onPress={() => navigation.navigate("Feedback")}
            activeOpacity={0.8}
          >
            <Text style={styles.quickChipText}>Sugestões</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickChip}
            onPress={() => navigation.navigate("Contato")}
            activeOpacity={0.8}
          >
            <Text style={styles.quickChipText}>Contatos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickChip}
            onPress={() => navigation.navigate("SobreNos")}
            activeOpacity={0.8}
          >
            <Text style={styles.quickChipText}>Sobre nós</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickChip}
            onPress={() => navigation.navigate("TermosDois")}
            activeOpacity={0.8}
          >
            <Text style={styles.quickChipText}>Termos</Text>
          </TouchableOpacity>
        </ScrollView>

        <Text style={styles.sectionTitle}>Gerenciar conta</Text>

        <View style={styles.gridWrapper}>
          <TouchableOpacity
            style={styles.gridCard}
            activeOpacity={0.8}
            onPress={() => navigation.navigate("EditarPerfil")}
          >
            <View style={styles.gridIconWrapper}>
              <Image
                source={require("../../assets_icons/icon_favorite.png")}
                style={styles.gridIcon}
              />
            </View>
            <Text style={styles.gridTitle}>Perfil</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.gridCard, { marginRight: 0 }]}
            activeOpacity={0.8}
            onPress={() => navigation.navigate("Historico")}
          >
            <View style={styles.gridIconWrapper}>
              <Image
                source={require("../../assets_icons/icon_favorite.png")}
                style={styles.gridIcon}
              />
            </View>
            <Text style={styles.gridTitle}>Atividade</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridCard}
            activeOpacity={0.8}
            onPress={() => navigation.navigate("AdmConta")}
          >
            <View style={styles.gridIconWrapper}>
              <Image
                source={require("../../assets_icons/icon_favorite.png")}
                style={styles.gridIcon}
              />
            </View>
            <Text style={styles.gridTitle}>Administrar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.gridCard, { marginRight: 0 }]}
            activeOpacity={0.8}
            onPress={() => navigation.navigate("Servicos")}
          >
            <View style={styles.gridIconWrapper}>
              <Image
                source={require("../../assets_icons/icon_favorite.png")}
                style={styles.gridIcon}
              />
            </View>
            <Text style={styles.gridTitle}>Serviços</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.8}
          onPress={() =>
            abrirModal("Você deseja finalizar a sessão?", async () => {
              try {
                await logout?.();
              } catch (e) {
                console.log("Erro ao sair:", e);
              }
              navigation.reset({
                index: 0,
                routes: [{ name: "Login" }],
              });
            })
          }
        >
          <Text style={styles.logoutButtonText}>Finalizar sessão</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          activeOpacity={0.8}
          onPress={() =>
            abrirModal("Você realmente deseja excluir sua conta?", async () => {
              try {
                await deleteAccount?.();
              } catch (e) {
                console.log("Erro ao excluir conta:", e);
              }
              navigation.reset({
                index: 0,
                routes: [{ name: "Login" }],
              });
            })
          }
        >
          <Text style={styles.deleteButtonText}>Excluir conta</Text>
        </TouchableOpacity>
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
              {
                name: "Início",
                icon: require("../../assets_icons/inicio_icon.png"),
                screen: "Inicio",
              },
              {
                name: "Tarefas",
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
            ].map((item) => (
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
                    item.name === "Definições" && { tintColor: "#ff005c" },
                  ]}
                />
                <Text
                  style={[
                    styles.navText,
                    item.name === "Definições" && { color: "#ff005c" },
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </BlurView>
      </LinearGradient>

      <Modal transparent visible={modalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{modalText}</Text>
            <Text style={styles.modalSubtitle}>
              Essa confirmação ajuda a manter sua conta segura.
            </Text>

            <TouchableOpacity
              style={[styles.modalActionBtn, { backgroundColor: "#ff005c" }]}
              onPress={confirmarAcao}
            >
              <Text style={styles.modalActionTextLight}>Sim, confirmar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalActionBtn, { backgroundColor: "#e5e7eb" }]}
              onPress={cancelarAcao}
            >
              <Text style={styles.modalActionTextDark}>Cancelar</Text>
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
    backgroundColor: "#f6f6f6",
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
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#E5E7EB",
  },
  avatarImage: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  userName: {
    color: "#0F172A",
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    marginLeft: 14,
  },
  descriptionText: {
    color: "#4B5563",
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "Poppins_400Regular",
    marginBottom: 16,
  },
  premiumBox: {
    backgroundColor: "#ff005c",
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
    tintColor: "#fff",
  },
  premiumText: {
    color: "#fff",
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
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  quickChipText: {
    color: "#0F172A",
    fontSize: 12,
    fontFamily: "Poppins_700Bold",
  },
  sectionTitle: {
    color: "#0F172A",
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
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    marginRight: 12,
    justifyContent: "flex-start",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  gridIconWrapper: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  gridIcon: {
    width: 18,
    height: 18,
    tintColor: "#111827",
  },
  gridTitle: {
    color: "#0F172A",
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
  },
  logoutButton: {
    width: "100%",
    backgroundColor: "#E5E7EB",
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  logoutButtonText: {
    color: "#111827",
    fontSize: 15,
    fontFamily: "Poppins_700Bold",
  },
  deleteButton: {
    width: "100%",
    borderColor: "#EF4444",
    borderWidth: 2,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 24,
  },
  deleteButtonText: {
    color: "#EF4444",
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
    backgroundColor: "#ffffff",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#e6e6e6",
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  navIcon: {
    width: 28,
    height: 28,
    tintColor: "#0F172A",
    marginBottom: 6,
  },
  navText: {
    fontSize: 13,
    color: "#0F172A",
    fontFamily: "Inter_400Regular",
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 24,
    width: "85%",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    color: "#0F172A",
    fontSize: 17,
    fontFamily: "Poppins_700Bold",
    marginBottom: 6,
    textAlign: "center",
  },
  modalSubtitle: {
    color: "#4B5563",
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
    color: "#fff",
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
  },
  modalActionTextDark: {
    color: "#111827",
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
  },
});
