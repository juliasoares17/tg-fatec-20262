import Storage from "expo-sqlite/kv-store";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type Traco = "curiosidade" | "determinacao" | "confianca" | "gentileza" | "sabedoria";
export type Atividade =
  | "conversa"
  | "reflexao"
  | "respiracao"
  | "aterramento"
  | "timer"
  | "meta"
  | "afirmacao"
  | "curiosidade"
  | "jogoMemoria";

export const NOMES_TRACOS: Record<Traco, string> = {
  curiosidade: "Curiosidade",
  determinacao: "Determinação",
  confianca: "Confiança",
  gentileza: "Gentileza",
  sabedoria: "Sabedoria",
};

type Recompensa = {
  vinculo: number;
  diamantes: number;
  tracos: Partial<Record<Traco, number>>;
};

// Quanto cada atividade rende de vínculo, diamantes e traços
export const RECOMPENSAS: Record<Atividade, Recompensa> = {
  conversa: { vinculo: 1, diamantes: 1, tracos: { gentileza: 1 } },
  reflexao: { vinculo: 5, diamantes: 3, tracos: { sabedoria: 3 } },
  respiracao: { vinculo: 3, diamantes: 2, tracos: { gentileza: 2 } },
  aterramento: { vinculo: 3, diamantes: 2, tracos: { gentileza: 1, sabedoria: 1 } },
  timer: { vinculo: 4, diamantes: 3, tracos: { determinacao: 3 } },
  meta: { vinculo: 3, diamantes: 2, tracos: { determinacao: 2 } },
  afirmacao: { vinculo: 3, diamantes: 2, tracos: { confianca: 3 } },
  curiosidade: { vinculo: 1, diamantes: 1, tracos: { curiosidade: 2 } },
  jogoMemoria: { vinculo: 2, diamantes: 2, tracos: { determinacao: 1, confianca: 1 } },
};

const PONTOS_POR_NIVEL = 50;
const MAXIMO_TRACO = 100;

type EstadoPet = {
  nome: string;
  nomeHumano: string;
  criadoEm: string;
  vinculo: number;
  diamantes: number;
  tracos: Record<Traco, number>;
  setNome: (nome: string) => void;
  setNomeHumano: (nomeHumano: string) => void;
  registrarAtividade: (atividade: Atividade) => void;
  garantirDataDeCriacao: () => void;
};

export const usePet = create<EstadoPet>()(
  persist(
    (set) => ({
      nome: "Pipoca",
      nomeHumano: "",
      criadoEm: "",
      vinculo: 0,
      diamantes: 0,
      tracos: { curiosidade: 0, determinacao: 0, confianca: 0, gentileza: 0, sabedoria: 0 },

      setNome: (nome) => set({ nome }),
      setNomeHumano: (nomeHumano) => set({ nomeHumano }),

      registrarAtividade: (atividade) =>
        set((estado) => {
          const recompensa = RECOMPENSAS[atividade];
          const tracos = { ...estado.tracos };
          for (const [traco, pontos] of Object.entries(recompensa.tracos) as [Traco, number][]) {
            tracos[traco] = Math.min(MAXIMO_TRACO, tracos[traco] + pontos);
          }
          return {
            vinculo: estado.vinculo + recompensa.vinculo,
            diamantes: estado.diamantes + recompensa.diamantes,
            tracos,
          };
        }),

      // Grava a data de criação do pet só na primeira vez que o app é aberto
      garantirDataDeCriacao: () =>
        set((estado) => (estado.criadoEm ? {} : { criadoEm: new Date().toISOString() })),
    }),
    {
      name: "pet",
      storage: createJSONStorage(() => Storage),
      onRehydrateStorage: () => (estado) => estado?.garantirDataDeCriacao(),
    }
  )
);

export function calcularNivel(vinculo: number) {
  return {
    nivel: Math.floor(vinculo / PONTOS_POR_NIVEL) + 1,
    progresso: (vinculo % PONTOS_POR_NIVEL) / PONTOS_POR_NIVEL,
  };
}

export function idadeEmDias(criadoEm: string) {
  if (!criadoEm) return 0;
  return Math.floor((Date.now() - new Date(criadoEm).getTime()) / (1000 * 60 * 60 * 24));
}