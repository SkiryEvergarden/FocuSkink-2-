import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Linking,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";

import arrowIcon from "../../assets_icons/arrow_icon.png";

export default function TelaFeedback() {
  const navigation = useNavigation();
  const [feedback, setFeedback] = useState("");

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: "#f6f6f6" }} />;
  }

  const handleEnviar = async () => {
    if (!feedback.trim()) {
      Alert.alert("Ops", "Por favor, escreva seu feedback antes de enviar.");
      return;
    }

    const email = "focuskink.12@gmail.com";
    const subject = encodeURIComponent("Feedback do aplicativo");
    const body = encodeURIComponent(feedback);

    const url = `mailto:${email}?subject=${subject}&body=${body}`;

    try {
      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) {
        Alert.alert(
          "Erro",
          "Não foi possível abrir o aplicativo de e-mail neste dispositivo."
        );
        return;
      }

      await Linking.openURL(url);
      navigation.goBack();
    } catch (e) {
      console.log("Erro ao tentar abrir o e-mail:", e);
      Alert.alert(
        "Erro",
        "Ocorreu um problema ao tentar enviar o feedback. Tente novamente."
      );
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Image source={arrowIcon} style={styles.backIcon} />
            </TouchableOpacity>
            <Text style={styles.title}>Feedback e sugestões</Text>
          </View>

          <Text style={styles.subtitle}>
            Conte pra gente o que você achou do aplicativo, o que está
            funcionando bem e o que podemos melhorar.
          </Text>

          <Text style={styles.label}>Insira seu feedback abaixo:</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite aqui"
            placeholderTextColor="#9CA3AF"
            value={feedback}
            onChangeText={setFeedback}
            multiline
          />

          <Text style={styles.subtexto}>
            Desde já agradecemos o seu feedback! Estamos sempre trabalhando para
            melhorar sua experiência.
          </Text>

          <TouchableOpacity
            style={styles.botaoFinalizar}
            onPress={handleEnviar}
            activeOpacity={0.9}
          >
            <Text style={styles.textoBotaoFinalizar}>Enviar e sair</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
    marginBottom: 20,
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
    color: "#0F172A",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 20,
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    minHeight: 120,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#e6e6e6",
  },
  subtexto: {
    fontSize: 12,
    color: "#6B7280",
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 24,
  },
  botaoFinalizar: {
    backgroundColor: "#ff005c",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  textoBotaoFinalizar: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Poppins_700Bold",
  },
});
