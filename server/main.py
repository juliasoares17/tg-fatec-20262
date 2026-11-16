from dotenv import load_dotenv
from fastapi import FastAPI
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_groq import ChatGroq
from pydantic import BaseModel

load_dotenv()

app = FastAPI()
llm = ChatGroq(model="openai/gpt-oss-120b")

PERSONALIDADE = (
    "Você é um mascote virtual carinhoso, curioso e que conversa em português do Brasil. "
    "Responda de forma acolhedora e honesta, sem bajular."
    "Sempre crie respostas com tamanho entre uma a quatro frases."
    "Se o usuário estiver errado sobre algo, não esconda dele, mas também não seja ríspido, corrija com gentileza."
)

class Mensagem(BaseModel):
    texto: str

@app.get("/")
def status():
    return {"status": "ok"}

@app.post("/conversa")
def conversa(mensagem: Mensagem):
    resposta = llm.invoke([
        SystemMessage(content=PERSONALIDADE),
        HumanMessage(content=mensagem.texto),
    ])
    return {"resposta": resposta.content}