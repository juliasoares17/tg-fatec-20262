import * as Speech from "expo-speech";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { enviarMensagem } from "@/services/api";
import { useConversa } from "@/store/conversa";
import { calcularNivel, usePet } from "@/store/pet";

const texto = "text-neutral-900 dark:text-neutral-100";
const textoSecundario = "text-neutral-500 dark:text-neutral-400";

export default function Conversa() {
  const mensagens = useConversa((estado) => estado.mensagens);
  const adicionarMensagem = useConversa((estado) => estado.adicionarMensagem);
  const pet = usePet();

  const [entrada, setEntrada] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [ouvindo, setOuvindo] = useState(false);
  const [erro, setErro] = useState("");
  const lista = useRef<FlatList>(null);

  // ---------- Envio de mensagens ----------

  async function enviar(conteudo: string) {
    const mensagem = conteudo.trim();
    if (!mensagem || carregando) return;

    setEntrada("");
    setErro("");

    // O histórico são as mensagens ANTERIORES à nova
    const historico = useConversa.getState().mensagens;
    adicionarMensagem("usuario", mensagem);
    setCarregando(true);

    try {
      const resposta = await enviarMensagem(mensagem, historico, {
        nome_pet: pet.nome,
        nome_humano: pet.nomeHumano,
        tracos: pet.tracos,
        nivel_vinculo: calcularNivel(pet.vinculo).nivel,
      });
      adicionarMensagem("pet", resposta);
      pet.registrarAtividade("conversa");

      Speech.stop();
      Speech.speak(resposta, { language: "pt-BR" });
    } catch {
      setErro("Não foi possível falar com o servidor. Tente de novo em instantes.");
    } finally {
      setCarregando(false);
    }
  }

  // ---------- Reconhecimento de voz ----------

  useSpeechRecognitionEvent("start", () => setOuvindo(true));
  useSpeechRecognitionEvent("end", () => setOuvindo(false));
  useSpeechRecognitionEvent("error", () => setOuvindo(false));
  useSpeechRecognitionEvent("result", (evento) => {
    const transcricao = evento.results[0]?.transcript ?? "";
    setEntrada(transcricao);
    if (evento.isFinal) {
      enviar(transcricao);
    }
  });

  async function alternarMicrofone() {
    if (ouvindo) {
      ExpoSpeechRecognitionModule.stop();
      return;
    }

    const permissao = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!permissao.granted) {
      setErro("O app precisa de permissão para usar o microfone.");
      return;
    }

    Speech.stop(); // para o pet não "ouvir a si mesmo"
    ExpoSpeechRecognitionModule.start({ lang: "pt-BR", interimResults: true });
  }

  // ---------- Tela ----------

  return (
    <KeyboardAvoidingView className="flex-1" behavior="padding" keyboardVerticalOffset={90}>
      <FlatList
        ref={lista}
        data={mensagens}
        keyExtractor={(mensagem) => mensagem.id}
        contentContainerStyle={{ padding: 16, gap: 8 }}
        onContentSizeChange={() => lista.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          <Text className={`text-center mt-10 ${textoSecundario}`}>Diga oi para {pet.nome}!</Text>
        }
        renderItem={({ item }) => {
          const doUsuario = item.papel === "usuario";
          return (
            <View
              className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                doUsuario ? "self-end bg-emerald-500" : "self-start bg-neutral-200 dark:bg-neutral-700"
              }`}
            >
              <Text className={doUsuario ? "text-white" : texto}>{item.texto}</Text>
            </View>
          );
        }}
      />

      {carregando && <Text className={`px-4 pb-1 ${textoSecundario}`}>{pet.nome} está pensando...</Text>}
      {erro ? <Text className="px-4 pb-1 text-red-500">{erro}</Text> : null}

      <View className="flex-row items-center gap-2 p-3 border-t border-neutral-300 dark:border-neutral-700">
        <Pressable
          onPress={alternarMicrofone}
          className={`w-12 h-12 rounded-full items-center justify-center ${
            ouvindo ? "bg-red-500" : "bg-neutral-300 dark:bg-neutral-600"
          }`}
        >
          <Text className="text-xl">{ouvindo ? "⏹️" : "🎤"}</Text>
        </Pressable>

        <TextInput
          value={entrada}
          onChangeText={setEntrada}
          onSubmitEditing={() => enviar(entrada)}
          returnKeyType="send"
          placeholder={ouvindo ? "Ouvindo..." : "Escreva uma mensagem..."}
          placeholderTextColor="#999"
          className={`flex-1 border border-neutral-300 dark:border-neutral-600 rounded-full px-4 py-2 ${texto}`}
        />

        <Pressable
          onPress={() => enviar(entrada)}
          disabled={carregando}
          className="w-12 h-12 rounded-full bg-emerald-500 items-center justify-center"
        >
          <Text className="text-white text-xl">➤</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}