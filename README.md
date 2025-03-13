# KreatIA_WM (archived proyect)

i tryed to clone chatgpt voice asistent but my microphone is not working so i will abandon this for my home work

a website that content operating systems aplications in one page
![](https://github.com/jero98772/Kreative_os/blob/main/docs/images/2.jpeg)
![](https://github.com/jero98772/Kreative_os/blob/main/docs/images/1.jpeg)

1. [3DFile system](https://github.com/jero98772/3Dfilesystem)
2. [Kind of browser](https://github.com/jero98772/Parcero2Parcero)
3. [Text editor](https://github.com/jero98772/OpreSiveTEditor)
4. [Computer emulator](https://github.com/jero98772/Java-Computer-Emulator-)
5. [Proceso monitor](https://github.com/jero98772/processamonito)
6. [Terminal](https://github.com/jero98772/Weberminal)

we need more aplications?



## Features
- **Real-time chat streaming** with WebSockets
- **React-based frontend** with a sleek UI
- **FastAPI backend** powered by **LangChain**
- **Supports conversational history**
- **Integrates with a local LLM (Llama-3.2-1b-instruct)**
- **CORS enabled** for cross-origin requests

## Installation & Setup

### Prerequisites
Ensure you have the following installed:
- **Python 3.8+** (for FastAPI backend)
- **pip** and **virtualenv**

### Backend Setup (FastAPI)

1. **Clone the repository**
```sh
git clone https://github.com/your-repo/chatbot.git
cd chatbot
```

2. **Create a virtual environment and activate it**
```sh
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
```

3. **Install dependencies**
```sh
pip install -r requirements.txt
```

4. **Run the backend**
```sh
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

run the application but in streamlit

	pip install streamlit
	streamlit run streamlit_asistent.py

## Usage
1. Open the frontend in your browser.
2. Start chatting with the AI Assistant.
3. The chatbot responds in real-time, streaming messages as they arrive.

## API Endpoints
### WebSocket API
- **`ws://localhost:8000/chat`**: WebSocket endpoint for real-time chat streaming.

### REST API
- **`POST /chat/simple`**: Accepts chat messages in JSON format and returns a response.

## Technologies Used
- **React** (Frontend UI)
- **FastAPI** (Backend server)
- **WebSockets** (Real-time communication)
- **LangChain** (AI processing)
- **OpenAI LLM** (Local model: `llama-3.2-1b-instruct`)

## License
This project is licensed under the GPLv3 License.


