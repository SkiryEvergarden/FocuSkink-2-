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

export default function RelatorioInicio() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate("Inicio")}>
            <Image
              source={require("../assets_icons/arrow_icon.png")}
              style={styles.backIcon}
            />
          </TouchableOpacity>
          <Text style={styles.title}>Relatório de produtividade</Text>
        </View>

        <Text style={styles.subtitle}>
          Aqui você encontra um resumo do seu uso no aplicativo. Acompanhe suas
          atividades, veja seus progressos semanais e compare seus resultados
          para identificar onde pode melhorar.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Relatório geral da semana</Text>
          <Text style={styles.cardText}>
            Veja seus resultados de artigos, tarefas e sessões da última
            semana.
          </Text>
          <TouchableOpacity
            style={styles.smallButton}
            onPress={() => navigation.navigate("RelatorioNormal")}
          >
            <Text style={styles.smallButtonText}>Ver agora</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Comparar relatórios</Text>
          <Text style={styles.cardText}>
            Selecione dois relatórios semanais e compare os resultados para
            entender sua evolução ao longo do tempo.
          </Text>
          <TouchableOpacity
            style={styles.smallButton}
            onPress={() => navigation.navigate("RelatorioComparar")}
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
    paddingHorizontal: 24,
  },
  scroll: {
    paddingBottom: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 50,
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
    fontWeight: "700",
    color: "#0F172A",
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    marginBottom: 50,
    lineHeight: 22,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#e6e6e6",
  },
  cardTitle: {
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 14,
  },
  cardText: {
    color: "#4B5563",
    fontSize: 15,
    marginBottom: 20,
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
    fontSize: 14,
    fontWeight: "600",
  },
});
