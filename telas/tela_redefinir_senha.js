import React, { useState } from "react";
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
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";

export default function TelaRedefinirSenha() {
  const navigation = useNavigation();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const emailValido = /\S+@\S+\.\S+/.test(email);

  const handleEnviarCodigo = async () => {
    if (!emailValido || loading) return;

    setErro("");
    setLoading(true);

    try {
      await resetPassword(email);
      setLoading(false);
      setModalVisible(true);
    } catch (e) {
      setLoading(false);
      if (e.message === "INVALID_EMAIL") {
        setErro("E-mail inválido. Verifique e tente novamente.");
      } else if (e.message === "USER_NOT_FOUND") {
        setErro("Nenhuma conta encontrada com esse e-mail.");
      } else {
        setErro("Não foi possível enviar o e-mail. Tente novamente.");
      }
    }
  };

  const handleContinuarModal = () => {
    setModalVisible(false);
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
      >
        <ScrollView
          style={{ flex: 1, backgroundColor: "#FFFFFF" }}
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
                Ao inserir seu e-mail no campo abaixo, enviaremos um link para
                redefinir sua senha.
              </Text>

              <Text style={styles.label}>E-mail</Text>
              <TextInput
                placeholder="Digite aqui"
                placeholderTextColor="#888"
                style={styles.input}
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  setErro("");
                }}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              {!emailValido && email.length > 0 && !erro && (
                <Text style={styles.erro}>Digite um e-mail válido</Text>
              )}

              {!!erro && <Text style={styles.erro}>{erro}</Text>}

              <TouchableOpacity
                style={[
                  styles.botaoFinalizar,
                  (!emailValido || loading) && { opacity: 0.5 },
                ]}
                disabled={!emailValido || loading}
                onPress={handleEnviarCodigo}
              >
                <Text style={styles.textoBotaoFinalizar}>
                  {loading ? "Enviando..." : "Confirmar e-mail"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        <Modal visible={modalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Verifique seu e-mail</Text>
              <Text style={styles.modalText}>
                Enviamos um link para redefinir sua senha. Acesse seu e-mail e
                siga as instruções para criar uma nova senha.
              </Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleContinuarModal}
              >
                <Text style={styles.modalButtonText}>Continuar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContainer: {
    width: width * 0.8,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    color: "#1F1F1F",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: "#6F6F6F",
    marginBottom: 20,
    lineHeight: 18,
  },
  modalButton: {
    backgroundColor: "#FF0F7B",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
  },
});
