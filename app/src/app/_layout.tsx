import "../global.css";
import { Tabs } from "expo-router";

export default function Layout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: "Início" }} />
      <Tabs.Screen name="autocuidado" options={{ title: "Autocuidado" }} />
      <Tabs.Screen name="conversa" options={{ title: "Conversa" }} />
      <Tabs.Screen name="perfil" options={{ title: "Perfil" }} />
    </Tabs>
  );
}
