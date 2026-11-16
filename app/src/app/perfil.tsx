import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import {calcularNivel,
  idadeEmDias,
  NOMES_TRACOS,
  Traco,
  usePet,
} from "@/store/pet";

const textoSecundario = "text-neutral-500 dark:text-neutral-400";
const campo = `border border-neutral-300 dark:border-neutral-600 rounded-lg p-3 `;

function Barra({ valor }: { valor: number }) {
  return (
    <View className="h-3 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
      <View className="h-full bg-emerald-500" style={{ width: `${Math.round(valor * 100)}%` }} />
    </View>
  );
}

export default function Perfil() {
  const pet = usePet();
  const { nivel, progresso } = calcularNivel(pet.vinculo);
  const aniversario = pet.criadoEm ? new Date(pet.criadoEm).toLocaleDateString("pt-BR") : "-";

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 28 }}>
      {/* SOBRE */}
      <View className="gap-3">
        <Text className={`text-2xl font-bold text-black`}>Sobre</Text>

        <Text className={textoSecundario}>Nome do pet</Text>
        <TextInput value={pet.nome} onChangeText={pet.setNome} className={campo} />

        <Text className={textoSecundario}>Seu nome</Text>
        <TextInput
          value={pet.nomeHumano}
          onChangeText={pet.setNomeHumano}
          placeholder="Como o pet deve te chamar?"
          placeholderTextColor="#999"
          className={campo}
        />

        <Text>Idade: {idadeEmDias(pet.criadoEm)} dias</Text>
        <Text >Aniversário: {aniversario}</Text>
        <Text >💎 Diamantes: {pet.diamantes}</Text>

        <Text className={`mt-2 font-bold text-black `}>Vínculo: nível {nivel}</Text>
        <Barra valor={progresso} />
      </View>

      {/* PERSONALIDADE */}
      <View className="gap-3">
        <Text className={`text-2xl font-bold text-black `}>Personalidade</Text>
        {(Object.keys(NOMES_TRACOS) as Traco[]).map((traco) => (
          <View key={traco} className="gap-1">
            <Text className={`text-black `}>
              {NOMES_TRACOS[traco]} — {pet.tracos[traco]}%
            </Text>
            <Barra valor={pet.tracos[traco] / 100} />
          </View>
        ))}
      </View>

      {/* MEMÓRIAS */}
      <View className="gap-3">
        <Text className={`text-2xl font-bold `}>Memórias</Text>
        <Text className={textoSecundario}>As memórias vão aparecer aqui depois das conversas.</Text>
      </View>

      {/* Botão provisório para testar a evolução */}
      <Pressable onPress={() => pet.registrarAtividade("reflexao")} className="p-3 rounded-lg bg-neutral-300">
        <Text className="text-center">Simular atividade (teste)</Text>
      </Pressable>
    </ScrollView>
  );
}