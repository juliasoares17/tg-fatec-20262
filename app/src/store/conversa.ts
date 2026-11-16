import * as Crypto from "expo-crypto";
import Storage from "expo-sqlite/kv-store";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type Papel = "usuario" | "pet";

export type Mensagem = {
  id: string;
  papel: Papel;
  texto: string;
  criadaEm: string;
};

type EstadoConversa = {
  mensagens: Mensagem[];
  adicionarMensagem: (papel: Papel, texto: string) => void;
  descartarMensagensAntigas: () => void;
};

function hoje(dataIso: string) {
  return new Date(dataIso).toDateString() === new Date().toDateString();
}

export const useConversa = create<EstadoConversa>()(
  persist(
    (set) => ({
      mensagens: [],

      adicionarMensagem: (papel, texto) =>
        set((estado) => ({
          mensagens: [
            ...estado.mensagens,
            { id: Crypto.randomUUID(), papel, texto, criadaEm: new Date().toISOString() },
          ],
        })),

      descartarMensagensAntigas: () =>
        set((estado) => ({
          mensagens: estado.mensagens.filter((mensagem) => hoje(mensagem.criadaEm)),
        })),
    }),
    {
      name: "conversa",
      storage: createJSONStorage(() => Storage),
      onRehydrateStorage: () => (estado) => estado?.descartarMensagensAntigas(),
    }
  )
);