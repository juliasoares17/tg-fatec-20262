import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { botaoPrincipal, opcao, texto, textoSecundario } from "@/constants/estilos";
import { usePet } from "@/store/pet";
import { TelaAtividade } from "./TelaAtividade";

const DURACOES = [1, 15, 30, 60]; // em minutos

function formatar(segundos: number) {
  const minutos = Math.floor(segundos / 60);
  const resto = segundos % 60;
  return `${String(minutos).padStart(2, "0")}:${String(resto).padStart(2, "0")}`;
}

export function TimerFoco({ onFechar }: { onFechar: () => void }) {
  const [minutos, setMinutos] = useState(25);
  const [restante, setRestante] = useState(25 * 60);
  const [terminaEm, setTerminaEm] = useState<number | null>(null);
  const [concluido, setConcluido] = useState(false);

  const rodando = terminaEm !== null;

  useEffect(() => {
    if (!terminaEm) return;

    const relogio = setInterval(() => {
      const segundos = Math.max(0, Math.round((terminaEm - Date.now()) / 1000));
      setRestante(segundos);

      if (segundos === 0) {
        setTerminaEm(null);
        setConcluido(true);
        usePet.getState().registrarAtividade("timer");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }, 250);

    return () => clearInterval(relogio);
  }, [terminaEm]);

  function escolherDuracao(novosMinutos: number) {
    if (rodando) return;
    setMinutos(novosMinutos);
    setRestante(novosMinutos * 60);
    setConcluido(false);
  }

  function iniciar() {
    setConcluido(false);
    setTerminaEm(Date.now() + restante * 1000);
  }

  function pausar() {
    setTerminaEm(null);
  }

  function reiniciar() {
    setTerminaEm(null);
    setRestante(minutos * 60);
    setConcluido(false);
  }

  return (
    <TelaAtividade titulo="Timer de foco" onFechar={onFechar}>
      <View className="flex-row gap-2 justify-center mb-10">
        {DURACOES.map((duracao) => {
          const selecionada = minutos === duracao;
          return (
            <Pressable
              key={duracao}
              onPress={() => escolherDuracao(duracao)}
              className={`${opcao} ${selecionada ? "bg-emerald-500 border-emerald-500" : "border-neutral-400"}`}
            >
              <Text className={selecionada ? "text-white font-bold" : texto}>{duracao} min</Text>
            </Pressable>
          );
        })}
      </View>

      <Text className={`text-7xl font-bold text-center ${texto}`}>{formatar(restante)}</Text>

      {concluido && (
        <Text className={`text-center mt-4 ${textoSecundario}`}>
          Foco concluído! Seu bichinho está feliz com você.
        </Text>
      )}

      <View className="flex-row gap-3 justify-center mt-10">
        <Pressable onPress={rodando ? pausar : iniciar} className={botaoPrincipal}>
          <Text className="text-white font-bold">{rodando ? "Pausar" : "Iniciar"}</Text>
        </Pressable>
        <Pressable onPress={reiniciar} className="rounded-full px-6 py-3 border border-neutral-400">
          <Text className={texto}>Reiniciar</Text>
        </Pressable>
      </View>
    </TelaAtividade>
  );
}