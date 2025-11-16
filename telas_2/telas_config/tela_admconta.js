import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";

import arrowIcon from "../../assets_icons/arrow_icon.png";
import { useAuth } from "../../contexts/AuthContext";

function maskEmail(email) {
  if (!email) return "";
  const [local, domain] = email.split("@");
  if (!domain) return email;

  if (local.length <= 2) {
    return "*".repeat(local.length) + "@" + domain;
  }

  const visible = local.slice(0, 2);
  const hidden = "*".repeat(local.length - 2);
  return `${visible}${hidden}@${domain}`;
}

export default function TelaAdmConta() {
  const navigation = useNavigation();
  const { currentUser } = useAuth() || {};

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: "#f6f6f6" }} />;
  }

  const emailMasked = maskEmail(currentUser?.email || "");
  const passwordMasked = "********"; // solução 1: sempre mostrar 8 asteriscos

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
          >
            <Image source={arrowIcon} style={styles.backIcon} />
          </TouchableOpacity>
          <Text style={styles.title}>Administrar conta</Text>
        </View>

        <Text style={styles.subtitle}>
          Consulte e gerencie seus dados principais de acesso. Em versões
          futuras, você poderá editar essas informações aqui.
        </Text>

        <Text style={styles.label}>E-mail</Text>
        <TextInput style={styles.input} value={emailMasked} editable={false} />

        <Text style={styles.label}>Senha</Text>
        <TextInput
          style={styles.input}
          value={passwordMasked}
          secureTextEntry
          editable={false}
        />
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
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 40,
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
    tintColor: "#0F172A",
  },
  title: {
    fontSize: 20,
    color: "#0F172A",
    fontFamily: "Poppins_700Bold",
  },
  subtitle: {
    fontSize: 13,
    color: "#4B5563",
    fontFamily: "Poppins_400Regular",
    marginBottom: 28,
    lineHeight: 20,
  },
  label: {
    fontSize: 14,
    color: "#0F172A",
    fontFamily: "Poppins_700Bold",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#ededed",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "#0F172A",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e6e6e6",
  },
});
