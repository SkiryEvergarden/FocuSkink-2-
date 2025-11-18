import {
  Poppins_400Regular,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { useNavigation } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import * as ImagePicker from "expo-image-picker";
import {
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import {
  ACHIEVEMENTS,
  useAchievements,
} from "../../contexts/AchievementsContext";
import { useAuth } from "../../contexts/AuthContext";
import { StreakContext } from "../../contexts/StreakContext";
import { useAppTheme } from "../../contexts/ThemeContext";

const { width } = Dimensions.get("window");
const CARD_W = (width - 24 * 2 - 12) / 2;

export default function TelaEditarPerfil() {
  const navigation = useNavigation();
  const { colors, isDark } = useAppTheme();

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

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
  const scrollRef = useRef(null);
  const styles = useMemo(() => makeStyles(colors), [colors]);

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
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    });
    return () => hide.remove();
  }, []);

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  const handlePickImage = async () => {
    const { status } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      alert("Permissão para acessar a galeria foi negada.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]?.uri) {
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

  const isUnlocked = (achievementId) =>
    unlockedAchievements.some((a) => a.id === achievementId);

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
          {/* HEADER */}
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

          {/* AVATAR */}
          <View style={styles.avatarWrap}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarBig} />
            ) : (
              <View style={styles.avatarBig} />
            )}

            {/* AQUI: icone sem tintColor exatamente como seu código original */}
            <TouchableOpacity
              style={styles.avatarEditPin}
              onPress={handlePickImage}
            >
              <Image
                source={require("../../assets_icons/iconmudarfoto.png")}
                style={styles.avatarEditIcon}
              />
            </TouchableOpacity>
          </View>

          {/* NOME */}
          <View style={styles.nameRow}>
            {editingName ? (
              <View style={styles.editNameBox}>
                <TextInput
                  style={styles.editNameInput}
                  value={username}
                  onChangeText={handleNameChange}
                  autoFocus
                  placeholder="Seu nome"
                  placeholderTextColor={colors.textMuted}
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

                {/* AQUI TAMBÉM: mesmo ícone, sem tintColor */}
                <TouchableOpacity
                  style={styles.editNameIconBtn}
                  onPress={() => setEditingName(true)}
                >
                  <Image
                    source={require("../../assets_icons/iconmudarfoto.png")}
                    style={styles.editNameIcon}
                  />
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* DESDE */}
          <View style={styles.sinceChip}>
            <Text style={styles.sinceChipText}>Usuário desde</Text>
            <Text style={styles.sinceYear}>2025</Text>
          </View>

          {/* CARD ESTATÍSTICAS */}
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

          {/* CONQUISTAS */}
          <Text style={styles.sectionTitle}>Conquistas</Text>

          <View style={styles.achievementsRow}>
            {ACHIEVEMENTS.map((ach) => {
              const unlocked = isUnlocked(ach.id);

              return (
                <TouchableOpacity
                  key={ach.id}
                  style={[
                    styles.achCard,
                    !unlocked && { opacity: 0.5 },
                  ]}
                  activeOpacity={0.9}
                  onPress={() =>
                    setAchievementDetail({ ...ach, isUnlocked: unlocked })
                  }
                >
                  <Image
                    source={ach.image}
                    style={styles.achThumb}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.achTitle} numberOfLines={2}>
                      {ach.title}
                    </Text>

                    <View style={styles.yearPill}>
                      <Text style={styles.yearPillText}>
                        {unlocked ? "Desbloqueada" : "Bloqueada"}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={{ height: 140 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* MODAL */}
      {achievementDetail && (
        <View style={styles.achievementOverlay}>
          <BlurView
            intensity={80}
            tint={isDark ? "dark" : "light"}
            style={StyleSheet.absoluteFillObject}
          />

          <TouchableWithoutFeedback
            onPress={() => setAchievementDetail(null)}
          >
            <View style={StyleSheet.absoluteFillObject} />
          </TouchableWithoutFeedback>

          <View style={styles.achievementModalBox}>
            <Text style={styles.achievementModalTitle}>
              {achievementDetail.isUnlocked
                ? "Conquista desbloqueada"
                : "Conquista bloqueada"}
            </Text>

            <Image
              source={achievementDetail.image}
              style={styles.achievementModalImage}
            />

            <Text style={styles.achievementModalName}>
              {achievementDetail.title}
            </Text>

            <Text style={styles.achievementModalDesc}>
              {achievementDetail.isUnlocked
                ? achievementDetail.description
                : `Para desbloquear esta conquista: ${achievementDetail.description}`}
            </Text>

            <TouchableOpacity
              style={styles.achievementModalButton}
              onPress={() => setAchievementDetail(null)}
            >
              <Text style={styles.achievementModalButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scroll: {
      paddingHorizontal: 24,
      paddingTop: 50,
      paddingBottom: 240,
    },

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
      tintColor: colors.icon,
    },
    headerTitle: {
      fontSize: 20,
      color: colors.textTitle,
      fontFamily: "Poppins_700Bold",
    },

    avatarWrap: {
      alignItems: "center",
      marginTop: 12,
      marginBottom: 16,
    },
    avatarBig: {
      width: 150,
      height: 150,
      borderRadius: 75,
      backgroundColor: colors.input,
    },

    avatarEditPin: {
      position: "absolute",
      right: width / 2 - 150 / 2 + 16,
      bottom: 6,
      transform: [{ translateX: 150 / 2 - 22 }],
      backgroundColor: "transparent",
    },
    avatarEditIcon: {
      width: 26,
      height: 26,
      backgroundColor: "transparent",
      padding: 0,
    },
    nameRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 6,
    },
    username: {
      color: colors.textPrimary,
      fontSize: 18,
      fontFamily: "Poppins_700Bold",
      textAlign: "center",
    },
    editNameIconBtn: {
      marginLeft: 8,
    },
    editNameIcon: {
      width: 22,
      height: 22,
    },

    editNameBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    editNameInput: {
      minWidth: 180,
      paddingHorizontal: 10,
      paddingVertical: 8,
      backgroundColor: colors.input,
      color: colors.textPrimary,
      borderRadius: 8,
      fontFamily: "Poppins_400Regular",
      fontSize: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    saveNameBtn: {
      backgroundColor: colors.accent,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
    },
    saveNameText: {
      color: colors.accentText,
      fontFamily: "Poppins_700Bold",
      fontSize: 12,
    },

    sinceChip: {
      alignSelf: "center",
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: colors.badgeBg,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 10,
      marginBottom: 18,
      borderWidth: 1,
      borderColor: colors.softBorder,
    },
    sinceChipText: {
      color: colors.textSecondary,
      fontFamily: "Poppins_400Regular",
      fontSize: 12,
    },
    sinceYear: {
      color: colors.textPrimary,
      fontFamily: "Poppins_700Bold",
      fontSize: 12,
      backgroundColor: colors.card,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },

    statsCard: {
      marginTop: 6,
      marginBottom: 20,
      marginHorizontal: 4,
      backgroundColor: colors.card,
      borderRadius: 14,
      paddingVertical: 14,
      paddingHorizontal: 16,
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
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
      backgroundColor: colors.input,
    },
    statNumberPink: {
      color: colors.accent,
      fontSize: 18,
      fontFamily: "Poppins_700Bold",
    },
    statLabel: {
      color: colors.textSecondary,
      fontSize: 12,
      marginTop: -2,
      fontFamily: "Poppins_400Regular",
    },
    vertDivider: {
      width: 1,
      height: 30,
      backgroundColor: colors.divider,
      marginHorizontal: 12,
      borderRadius: 1,
    },

    sectionTitle: {
      color: colors.textTitle,
      fontSize: 16,
      fontFamily: "Poppins_700Bold",
      marginBottom: 12,
      marginLeft: 2,
    },
    achievementsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    achCard: {
      width: CARD_W,
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 10,
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
    },
    achThumb: {
      width: 44,
      height: 44,
      borderRadius: 8,
      backgroundColor: colors.input,
      marginRight: 10,
    },
    achTitle: {
      color: colors.textPrimary,
      fontFamily: "Poppins_700Bold",
      fontSize: 12,
      marginBottom: 4,
    },
    yearPill: {
      alignSelf: "flex-start",
      backgroundColor: colors.badgeBg,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
    },
    yearPillText: {
      color: colors.textSecondary,
      fontFamily: "Poppins_400Regular",
      fontSize: 10,
    },

    achievementOverlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: "center",
      alignItems: "center",
    },
    achievementModalBox: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 24,
      width: "80%",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.softBorder,
    },
    achievementModalTitle: {
      color: colors.textTitle,
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
      color: colors.textTitle,
      fontSize: 15,
      fontFamily: "Poppins_700Bold",
      marginBottom: 6,
      textAlign: "center",
    },
    achievementModalDesc: {
      color: colors.textBody,
      fontSize: 13,
      fontFamily: "Poppins_400Regular",
      textAlign: "center",
      marginBottom: 16,
    },
    achievementModalButton: {
      backgroundColor: colors.accent,
      borderRadius: 12,
      paddingVertical: 10,
      paddingHorizontal: 22,
    },
    achievementModalButtonText: {
      color: colors.accentText,
      fontSize: 14,
      fontFamily: "Poppins_700Bold",
    },
  });
}
