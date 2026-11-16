import { useState } from "react";
import { Button, ScrollView, Text, TextInput, View } from "react-native";

const SERVIDOR = process.env.EXPO_PUBLIC_API_URL;

export default function Teste() {
  const [texto, setTexto] = useState("");
  const [resposta, setResposta] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function enviar() {
    setCarregando(true);
    setResposta("");
    try {
      const res = await fetch(`${SERVIDOR}/conversa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto }),
      });
      const dados = await res.json();
      setResposta(dados.resposta);
    } catch (erro) {
      setResposta(`Erro: ${String(erro)}`);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 24, gap: 12 }}>
      <TextInput
        value={texto}
        onChangeText={setTexto}
        placeholder="Fale com seu pet..."
        style={{ borderWidth: 1, borderRadius: 8, padding: 12, color: "#FFFFFF" }}
      />
      <Button title={carregando ? "Enviando..." : "Enviar"} onPress={enviar} disabled={carregando} />
      <View>
        <Text style={{ color: "#ffffff" }}>{resposta}</Text>
      </View>
    </ScrollView>
  );
}