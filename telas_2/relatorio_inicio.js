import { useNavigation } from "@react-navigation/native";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "../contexts/ThemeContext";

export default function RelatorioInicio() {
  const navigation = useNavigation();
  const { colors } = useAppTheme();
  const s = styles(colors);

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.navigate("Inicio")}>
            <Image
              source={require("../assets_icons/arrow_icon.png")}
              style={s.backIcon}
            />
          </TouchableOpacity>
          <Text style={s.title}>Relatório de produtividade</Text>
        </View>

        <Text style={s.subtitle}>
          Aqui você encontra um resumo do seu uso no aplicativo. Acompanhe suas
          atividades, veja seus progressos semanais e compare seus resultados
          para identificar onde pode melhorar.
        </Text>

        <View style={s.card}>
          <Text style={s.cardTitle}>Relatório geral da semana</Text>
          <Text style={s.cardText}>
            Veja seus resultados de artigos, tarefas e sessões da última
            semana.
          </Text>
          <TouchableOpacity
            style={s.smallButton}
            onPress={() => navigation.navigate("RelatorioNormal")}
          >
            <Text style={s.smallButtonText}>Ver agora</Text>
          </TouchableOpacity>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Comparar relatórios</Text>
          <Text style={s.cardText}>
            Selecione dois relatórios semanais e compare os resultados para
            entender sua evolução ao longo do tempo.
          </Text>
          <TouchableOpacity
            style={s.smallButton}
            onPress={() => navigation.navigate("RelatorioComparar")}
          >
            <Text style={s.smallButtonText}>Ver agora</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
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
      tintColor: colors.icon,
    },
    title: {
      fontSize: 17,
      fontFamily: "Poppins_700Bold",
      color: colors.textTitle,
    },
    subtitle: {
      fontSize: 15,
      color: colors.textSecondary,
      marginBottom: 50,
      lineHeight: 22,
      fontFamily: "Poppins_400Regular",
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 24,
      marginBottom: 30,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardTitle: {
      color: colors.textTitle,
      fontSize: 18,
      fontFamily: "Poppins_700Bold",
      marginBottom: 14,
    },
    cardText: {
      color: colors.textBody,
      fontSize: 15,
      lineHeight: 22,
      marginBottom: 20,
      fontFamily: "Poppins_400Regular",
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
      fontSize: 14,
      fontFamily: "Poppins_700Bold",
    },
  });
