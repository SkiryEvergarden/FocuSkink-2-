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

export default function HistoricoAtividade() {
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

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image source={arrowIcon} style={styles.backIcon} />
          </TouchableOpacity>
          <Text style={styles.title}>Histórico de atividade</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Histórico de tarefas</Text>
          <Text style={styles.cardText}>
            Veja todas as tarefas realizadas
          </Text>

          <TouchableOpacity
            style={styles.smallButton}
            onPress={() => navigation.navigate("HistoricoTarefa")}
          >
            <Text style={styles.smallButtonText}>Ver agora</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Histórico de sessões</Text>
          <Text style={styles.cardText}>
            Acompanhe suas sessões concluídas
          </Text>

          <TouchableOpacity
            style={styles.smallButton}
            onPress={() => navigation.navigate("HistoricoSessao")}
          >
            <Text style={styles.smallButtonText}>Ver agora</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Histórico de leituras</Text>
          <Text style={styles.cardText}>
            Veja os artigos que você leu
          </Text>

          <TouchableOpacity
            style={styles.smallButton}
            onPress={() => navigation.navigate("HistoricoArtigo")}
          >
            <Text style={styles.smallButtonText}>Ver agora</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scroll: {
      paddingHorizontal: 24,
      paddingTop: 50,
      paddingBottom: 60,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 40,
    },
    backIcon: {
      width: 36,
      height: 36,
      marginRight: 16,
      tintColor: colors.icon,
    },
    title: {
      fontSize: 20,
      fontFamily: "Poppins_700Bold",
      color: colors.textTitle,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 24,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardTitle: {
      color: colors.textTitle,
      fontSize: 18,
      fontFamily: "Poppins_700Bold",
      marginBottom: 8,
    },
    cardText: {
      color: colors.textBody,
      fontSize: 14,
      fontFamily: "Poppins_400Regular",
      marginBottom: 16,
      lineHeight: 22,
    },
    smallButton: {
      alignSelf: "flex-end",
      backgroundColor: colors.accent,
      paddingVertical: 8,
      paddingHorizontal: 18,
      borderRadius: 8,
    },
    smallButtonText: {
      color: colors.accentText,
      fontSize: 13,
      fontFamily: "Poppins_700Bold",
    },
  });
}
