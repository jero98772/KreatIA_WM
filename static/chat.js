"use strict";

const { useState, useEffect, useRef } = React;

// Custom hook for speech synthesis
const useSpeechSynthesis = () => {
    const synth = window.speechSynthesis;
    
    const speak = (text) => {
        // Cancel any ongoing speech
        //synth.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        // You can customize voice settings here
        utterance.rate = 1.0;  // Speed of speech
        utterance.pitch = 1.0; // Pitch of voice
        utterance.volume = 1.0; // Volume
        
        // Optional: Select a specific voice
        const voices = synth.getVoices();
        const englishVoice = voices.find(voice => voice.lang.startsWith('en-'));
        if (englishVoice) {
            utterance.voice = englishVoice;
        }
        
        synth.speak(utterance);
    };
    
    return { speak };
};

const useWebSocket = (setMessages) => {
    const ws = useRef(null);
    const { speak } = useSpeechSynthesis();

    useEffect(() => {
        ws.current = new WebSocket("ws://localhost:8000/chat");

        ws.current.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === "chunk") {
                    setMessages((prev) => {
                        const lastMessage = prev.length ? prev[prev.length - 1] : null;
                        if (lastMessage && lastMessage.role === "assistant") {
                            const updatedMessage = { 
                                ...lastMessage, 
                                content: lastMessage.content + data.content 
                            };
                            // Speak only the new chunk
                            speak(data.content);
                            console.log(data.content);
                            return [...prev.slice(0, -1), updatedMessage];
                        }
                        // Speak the first chunk of a new message
                        speak(data.content);
                        return [...prev, { role: "assistant", content: data.content }];
                    });
                }
            } catch (err) {
                console.error("Error parsing message:", err);
            }
        };

        return () => ws.current.close();
    }, []);

    return ws;
};

const ChatInterface = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
    const chatContainerRef = useRef(null);
    const ws = useWebSocket(setMessages);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        setMessages((prev) => [...prev, { role: 'user', content: input }]);
        ws.current.send(JSON.stringify({ message: input }));
        setInput('');
    };

    return (
        <div className="flex h-screen bg-black text-white overflow-hidden">
            <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-900 to-black">
                <header className="bg-black/50 border-b border-gray-700 p-4 flex items-center justify-between backdrop-blur-sm">
                    <h1 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                        AI Assistant
                    </h1>
                    <button 
                        onClick={() => setIsSpeechEnabled(!isSpeechEnabled)}
                        className={`px-4 py-2 rounded-lg ${
                            isSpeechEnabled 
                                ? 'bg-blue-500 hover:bg-blue-600' 
                                : 'bg-gray-600 hover:bg-gray-700'
                        }`}
                    >
                        {isSpeechEnabled ? '🔊 Voice On' : '🔇 Voice Off'}
                    </button>
                </header>

                <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-800">
                    {messages.map((message, index) => (
                        <div key={index} className={`p-4 rounded-lg ${message.role === 'assistant' ? 'bg-gray-800' : 'bg-gray-900'}`}>
                            <strong>{message.role === 'assistant' ? 'AI:' : 'You:'}</strong> {message.content}
                        </div>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700 bg-black/50 backdrop-blur-sm">
                    <div className="flex gap-4">
                        <input 
                            type="text" 
                            value={input} 
                            onChange={(e) => setInput(e.target.value)} 
                            placeholder="Type your message..." 
                            className="flex-1 p-3 rounded-lg bg-gray-800 border border-gray-700 text-white" 
                        />
                        <button 
                            type="submit" 
                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg"
                        >
                            Send
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

ReactDOM.render(<ChatInterface />, document.getElementById('root'));

