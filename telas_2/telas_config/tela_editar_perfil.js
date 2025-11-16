import React, {
  useState,
  useRef,
  useEffect,
  useContext,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Dimensions,
  TouchableWithoutFeedback,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import * as ImagePicker from "expo-image-picker";
import { BlurView } from "expo-blur";

import { StreakContext } from "../../contexts/StreakContext";
import { useAchievements } from "../../contexts/AchievementsContext";
import { useAuth } from "../../contexts/AuthContext";

const { width } = Dimensions.get("window");
const CARD_W = (width - 24 * 2 - 12) / 2;

export default function TelaEditarPerfil() {
  const navigation = useNavigation();

  const { streakCount } = useContext(StreakContext);
  const achievementsCtx = useAchievements() || {};
  const { unlockedAchievements = [] } = achievementsCtx;

  const auth = useAuth() || {};
  const { currentUser, updateProfile } = auth;

  const [username, setUsername] = useState(
    currentUser?.username || "Nome de usuário"
  );
  const [editingName, setEditingName] = useState(false);
  const [avatarUri, setAvatarUri] = useState(currentUser?.avatarUri || null);
  const [achievementDetail, setAchievementDetail] = useState(null);

  const medals = unlockedAchievements.length;

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

  const scrollRef = useRef(null);

  useEffect(() => {
    if (currentUser?.username) {
      setUsername(currentUser.username);
    }
    if (currentUser?.avatarUri) {
      setAvatarUri(currentUser.avatarUri);
    }
  }, [currentUser]);

  useEffect(() => {
    const hide = Keyboard.addListener("keyboardDidHide", () => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ y: 0, animated: true });
      }
    });
    return () => hide.remove();
  }, []);

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: "#f6f6f6" }} />;
  }

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Permissão para acessar a galeria foi negada.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0]?.uri) {
      const uri = result.assets[0].uri;
      setAvatarUri(uri);

      try {
        await updateProfile?.({ avatarUri: uri });
      } catch (e) {
        console.log("Erro ao atualizar avatar:", e);
      }
    }
  };

  const handleNameChange = (text) => {
    setUsername(text.slice(0, 30));
  };

  const salvarNome = async () => {
    setEditingName(false);
    try {
      await updateProfile?.({ username });
    } catch (e) {
      console.log("Erro ao atualizar nome:", e);
    }
  };

  return (
    <View style={styles.screen}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Image
                source={require("../../assets_icons/arrow_icon.png")}
                style={styles.backIcon}
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Perfil</Text>
          </View>

          <View style={styles.avatarWrap}>
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                style={styles.avatarBig}
              />
            ) : (
              <View style={styles.avatarBig} />
            )}

            <TouchableOpacity
              style={styles.avatarEditPin}
              onPress={handlePickImage}
              activeOpacity={0.8}
            >
              <Image
                source={require("../../assets_icons/iconmudarfoto.png")}
                style={styles.avatarEditIcon}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.nameRow}>
            {editingName ? (
              <View style={styles.editNameBox}>
                <TextInput
                  style={styles.editNameInput}
                  value={username}
                  onChangeText={handleNameChange}
                  autoFocus
                  placeholder="Seu nome"
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity
                  style={styles.saveNameBtn}
                  onPress={salvarNome}
                >
                  <Text style={styles.saveNameText}>OK</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text style={styles.username}>{username}</Text>
                <TouchableOpacity
                  style={styles.editNameIconBtn}
                  onPress={() => setEditingName(true)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Image
                    source={require("../../assets_icons/iconmudarfoto.png")}
                    style={styles.editNameIcon}
                  />
                </TouchableOpacity>
              </>
            )}
          </View>

          <View style={styles.sinceChip}>
            <Text style={styles.sinceChipText}>Usuário desde</Text>
            <Text style={styles.sinceYear}>2025</Text>
          </View>

          <View style={styles.statsCard}>
            <View style={styles.statSide}>
              <View style={styles.whiteSquare} />
              <View>
                <Text style={styles.statNumberPink}>{streakCount}</Text>
                <Text style={styles.statLabel}>Sequência</Text>
              </View>
            </View>

            <View style={styles.vertDivider} />

            <View style={[styles.statSide, { justifyContent: "flex-start" }]}>
              <View style={styles.whiteSquare} />
              <View>
                <Text style={styles.statNumberPink}>{medals}</Text>
                <Text style={styles.statLabel}>Medalhas</Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Conquistas</Text>

          {unlockedAchievements.length === 0 ? (
            <Text style={styles.noAchievementsText}>
              Você ainda não conquistou medalhas. Continue usando o app para
              desbloquear conquistas!
            </Text>
          ) : (
            <View style={styles.achievementsRow}>
              {unlockedAchievements.map((ach) => (
                <TouchableOpacity
                  key={ach.id}
                  style={styles.achCard}
                  activeOpacity={0.9}
                  onPress={() => setAchievementDetail(ach)}
                >
                  <Image
                    source={ach.image}
                    style={styles.achThumb}
                    resizeMode="cover"
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.achTitle} numberOfLines={2}>
                      {ach.title}
                    </Text>
                    <View style={styles.yearPill}>
                      <Text style={styles.yearPillText}>
                        {ach.type === "streak" ? "Sequência" : "Tarefas"}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={{ height: 140 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {achievementDetail && (
        <View style={styles.achievementOverlay}>
          <BlurView
            intensity={80}
            tint="light"
            style={StyleSheet.absoluteFillObject}
          />
          <TouchableWithoutFeedback onPress={() => setAchievementDetail(null)}>
            <View style={StyleSheet.absoluteFillObject} />
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
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f6f6f6" },
  scroll: { paddingHorizontal: 24, paddingTop: 50, paddingBottom: 240 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    marginRight: 12,
  },
  backIcon: {
    width: 36,
    height: 36,
    tintColor: "#0F172A",
  },
  headerTitle: {
    fontSize: 20,
    color: "#0F172A",
    fontFamily: "Poppins_700Bold",
  },

  avatarWrap: { alignItems: "center", marginTop: 12, marginBottom: 16 },
  avatarBig: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#e4e4e4",
  },
  avatarEditPin: {
    position: "absolute",
    right: width / 2 - 150 / 2 + 16,
    bottom: 6,
    transform: [{ translateX: 150 / 2 - 22 }],
  },
  avatarEditIcon: {
    width: 26,
    height: 26,
  },

  nameRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  username: {
    color: "#0F172A",
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    textAlign: "center",
  },
  editNameIconBtn: { marginLeft: 8 },
  editNameIcon: { width: 22, height: 22 },

  editNameBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  editNameInput: {
    minWidth: 180,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#ededed",
    color: "#0F172A",
    borderRadius: 8,
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#e6e6e6",
  },
  saveNameBtn: {
    backgroundColor: "#ff005c",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveNameText: {
    color: "#ffffff",
    fontFamily: "Poppins_700Bold",
    fontSize: 12,
  },

  sinceChip: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#ededed",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#e4e4e4",
  },
  sinceChipText: {
    color: "#6B7280",
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
  },
  sinceYear: {
    color: "#0F172A",
    fontFamily: "Poppins_700Bold",
    fontSize: 12,
    backgroundColor: "#ffffff",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e6e6e6",
  },

  statsCard: {
    marginTop: 6,
    marginBottom: 20,
    marginHorizontal: 4,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e6e6e6",
  },
  statSide: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  whiteSquare: {
    width: 16,
    height: 16,
    borderRadius: 4,
    backgroundColor: "#ededed",
  },
  statNumberPink: {
    color: "#ff005c",
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    textAlignVertical: "center",
  },
  statLabel: {
    color: "#6B7280",
    fontSize: 12,
    marginTop: -2,
    fontFamily: "Poppins_400Regular",
  },
  vertDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#e5e5e5",
    marginHorizontal: 12,
    borderRadius: 1,
  },

  sectionTitle: {
    color: "#0F172A",
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    marginBottom: 12,
    marginLeft: 2,
    marginTop: 6,
  },
  noAchievementsText: {
    color: "#6B7280",
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    marginBottom: 20,
  },
  achievementsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  achCard: {
    width: CARD_W,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e6e6e6",
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  achThumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#ededed",
    marginRight: 10,
  },
  achTitle: {
    color: "#0F172A",
    fontFamily: "Poppins_700Bold",
    fontSize: 12,
    marginBottom: 4,
  },
  yearPill: {
    alignSelf: "flex-start",
    backgroundColor: "#ededed",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  yearPillText: {
    color: "#6B7280",
    fontFamily: "Poppins_400Regular",
    fontSize: 10,
  },

  achievementOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  achievementModalBox: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 24,
    width: "80%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  achievementModalTitle: {
    color: "#0F172A",
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    marginBottom: 10,
    textAlign: "center",
  },
  achievementModalImage: {
    width: 90,
    height: 90,
    borderRadius: 14,
    marginBottom: 12,
  },
  achievementModalName: {
    color: "#0F172A",
    fontSize: 15,
    fontFamily: "Poppins_700Bold",
    marginBottom: 6,
    textAlign: "center",
  },
  achievementModalDesc: {
    color: "#4B5563",
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    marginBottom: 16,
  },
  achievementModalButton: {
    backgroundColor: "#ff005c",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 22,
  },
  achievementModalButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
  },
});
