import {
  Poppins_400Regular,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { useNavigation } from "@react-navigation/native";
import { useMemo } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import arrowIcon from "../../assets_icons/arrow_icon.png";
import { useAuth } from "../../contexts/AuthContext";
import { useAppTheme } from "../../contexts/ThemeContext";

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
  const { colors } = useAppTheme();
  const { currentUser } = useAuth() || {};
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

  if (!fontsLoaded)
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;

  const emailMasked = maskEmail(currentUser?.email || "");
  const passwordMasked = "********";

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
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
        <TextInput style={styles.input} value={passwordMasked} secureTextEntry editable={false} />
      </ScrollView>
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
      marginBottom: 28,
      lineHeight: 20,
    },
    label: {
      fontSize: 14,
      color: colors.textTitle,
      fontFamily: "Poppins_700Bold",
      marginBottom: 8,
    },
    input: {
      backgroundColor: colors.input,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 14,
      fontSize: 14,
      fontFamily: "Poppins_400Regular",
      color: colors.textPrimary,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
  });
}
