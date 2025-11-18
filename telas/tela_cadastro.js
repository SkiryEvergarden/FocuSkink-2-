import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";

export default function TelaCadastro() {
  const navigation = useNavigation();
  const { signup } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [aceitaTermos, setAceitaTermos] = useState(false);

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

  const [erroEmailServidor, setErroEmailServidor] = useState("");
  const [erroGlobal, setErroGlobal] = useState("");
  const [loading, setLoading] = useState(false);

  const validarEmail = (e) =>
    /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,3}(\.[a-zA-Z]{2,3})?$/.test(e.trim());

  const emailValido = email.length > 0 && validarEmail(email);
  const senhaValida = senha.length >= 8;
  const senhasCoincidem =
    confirmarSenha.length > 0 && senha === confirmarSenha;

  const podeFinalizar =
    username.length > 0 &&
    emailValido &&
    senhaValida &&
    senhasCoincidem &&
    aceitaTermos;

  const handleFinalizar = async () => {
    if (!podeFinalizar || loading) return;

    setErroEmailServidor("");
    setErroGlobal("");
    setLoading(true);

    try {
      await signup({ username, email, password: senha });

      navigation.reset({
        index: 0,
        routes: [{ name: "App" }],
      });
    } catch (e) {
      if (e.message === "EMAIL_IN_USE") {
        setErroEmailServidor("E-mail já cadastrado");
      } else {
        setErroGlobal("Não foi possível cadastrar. Tente novamente.");
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
        bounces={false}
        overScrollMode="never"
      >
        <View style={styles.container}>
          <Text style={styles.titulo}>Cadastrar</Text>

          <View style={styles.conteudo}>
            <View style={styles.imagemCentral} />

            <Text style={styles.label}>Nome de usuário</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite aqui"
              placeholderTextColor="#888"
              value={username}
              onChangeText={(t) => {
                setUsername(t.slice(0, 30));
                setErroGlobal("");
              }}
            />
            {username.length === 0 && (
              <Text style={styles.erro}>Informe seu nome de usuário</Text>
            )}

            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite aqui"
              placeholderTextColor="#888"
              value={email}
              onChangeText={(t) => {
                setEmail(t.slice(0, 60));
                setErroEmailServidor("");
                setErroGlobal("");
              }}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {email.length > 0 && !emailValido && (
              <Text style={styles.erro}>Digite um e-mail válido</Text>
            )}
            {!!erroEmailServidor && (
              <Text style={styles.erro}>{erroEmailServidor}</Text>
            )}

            <Text style={styles.label}>Senha</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.inputSenha}
                placeholder="Digite aqui"
                placeholderTextColor="#888"
                secureTextEntry={!mostrarSenha}
                value={senha}
                onChangeText={(t) => {
                  setSenha(t);
                  setErroGlobal("");
                }}
              />
              <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)}>
                <Ionicons
                  name={mostrarSenha ? "eye-off" : "eye"}
                  size={20}
                  color="#888"
                />
              </TouchableOpacity>
            </View>
            {senha.length > 0 && !senhaValida && (
              <Text style={styles.erro}>
                A senha precisa ter no mínimo 8 caracteres
              </Text>
            )}

            <Text style={styles.label}>Confirmar senha</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.inputSenha}
                placeholder="Digite aqui"
                placeholderTextColor="#888"
                secureTextEntry={!mostrarConfirmarSenha}
                value={confirmarSenha}
                onChangeText={(t) => {
                  setConfirmarSenha(t);
                  setErroGlobal("");
                }}
              />
              <TouchableOpacity
                onPress={() =>
                  setMostrarConfirmarSenha(!mostrarConfirmarSenha)
                }
              >
                <Ionicons
                  name={mostrarConfirmarSenha ? "eye-off" : "eye"}
                  size={20}
                  color="#888"
                />
              </TouchableOpacity>
            </View>
            {confirmarSenha.length > 0 && !senhasCoincidem && (
              <Text style={styles.erro}>As senhas não coincidem</Text>
            )}

            <View style={styles.checkboxContainer}>
              <Pressable
                style={[styles.checkbox, aceitaTermos && styles.checkboxAtivo]}
                onPress={() => setAceitaTermos(!aceitaTermos)}
              />
              <Text style={styles.termosTexto}>
                Eu li e concordo com os{" "}
                <Text
                  style={styles.link}
                  onPress={() => navigation.navigate("Termos")}
                >
                  Termos de Adesão
                </Text>
              </Text>
            </View>

            {!!erroGlobal && (
              <Text style={[styles.erro, { marginTop: 0 }]}>{erroGlobal}</Text>
            )}

            <TouchableOpacity
              style={[
                styles.botaoFinalizar,
                (!podeFinalizar || loading) && { opacity: 0.5 },
              ]}
              onPress={handleFinalizar}
              disabled={!podeFinalizar || loading}
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
                    Cadastrando...
                  </Text>
                </View>
              ) : (
                <Text style={styles.textoBotaoFinalizar}>Finalizar</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.botaoEntrar}
              onPress={() => navigation.navigate("Login")}
            >
              <Text style={styles.textoBotaoEntrar}>Entrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    justifyContent: "flex-start",
    backgroundColor: "#FFFFFF",
  },
  titulo: {
    fontSize: 23,
    color: "#1F1F1F",
    fontFamily: "Poppins_700Bold",
    marginBottom: 10,
    textAlign: "left",
  },
  conteudo: {
    marginTop: -25,
  },
  imagemCentral: {
    width: width * 0.7,
    height: 100,
    alignSelf: "center",
    marginBottom: 14,
    borderRadius: 10,
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
    marginBottom: 10,
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
  },
  inputContainer: {
    backgroundColor: "#E9E9E9",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  inputSenha: {
    flex: 1,
    color: "#1F1F1F",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    paddingVertical: 12,
  },
  erro: {
    color: "#FF4D6D",
    fontSize: 11,
    marginTop: -4,
    marginBottom: 10,
    fontFamily: "Poppins_400Regular",
  },
  botaoFinalizar: {
    backgroundColor: "#FF0F7B",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 26,          // mais espaço acima
    marginBottom: 10,
    shadowColor: "#E10D6F",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  textoBotaoFinalizar: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
  },
  botaoEntrar: {
    borderColor: "#FF0F7B",
    borderWidth: 2,
    padding: 10,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "#FFFFFF",
  },
  textoBotaoEntrar: {
    color: "#FF0F7B",
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 22,      // mais espaço abaixo
    justifyContent: "center",
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#1F1F1F",
    marginRight: 8,
    backgroundColor: "#FFFFFF",
  },
  checkboxAtivo: {
    backgroundColor: "#FF0F7B",
    borderColor: "#FF0F7B",
  },
  termosTexto: {
    color: "#6F6F6F",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    flexShrink: 1,
  },
  link: {
    textDecorationLine: "underline",
    color: "#1F1F1F",
    fontFamily: "Poppins_400Regular",
  },
});
