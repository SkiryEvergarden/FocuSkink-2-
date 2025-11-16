import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  ScrollView,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";

const { width, height } = Dimensions.get("window");

const COLORS = {
  bg: "#FFFFFF",
  textDark: "#1F1F1F",
  gray: "#6F6F6F",
  pink: "#FF0F7B",
  outline: "#FF0F7B",
  pureWhite: "#FFFFFF",
};

export default function TelaIntroducao() {
  const navigation = useNavigation();
  const { currentUser } = useAuth();

  React.useEffect(() => {
    if (currentUser) {
      navigation.reset({
        index: 0,
        routes: [{ name: "App" }],
      });
    }
  }, [currentUser]);

  if (currentUser) return null;

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      style={{ backgroundColor: COLORS.bg }}
      keyboardShouldPersistTaps="handled"
    >
      <StatusBar barStyle="dark-content" />

      <View style={styles.topContainer}>
        <Text style={styles.title}>Bem-vindo ao</Text>
        <Text style={styles.subtitle}>FocuSkink</Text>
      </View>

      <View style={styles.imageContainer}>
        <Image
          source={require("../assets_images/clock.png")}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.textoPrincipal}>Bem vindo ao FocuSkink</Text>
        <Text style={styles.textoSecundario}>
          O aplicativo que te ajuda na organização dos estudos.
        </Text>
      </View>

      <View style={styles.botoesContainer}>
        <TouchableOpacity
          style={styles.botaoCadastrar}
          onPress={() => navigation.navigate("Cadastro")}
        >
          <Text style={styles.textoBotaoCadastrar}>Cadastrar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botaoEntrar}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.textoBotaoEntrar}>Entrar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 36,
  },
  topContainer: {
    alignItems: "center",
    marginBottom: 18,
  },
  title: {
    fontSize: 24,
    color: COLORS.textDark,
    fontFamily: "Poppins_700Bold",
  },
  subtitle: {
    fontSize: 26,
    color: COLORS.pink,
    fontFamily: "Poppins_700Bold",
    marginTop: 2,
  },
  imageContainer: { alignItems: "center", marginVertical: 8 },
  image: { width: width * 0.7, height: height * 0.32 },
  textContainer: { alignItems: "center", marginTop: 8 },
  textoPrincipal: {
    fontSize: 18,
    color: COLORS.textDark,
    fontFamily: "Poppins_700Bold",
    marginBottom: 6,
  },
  textoSecundario: {
    fontSize: 14,
    color: COLORS.gray,
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    paddingHorizontal: 12,
  },
  botoesContainer: { marginTop: 60 },
  botaoCadastrar: {
    backgroundColor: COLORS.pink,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  textoBotaoCadastrar: {
    color: COLORS.pureWhite,
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
  },
  botaoEntrar: {
    borderColor: COLORS.outline,
    borderWidth: 2,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  textoBotaoEntrar: {
    color: COLORS.pink,
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
  },
});
