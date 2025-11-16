import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function TelaRedefinirSenha() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const hideKeyboard = Keyboard.addListener("keyboardDidHide", () => {
      if (scrollRef.current)
        scrollRef.current.scrollTo({ y: 0, animated: true });
    });

    return () => hideKeyboard.remove();
  }, []);

  const emailValido = /\S+@\S+\.\S+/.test(email);

  const handleEnviarCodigo = () => {
    if (!emailValido) return;
    navigation.navigate("Codigo");
  };

  const scrollToInput = () => {
    if (scrollRef.current && inputRef.current) {
      inputRef.current.measureLayout(
        scrollRef.current.getInnerViewNode(),
        (x, y) => scrollRef.current.scrollTo({ y: y - 20, animated: true })
      );
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#141414" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
      >
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1, backgroundColor: "#141414" }}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
                activeOpacity={0.8}
              >
                <Image
                  source={require("../assets_icons/arrow_icon.png")}
                  style={styles.backIcon}
                />
              </TouchableOpacity>
              <Text style={styles.title}>Esqueci minha senha</Text>
            </View>

            <View style={styles.imageContainer}>
              <Image
                source={require("../assets_images/relog.png")}
                style={styles.image}
                resizeMode="contain"
              />
            </View>

            <View style={styles.content}>
              <Text style={styles.labelTopo}>Insira seu e-mail</Text>
              <Text style={styles.texto}>
                Ao inserir seu e-mail no campo abaixo, enviaremos um código para você.
              </Text>

              <Text style={styles.label}>E-mail</Text>
              <TextInput
                ref={inputRef}
                placeholder="Digite aqui"
                placeholderTextColor="#888"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={scrollToInput}
              />

              {!emailValido && email.length > 0 && (
                <Text style={styles.erro}>Digite um e-mail válido</Text>
              )}

              <TouchableOpacity
                style={[styles.botaoFinalizar, !emailValido && { opacity: 0.5 }]}
                disabled={!emailValido}
                onPress={handleEnviarCodigo}
              >
                <Text style={styles.textoBotaoFinalizar}>Confirmar e-mail</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 50,
    backgroundColor: "#FFFFFF",
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
    tintColor: "#1F1F1F",
  },
  title: {
    fontSize: 20,
    color: "#1F1F1F",
    fontFamily: "Poppins_700Bold",
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 35,
  },
  image: {
    width: 220,
    height: 220,
  },
  content: {
    flex: 1,
    justifyContent: "flex-start",
  },
  labelTopo: {
    fontSize: 16,
    color: "#1F1F1F",
    fontFamily: "Poppins_700Bold",
    marginBottom: 10,
  },
  texto: {
    fontSize: 12,
    color: "#6F6F6F",
    fontFamily: "Poppins_400Regular",
    marginBottom: 30,
    lineHeight: 18,
  },
  label: {
    color: "#1F1F1F",
    fontSize: 12,
    marginBottom: 6,
    fontFamily: "Poppins_700Bold",
  },
  input: {
    backgroundColor: "#E9E9E9",
    color: "#1F1F1F",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
  },
  erro: {
    color: "#FF4D6D",
    fontSize: 11,
    marginBottom: 16,
    fontFamily: "Poppins_400Regular",
  },
  botaoFinalizar: {
    backgroundColor: "#FF0F7B",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#E10D6F",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  textoBotaoFinalizar: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Poppins_700Bold",
  },
});
