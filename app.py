from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Tuple

import os
from dotenv import load_dotenv
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain.chains import ConversationalRetrievalChain
from langchain_community.vectorstores import FAISS

load_dotenv()

app = FastAPI()

# -------- Load API key -------- #
os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY")

# -------- Load FAISS DB -------- #
DB_FAISS_PATH = "vectorstore/db_faiss_semi"
embeddings = OpenAIEmbeddings()
vectorstore = FAISS.load_local(
    DB_FAISS_PATH,
    embeddings,
    allow_dangerous_deserialization=True
)

retriever = vectorstore.as_retriever(search_kwargs={"k": 25})

llm = ChatOpenAI(
    temperature=0.0,
    model_name="gpt-4o"
)

chain = ConversationalRetrievalChain.from_llm(
    llm=llm,
    retriever=retriever,
    return_source_documents=True
)


# -------- Request / Response Models -------- #

class ChatMessage(BaseModel):
    question: str
    history: List[Tuple[str, str]] = []  # [(user,b ot), ...]


class ChatResponse(BaseModel):
    answer: str
    history: List[Tuple[str, str]]
    sources: List[str]


# -------- Chat Endpoint -------- #

@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatMessage):

    try:
        result = chain({
            "question": req.question,
            "chat_history": req.history
        })

        answer = result["answer"]
        sources = list({doc.metadata.get("source", "unknown") for doc in result["source_documents"]})

        # append latest exchange to history
        updated_history = req.history + [(req.question, answer)]

        return ChatResponse(
            answer=answer,
            history=updated_history,
            sources=sources
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/")
def root():
    return {"status": "ok", "service": "TAXObot API"}
