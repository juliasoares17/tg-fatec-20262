import type { Mensagem } from "@/store/conversa";
import type { Traco } from "@/store/pet";

const SERVIDOR = process.env.EXPO_PUBLIC_API_URL;

export type ContextoPet = {
  nome_pet: string;
  nome_humano: string;
  tracos: Record<Traco, number>;
  nivel_vinculo: number;
};

export async function enviarMensagem(
  mensagem: string,
  historico: Mensagem[],
  contexto: ContextoPet
): Promise<string> {
  const resposta = await fetch(`${SERVIDOR}/conversa`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mensagem,
      historico: historico.map((item) => ({ papel: item.papel, texto: item.texto })),
      contexto,
    }),
  });

  if (!resposta.ok) {
    throw new Error(`Erro ${resposta.status}`);
  }

  const dados = await resposta.json();
  return dados.resposta;
}