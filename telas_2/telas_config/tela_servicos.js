import {
  Poppins_400Regular,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { useNavigation } from "@react-navigation/native";
import { useMemo } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAppTheme } from "../../contexts/ThemeContext";

import arrowIcon from "../../assets_icons/arrow_icon.png";
import checkIcon from "../../assets_icons/iconcheckfs.png";

export default function TelaServicos() {
  const navigation = useNavigation();
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  const planoGratis = [
    "Técnica pomodoro simples",
    "Bloqueio ilimitados de apps",
    "Listas de tarefas limitadas",
    "Alertas básicos",
    "Músicas limitadas",
  ];

  const planoEssencial = [
    "Técnica pomodoro simples",
    "Bloqueio ilimitados de apps",
    "Listas de tarefas ilimitadas",
    "Alertas personalizados",
    "Músicas adicionais",
    "Relatórios semanais",
    "Suporte prioritário",
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Image source={arrowIcon} style={styles.backIcon} />
          </TouchableOpacity>
          <Text style={styles.title}>Serviços disponíveis</Text>
        </View>

        <Text style={styles.sectionTitle}>Versão gratuita</Text>
        {planoGratis.map((item, i) => (
          <View key={i} style={styles.item}>
            <Text style={styles.itemText}>{item}</Text>
            <Image source={checkIcon} style={[styles.checkIcon, { tintColor: colors.textMuted }]} />
          </View>
        ))}

        <Text style={styles.sectionTitlePremium}>
          Versão <Text style={{ color: colors.accent }}>Essencial</Text>
        </Text>
        {planoEssencial.map((item, i) => (
          <View key={i} style={styles.item}>
            <Text style={styles.itemText}>{item}</Text>
            <Image source={checkIcon} style={[styles.checkIcon, { tintColor: colors.accent }]} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { paddingHorizontal: 24, paddingTop: 50, paddingBottom: 100 },
    header: { flexDirection: "row", alignItems: "center", marginBottom: 30, paddingHorizontal: 4 },
    backButton: { marginRight: 12 },
    backIcon: { width: 36, height: 36, tintColor: colors.icon },
    title: { fontSize: 20, color: colors.textTitle, fontFamily: "Poppins_700Bold" },

    sectionTitle: {
      fontSize: 16,
      color: colors.textTitle,
      fontFamily: "Poppins_700Bold",
      marginBottom: 12,
    },
    sectionTitlePremium: {
      fontSize: 16,
      fontFamily: "Poppins_700Bold",
      marginTop: 24,
      marginBottom: 12,
      color: colors.textTitle,
    },

    item: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    itemText: {
      fontSize: 14,
      color: colors.textPrimary,
      fontFamily: "Poppins_400Regular",
      flex: 1,
      marginRight: 10,
    },
    checkIcon: { width: 24, height: 24 },
  });
}
