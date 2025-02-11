from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
from langchain_core.messages import AIMessage, HumanMessage
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
import json
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import asyncio
from fastapi.templating import Jinja2Templates

app = FastAPI(title="LM Studio Streaming Chatbot")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

# Store chat histories (in a real app, use a proper database)
chat_histories: Dict[str, List[dict]] = {}

def get_llm_response(user_query: str, chat_history: List[dict]):
    template = """
    You are a helpful assistant. Answer the following questions considering the history of the conversation:
    Chat history: {chat_history}
    User question: {user_question}
    """
    prompt = ChatPromptTemplate.from_template(template)
    
    llm = ChatOpenAI(
        base_url="http://localhost:1234/v1",
        api_key="not-needed",
        model="llama-3.2-1b-instruct"
    )
    chain = prompt | llm | StrOutputParser()
    
    return chain.stream({
        "chat_history": chat_history,
        "user_question": user_query,
    })

# Serve static files (CSS, JS)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Serve templates
templates = Jinja2Templates(directory="templates")

@app.get("/")
async def read_root():
    return FileResponse("templates/index.html")

@app.websocket("/chat")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            request_data = json.loads(data)
            print(data,request_data)   
            # Get chat history and user query
            chat_history = request_data.get("chat_history", [])
            user_query = request_data.get("user_query", "")
            
            # Convert messages to LangChain format
            formatted_history = []
            for msg in chat_history:
                if msg["role"] == "ai":
                    formatted_history.append(AIMessage(content=msg["content"]))
                else:
                    formatted_history.append(HumanMessage(content=msg["content"]))
            
            # Get streaming response
            for chunk in get_llm_response(user_query, formatted_history):
                print(chunk)
                await websocket.send_text(json.dumps({
                    "type": "chunk",
                    "content": chunk
                }))
            # Send end message
            await websocket.send_text(json.dumps({
                "type": "end"
            }))
            
    except Exception as e:
        print(f"Error: {e}")
        await websocket.close()

@app.post("/chat/simple")
async def chat_simple(request: ChatRequest):
    messages = request.messages
    
    # Convert messages to LangChain format
    formatted_history = []
    for msg in messages:
        if msg.role == "ai":
            formatted_history.append(AIMessage(content=msg.content))
        else:
            formatted_history.append(HumanMessage(content=msg.content))
    
    # Get the last user message
    user_query = messages[-1].content if messages else ""
    
    # Get complete response (non-streaming)
    response = ""
    async for chunk in get_llm_response(user_query, formatted_history):
        response += chunk
    
    return {"response": response}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)