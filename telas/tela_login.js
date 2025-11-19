import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";

export default function TelaLogin() {
  const navigation = useNavigation();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erroEmail, setErroEmail] = useState("");
  const [erroSenha, setErroSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const validarEmail = (e) => /\S+@\S+\.\S+/.test(e);
  const emailValido = validarEmail(email);
  const botaoHabilitado = emailValido && senha.length > 0 && !loading;

  const handleLogin = async () => {
    setErroEmail("");
    setErroSenha("");

    if (!emailValido || loading) {
      if (!emailValido) {
        setErroEmail("Digite um e-mail válido");
      }
      return;
    }

    setLoading(true);

    try {
      await login({ email, password: senha });

      navigation.reset({
        index: 0,
        routes: [{ name: "App" }],
      });
    } catch (e) {
      if (e.message === "USER_NOT_FOUND") {
        setErroEmail("Nenhuma conta encontrada com este e-mail");
      } else if (e.message === "WRONG_PASSWORD") {
        setErroSenha("Senha incorreta");
      } else {
        setErroEmail("Erro inesperado ao entrar. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flexContainer}
      behavior={Platform.OS === "ios" ? "padding" : "padding"}
      keyboardVerticalOffset={20}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Entrar</Text>

          <View style={styles.imageContainer}>
            <Image
              source={require("../assets_images/clock.png")}
              style={styles.image}
              resizeMode="contain"
            />
          </View>

          <View style={styles.bottomContainer}>
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              placeholder="Digite seu e-mail"
              placeholderTextColor="#888"
              style={styles.input}
              value={email}
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={(t) => {
                setEmail(t);
                setErroEmail("");
              }}
            />
            {!!erroEmail && <Text style={styles.erroText}>{erroEmail}</Text>}

            <Text style={styles.label}>Senha</Text>
            <View style={styles.inputSenhaContainer}>
              <TextInput
                placeholder="Digite sua senha"
                placeholderTextColor="#888"
                secureTextEntry={!mostrarSenha}
                value={senha}
                onChangeText={(t) => {
                  setSenha(t);
                  setErroSenha("");
                }}
                style={styles.inputSenha}
              />
              <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)}>
                <Ionicons
                  name={mostrarSenha ? "eye-off" : "eye"}
                  size={20}
                  color="#888"
                />
              </TouchableOpacity>
            </View>

            {!!erroSenha && <Text style={styles.erroText}>{erroSenha}</Text>}

            <TouchableOpacity
              onPress={() => navigation.navigate("RedefinirSenha")}
            >
              <Text style={styles.esqueceuSenha}>Esqueci minha senha</Text>
            </TouchableOpacity>

            <View style={{ height: 20 }} />

            <TouchableOpacity
              style={[
                styles.botaoFinalizar,
                !botaoHabilitado && { opacity: 0.5 },
              ]}
              disabled={!botaoHabilitado}
              onPress={handleLogin}
            >
              {loading ? (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text
                    style={[
                      styles.textoBotaoFinalizar,
                      { marginLeft: 8 },
                    ]}
                  >
                    Entrando...
                  </Text>
                </View>
              ) : (
                <Text style={styles.textoBotaoFinalizar}>Finalizar</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.botaoCadastrar}
              onPress={() => navigation.navigate("Cadastro")}
              disabled={loading}
            >
              <Text style={styles.textoBotaoCadastrar}>Não tem conta?</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 64,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 23,
    color: "#1F1F1F",
    fontFamily: "Poppins_700Bold",
    marginBottom: 12,
  },
  imageContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  image: {
    width: width * 0.85,
    height: height * 0.28,
  },
  bottomContainer: {
    marginTop: 20,
  },
  label: {
    color: "#1F1F1F",
    fontSize: 12,
    marginBottom: 6,
    fontFamily: "Poppins_400Regular",
  },
  input: {
    backgroundColor: "#E9E9E9",
    color: "#1F1F1F",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 6,
    fontSize: 12,
  },
  inputSenhaContainer: {
    backgroundColor: "#E9E9E9",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 6,
  },
  inputSenha: {
    flex: 1,
    color: "#1F1F1F",
    fontSize: 12,
    paddingVertical: 12,
    marginRight: 6,
  },
  erroText: {
    color: "#FF4D6D",
    fontSize: 11,
    marginBottom: 8,
    fontFamily: "Poppins_400Regular",
  },
  esqueceuSenha: {
    fontSize: 12,
    color: "#1F1F1F",
    textAlign: "right",
    fontFamily: "Poppins_400Regular",
    marginTop: -4,
    textDecorationLine: "underline",
  },
  botaoFinalizar: {
    backgroundColor: "#FF0F7B",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
    marginTop: 20,
  },
  textoBotaoFinalizar: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
  },
  botaoCadastrar: {
    borderColor: "#FF0F7B",
    borderWidth: 2,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
  },
  textoBotaoCadastrar: {
    color: "#FF0F7B",
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
  },
});
