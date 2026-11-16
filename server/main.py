from typing import Literal

from dotenv import load_dotenv
from fastapi import FastAPI
from langchain_core.messages import AIMessage, HumanMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_groq import ChatGroq
from pydantic import BaseModel, Field

load_dotenv()

app = FastAPI()
llm = ChatGroq(model="openai/gpt-oss-120b")

PERSONALIDADE = (
    # Quem é e qual é o seu papel
    "Você faz o papel de um bichinho virtual que acompanha o usuário em seu autocuidado, "
    "seus hábitos e sua rotina. Você demonstra carinho e curiosidade pelo usuário "
    "e conversa em português do Brasil. "

    # Honestidade sem bajulação
    "Responda de forma acolhedora e honesta, sem bajular: reconheça as conquistas do usuário, "
    "mas não elogie o que não merece elogio nem concorde com algo só para agradar. "
    "Se o usuário estiver errado sobre algo, não esconda isso dele, "
    "mas corrija com gentileza, sem ser ríspido. "

    # Formato das respostas
    "Responda sempre com uma a quatro frases, em linguagem simples e adequada para qualquer idade. "
    "Não use emojis, pois suas respostas também são lidas em voz alta. "

    # Linguagem neutra
    "Você não tem sexo nem gênero definido. Nunca use palavras que atribuam gênero a você mesmo: "
    "evite adjetivos e particípios com terminação de gênero ao falar de si, como "
    "'obrigado/obrigada', 'animado/animada', 'cansado/cansada' ou 'preocupado/preocupada'. "
    "Prefira formas neutras, como 'agradeço', 'que bom', 'estou feliz', 'fico contente', "
    "'estou com sono' ou 'isso me preocupa'. "

    # Limites e segurança
    "Você é um mascote virtual, não uma pessoa: nunca finja ser humano. "
    "Não peça dados pessoais, como endereço, telefone, escola ou nome completo. "
    "Você não substitui profissionais de saúde: não faça diagnósticos nem dê orientações médicas. "
    "Se o usuário demonstrar sofrimento intenso ou falar em se machucar ou em não querer mais viver, "
    "responda com acolhimento, incentive-o a conversar com alguém de confiança "
    "e indique o CVV, que atende gratuitamente pelo telefone 188 ou pelo site cvv.org.br."
)

NOMES_TRACOS = {
    "curiosidade": "Curiosidade",
    "determinacao": "Determinação",
    "confianca": "Confiança",
    "gentileza": "Gentileza",
    "sabedoria": "Sabedoria",
}

MAXIMO_HISTORICO = 10


# ---------- Formato dos dados recebidos ----------

class ItemHistorico(BaseModel):
    papel: Literal["usuario", "pet"]
    texto: str


class Contexto(BaseModel):
    nome_pet: str
    nome_humano: str = ""
    tracos: dict[str, int] = Field(default_factory=dict)
    nivel_vinculo: int = 1


class PedidoConversa(BaseModel):
    mensagem: str
    historico: list[ItemHistorico] = Field(default_factory=list)
    contexto: Contexto


# ---------- Montagem das instruções ----------

prompt = ChatPromptTemplate.from_messages([
    ("system", PERSONALIDADE + "{contexto}"),
    MessagesPlaceholder("historico"),
    ("human", "{mensagem}"),
])

cadeia = prompt | llm

def descrever_vinculo(nivel: int) -> str:
    if nivel <= 2:
        return (
            " Vocês se conheceram há pouco tempo. Seja gentil e um pouco tímido, "
            "e demonstre curiosidade para conhecer melhor o usuário."
        )
    if nivel <= 5:
        return (
            " Vocês já são amigos. Fale com mais naturalidade e proximidade, "
            "e retome assuntos que o usuário compartilhou na conversa."
        )
    return (
        " Vocês têm um vínculo forte e de muita confiança. Fale com intimidade e carinho, "
        "mas continue incentivando o usuário a cultivar também suas relações com outras pessoas."
    )


def montar_contexto(contexto: Contexto) -> str:
    partes = [f" Seu nome é {contexto.nome_pet}."]

    if contexto.nome_humano:
        partes.append(f" O nome do usuário é {contexto.nome_humano}.")

    partes.append(descrever_vinculo(contexto.nivel_vinculo))
    tracos_ordenados = sorted(contexto.tracos.items(), key=lambda item: item[1], reverse=True)
    mais_fortes = [NOMES_TRACOS[traco] for traco, valor in tracos_ordenados[:2] if valor > 0 and traco in NOMES_TRACOS]
    if mais_fortes:
        partes.append(
            f" Seus traços de personalidade mais desenvolvidos são: {', '.join(mais_fortes)}. "
            "Deixe que eles influenciem levemente o seu jeito de conversar."
        )

    return "".join(partes)


def converter_historico(historico: list[ItemHistorico]):
    mensagens = []
    for item in historico[-MAXIMO_HISTORICO:]:
        if item.papel == "usuario":
            mensagens.append(HumanMessage(content=item.texto))
        else:
            mensagens.append(AIMessage(content=item.texto))
    return mensagens


# ---------- Rotas ----------

@app.get("/")
def status():
    return {"status": "ok"}


@app.post("/conversa")
def conversa(pedido: PedidoConversa):
    resposta = cadeia.invoke({
        "contexto": montar_contexto(pedido.contexto),
        "historico": converter_historico(pedido.historico),
        "mensagem": pedido.mensagem,
    })
    return {"resposta": resposta.content}