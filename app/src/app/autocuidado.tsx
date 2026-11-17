import { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

import { Respiracao } from "@/components/autocuidado/Respiracao";
import { TimerFoco } from "@/components/autocuidado/TimerFoco";
import { cartao, texto, textoSecundario } from "@/constants/estilos";

type IdAtividade = "timer" | "respiracao" | "reflexoes" | "afirmacoes";

const ATIVIDADES: { id: IdAtividade; emoji: string; titulo: string; descricao: string; emBreve?: boolean }[] = [
  { id: "timer", emoji: "⏱️", titulo: "Timer de foco", descricao: "Concentre-se por alguns minutos." },
  { id: "respiracao", emoji: "🌬️", titulo: "Respiração", descricao: "Três exercícios para acalmar a mente." },
  { id: "reflexoes", emoji: "📝", titulo: "Reflexões", descricao: "Escreva o que está pensando.", emBreve: true },
  { id: "afirmacoes", emoji: "🗣️", titulo: "Afirmações", descricao: "Repita frases positivas em voz alta.", emBreve: true },
];

export default function Autocuidado() {
  const [aberta, setAberta] = useState<IdAtividade | null>(null);
  const fechar = () => setAberta(null);

  return (
    <>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
        {ATIVIDADES.map((atividade) => (
          <Pressable
            key={atividade.id}
            onPress={() => !atividade.emBreve && setAberta(atividade.id)}
            className={`${cartao} flex-row items-center gap-4 ${atividade.emBreve ? "opacity-50" : ""}`}
          >
            <Text className="text-4xl">{atividade.emoji}</Text>
            <View className="flex-1">
              <Text className={`text-lg font-bold ${texto}`}>{atividade.titulo}</Text>
              <Text className={textoSecundario}>
                {atividade.emBreve ? "Em breve" : atividade.descricao}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      <Modal visible={aberta === "timer"} animationType="slide" onRequestClose={fechar}>
        <TimerFoco onFechar={fechar} />
      </Modal>

      <Modal visible={aberta === "respiracao"} animationType="slide" onRequestClose={fechar}>
        <Respiracao onFechar={fechar} />
      </Modal>
    </>
  );
}