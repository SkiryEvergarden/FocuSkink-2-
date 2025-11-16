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

export default function TelaContato() {
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
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Image source={arrowIcon} style={styles.backIcon} />
          </TouchableOpacity>
          <Text style={styles.title}>Contatos</Text>
        </View>

        <Text style={styles.subtitle}>
          Entre em contato com nossa equipe pelos canais abaixo sempre que
          precisar de suporte ou tiver alguma sugestão.
        </Text>

        <Text style={styles.label}>E-mail</Text>
        <TextInput
          style={styles.input}
          value="focuskink.12@email.com"
          editable={false}
        />

        <Text style={styles.label}>Telefone</Text>
        <TextInput
          style={styles.input}
          value="+55 11 94599-3719"
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
