import * as Haptics from "expo-haptics";
import { useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { botaoPrincipal, opcao, texto, textoSecundario } from "@/constants/estilos";
import { usePet } from "@/store/pet";
import { TelaAtividade } from "./TelaAtividade";

type Fase = { nome: string; segundos: number; escala: number };
type TipoRespiracao = { id: string; nome: string; descricao: string; fases: Fase[] };

const PEQUENO = 0.5;
const GRANDE = 1;

const TIPOS: TipoRespiracao[] = [
  {
    id: "quadrada",
    nome: "Quadrada",
    descricao: "Para foco e equilíbrio.",
    fases: [
      { nome: "Inspire", segundos: 4, escala: GRANDE },
      { nome: "Segure", segundos: 4, escala: GRANDE },
      { nome: "Expire", segundos: 4, escala: PEQUENO },
      { nome: "Segure", segundos: 4, escala: PEQUENO },
    ],
  },
  {
    id: "478",
    nome: "4-7-8",
    descricao: "Para relaxar, por exemplo antes de dormir.",
    fases: [
      { nome: "Inspire", segundos: 4, escala: GRANDE },
      { nome: "Segure", segundos: 7, escala: GRANDE },
      { nome: "Expire", segundos: 8, escala: PEQUENO },
    ],
  },
  {
    id: "calma",
    nome: "Calma",
    descricao: "Para se acalmar rapidamente.",
    fases: [
      { nome: "Inspire", segundos: 4, escala: GRANDE },
      { nome: "Expire", segundos: 6, escala: PEQUENO },
    ],
  },
];

const DURACOES = [1, 3, 5]; // em minutos

export function Respiracao({ onFechar }: { onFechar: () => void }) {
  const [tipo, setTipo] = useState(TIPOS[0]);
  const [minutos, setMinutos] = useState(1);
  const [rodando, setRodando] = useState(false);
  const [indiceFase, setIndiceFase] = useState(0);
  const [contagem, setContagem] = useState(0);
  const [concluido, setConcluido] = useState(false);
  const fimRef = useRef(0);

  const escala = useSharedValue(PEQUENO);
  const estiloCirculo = useAnimatedStyle(() => ({
    transform: [{ scale: escala.value }],
  }));

  useEffect(() => {
    if (!rodando) return;

    const fase = tipo.fases[indiceFase];
    escala.value = withTiming(fase.escala, {
      duration: fase.segundos * 1000,
      easing: Easing.inOut(Easing.ease),
    });
    setContagem(fase.segundos);

    const relogio = setInterval(() => setContagem((atual) => Math.max(1, atual - 1)), 1000);

    const proximaFase = setTimeout(() => {
      const ultimaFase = indiceFase === tipo.fases.length - 1;
      if (ultimaFase && Date.now() >= fimRef.current) {
        concluir();
        return;
      }
      setIndiceFase((indiceFase + 1) % tipo.fases.length);
    }, fase.segundos * 1000);

    return () => {
      clearInterval(relogio);
      clearTimeout(proximaFase);
    };
  }, [rodando, indiceFase]);

  function iniciar() {
    fimRef.current = Date.now() + minutos * 60 * 1000;
    setIndiceFase(0);
    setConcluido(false);
    setRodando(true);
  }

  function parar() {
    setRodando(false);
    escala.value = withTiming(PEQUENO, { duration: 500 });
  }

  function concluir() {
    parar();
    setConcluido(true);
    usePet.getState().registrarAtividade("respiracao");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  return (
    <TelaAtividade titulo="Respiração" onFechar={onFechar}>
      {!rodando && (
        <View className="gap-4 mb-6">
          <View className="flex-row gap-2 justify-center">
            {TIPOS.map((opcaoTipo) => {
              const selecionado = tipo.id === opcaoTipo.id;
              return (
                <Pressable
                  key={opcaoTipo.id}
                  onPress={() => setTipo(opcaoTipo)}
                  className={`${opcao} ${selecionado ? "bg-emerald-500 border-emerald-500" : "border-neutral-400"}`}
                >
                  <Text className={selecionado ? "text-white font-bold" : texto}>{opcaoTipo.nome}</Text>
                </Pressable>
              );
            })}
          </View>
          <Text className={`text-center ${textoSecundario}`}>{tipo.descricao}</Text>

          <View className="flex-row gap-2 justify-center">
            {DURACOES.map((duracao) => {
              const selecionada = minutos === duracao;
              return (
                <Pressable
                  key={duracao}
                  onPress={() => setMinutos(duracao)}
                  className={`${opcao} ${selecionada ? "bg-emerald-500 border-emerald-500" : "border-neutral-400"}`}
                >
                  <Text className={selecionada ? "text-white font-bold" : texto}>{duracao} min</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      <View className="flex-1 items-center justify-center">
        <Animated.View
          style={[
            { width: 240, height: 240, borderRadius: 120, backgroundColor: "#10b981", opacity: 0.85 },
            estiloCirculo,
          ]}
        />
        <View className="absolute items-center">
          {rodando ? (
            <>
              <Text className="text-white text-3xl font-bold">{tipo.fases[indiceFase].nome}</Text>
              <Text className="text-white text-2xl">{contagem}</Text>
            </>
          ) : concluido ? (
            <Text className="text-white text-xl font-bold text-center px-6">Muito bem!</Text>
          ) : null}
        </View>
      </View>

      <View className="items-center mt-6">
        <Pressable onPress={rodando ? parar : iniciar} className={botaoPrincipal}>
          <Text className="text-white font-bold">{rodando ? "Parar" : "Começar"}</Text>
        </Pressable>
      </View>
    </TelaAtividade>
  );
}