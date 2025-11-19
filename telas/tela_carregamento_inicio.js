import { ResizeMode, Video } from "expo-av";
import { useEffect, useRef, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { useAppTheme } from "../contexts/ThemeContext";

export default function Tela_carregamento_inicio({ navigation }) {
  const videoRef = useRef(null);
  const { currentUser, initializing } = useAuth();
  const { isDark } = useAppTheme();

  const [resolvedDark, setResolvedDark] = useState(null);

  useEffect(() => {
    if (!initializing && resolvedDark === null) {
      if (currentUser) {
        setResolvedDark(isDark);
      } else {
        setResolvedDark(false);
      }
    }
  }, [initializing, currentUser, isDark, resolvedDark]);

  useEffect(() => {
    if (resolvedDark === null) return;

    const timer = setTimeout(() => {
      if (currentUser) {
        navigation.replace("App");
      } else {
        navigation.replace("Introducao");
      }
    }, 2200);

    return () => clearTimeout(timer);
  }, [resolvedDark, currentUser, navigation]);

  if (resolvedDark === null) {
    return <View style={{ flex: 1, backgroundColor: "#ffffff" }} />;
  }

  const videoSource = resolvedDark
    ? require("../assets_videos/focusanimation_b.mp4")   // escuro
    : require("../assets_videos/focuslalalala.mp4");     // claro

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: resolvedDark ? "#111111" : "#ffffff" }
      ]}
    >
      <Video
        ref={videoRef}
        source={videoSource}
        style={styles.video}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay
        isLooping={false}
        isMuted
      />
    </View>
  );
}

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  video: {
    width,
    height: height * 0.62
  }
});
