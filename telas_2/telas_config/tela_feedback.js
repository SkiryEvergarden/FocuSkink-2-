import {
  Poppins_400Regular,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { useNavigation } from "@react-navigation/native";
import { useMemo, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAppTheme } from "../../contexts/ThemeContext";

import arrowIcon from "../../assets_icons/arrow_icon.png";

export default function TelaFeedback() {
  const navigation = useNavigation();
  const { colors } = useAppTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [feedback, setFeedback] = useState("");

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
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
      await Linking.openURL(url);
      navigation.goBack();
    } catch {
      Alert.alert(
        "Erro",
        "Não foi possível abrir um aplicativo de e-mail no dispositivo."
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
            Conte pra gente o que você achou do aplicativo.
          </Text>

          <Text style={styles.label}>Seu feedback:</Text>

          <TextInput
            style={styles.input}
            placeholder="Digite aqui"
            placeholderTextColor={colors.textMuted}
            value={feedback}
            onChangeText={setFeedback}
            multiline
          />

          <Text style={styles.subtexto}>
            Obrigado por nos ajudar a melhorar!
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

function makeStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
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
      tintColor: colors.icon,
    },
    title: {
      fontSize: 20,
      color: colors.textTitle,
      fontFamily: "Poppins_700Bold",
    },
    subtitle: {
      fontSize: 13,
      color: colors.textBody,
      fontFamily: "Poppins_400Regular",
      marginBottom: 20,
      lineHeight: 20,
    },
    label: {
      fontSize: 14,
      color: colors.textPrimary,
      fontFamily: "Poppins_700Bold",
      marginBottom: 8,
    },
    input: {
      backgroundColor: colors.input,
      color: colors.textPrimary,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 14,
      marginBottom: 20,
      fontSize: 14,
      fontFamily: "Poppins_400Regular",
      minHeight: 120,
      textAlignVertical: "top",
      borderWidth: 1,
      borderColor: colors.border,
    },
    subtexto: {
      fontSize: 12,
      color: colors.textSecondary,
      fontFamily: "Poppins_400Regular",
      textAlign: "center",
      lineHeight: 18,
      marginBottom: 24,
    },
    botaoFinalizar: {
      backgroundColor: colors.accent,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: "center",
    },
    textoBotaoFinalizar: {
      color: colors.accentText,
      fontSize: 15,
      fontFamily: "Poppins_700Bold",
    },
  });
}
