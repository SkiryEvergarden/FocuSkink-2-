import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";

import arrowIcon from "../../assets_icons/arrow_icon.png";
import checkIcon from "../../assets_icons/iconcheckfs.png";

export default function TelaServicos() {
  const navigation = useNavigation();

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: "#f6f6f6" }} />;
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
    "Listas de tarefas limitadas",
    "Alertas personalizados",
    "Músicas adicionais",
    "Relatórios semanais",
    "Suporte prioritário",
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.8}
          >
            <Image source={arrowIcon} style={styles.backIcon} />
          </TouchableOpacity>
          <Text style={styles.title}>Serviços disponíveis</Text>
        </View>

        <Text style={styles.secaoTitulo}>Versão gratuita</Text>
        {planoGratis.map((item, index) => (
          <View key={index} style={styles.planoItem}>
            <Text style={styles.planoTexto}>{item}</Text>
            <Image
              source={checkIcon}
              style={[styles.checkIcon, { tintColor: "#9CA3AF" }]}
              resizeMode="contain"
            />
          </View>
        ))}

        <Text style={styles.secaoTituloPremium}>
          Versão <Text style={{ color: "#ff005c" }}>Essencial</Text>
        </Text>
        {planoEssencial.map((item, index) => (
          <View key={index} style={styles.planoItem}>
            <Text style={styles.planoTexto}>{item}</Text>
            <Image
              source={checkIcon}
              style={[styles.checkIcon, { tintColor: "#ff005c" }]}
              resizeMode="contain"
            />
          </View>
        ))}
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
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
    paddingHorizontal: 4,
  },
  backButton: {
    marginRight: 12,
  },
  backIcon: {
    width: 36,
    height: 36,
    tintColor: "#0F172A",
  },
  title: {
    fontSize: 20,
    color: "#0F172A",
    fontFamily: "Poppins_700Bold",
  },
  secaoTitulo: {
    fontSize: 16,
    color: "#0F172A",
    fontFamily: "Poppins_700Bold",
    marginBottom: 12,
  },
  secaoTituloPremium: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    marginTop: 24,
    marginBottom: 12,
    color: "#0F172A",
  },
  planoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e6e6e6",
  },
  planoTexto: {
    fontSize: 14,
    color: "#0F172A",
    fontFamily: "Poppins_400Regular",
    flex: 1,
    marginRight: 10,
  },
  checkIcon: {
    width: 24,
    height: 24,
  },
});
