import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";

import arrowIcon from "../../assets_icons/arrow_icon.png";

export default function HistoricoAtividade() {
  const navigation = useNavigation();

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

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
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image source={arrowIcon} style={styles.backIcon} />
          </TouchableOpacity>
          <Text style={styles.title}>Histórico de atividade</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Histórico de tarefas</Text>
          <Text style={styles.cardText}>
            Veja as tarefas que você realizou
          </Text>

          <TouchableOpacity
            style={styles.smallButton}
            onPress={() => navigation.navigate("HistoricoTarefa")}
            activeOpacity={0.9}
          >
            <Text style={styles.smallButtonText}>Ver agora</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Histórico de sessões</Text>
          <Text style={styles.cardText}>
            Veja as sessões que você realizou
          </Text>

          <TouchableOpacity
            style={styles.smallButton}
            onPress={() => navigation.navigate("HistoricoSessao")}
            activeOpacity={0.9}
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
            activeOpacity={0.9}
          >
            <Text style={styles.smallButtonText}>Ver agora</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f6f6",
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
    tintColor: "#0F172A",
  },
  title: {
    fontSize: 20,
    fontFamily: "Poppins_700Bold",
    color: "#0F172A",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e6e6e6",
  },
  cardTitle: {
    color: "#0F172A",
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    marginBottom: 8,
  },
  cardText: {
    color: "#4B5563",
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    marginBottom: 16,
    lineHeight: 22,
  },
  smallButton: {
    alignSelf: "flex-end",
    backgroundColor: "#ff005c",
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  smallButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontFamily: "Poppins_700Bold",
  },
});
