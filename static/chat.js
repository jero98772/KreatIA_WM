const { useState, useEffect, useRef } = React;

// Dummy icon components
const Menu = ({ size }) => <span style={{ fontSize: size }}>☰</span>;
const X = ({ size }) => <span style={{ fontSize: size }}>✖</span>;
const Settings = ({ size }) => <span style={{ fontSize: size }}>⚙</span>;
const MessageSquare = ({ size }) => <span style={{ fontSize: size }}>💬</span>;
const Plus = ({ size }) => <span style={{ fontSize: size }}>＋</span>;

const ChatInterface = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const chatContainerRef = useRef(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const ws = useRef(null);

    useEffect(() => {
        ws.current = new WebSocket("ws://localhost:8000/chat");

        ws.current.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === "chunk") {
                    setMessages((prev) => {
                        const lastMessage = prev.length ? prev[prev.length - 1] : null;
                        if (lastMessage && lastMessage.role === "assistant") {
                            return [...prev.slice(0, -1), { ...lastMessage, content: lastMessage.content + data.content }];
                        }
                        return [...prev, { role: "assistant", content: data.content }];
                    });
                }
            } catch (err) {
                console.error("Error parsing message:", err);
            }
        };

        return () => ws.current.close();
    }, []);

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
                    <button className="md:hidden p-2 hover:bg-gray-800 rounded-md" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                    <h1 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                        AI Assistant
                    </h1>
                    <button className="p-2 hover:bg-gray-800 rounded-md">
                        <Settings size={20} />
                    </button>
                </header>

                <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-800">
                    {messages.map((message, index) => (
                        <div key={index} className={`flex items-start gap-4 ${message.role === 'assistant' ? 'bg-gray-800/50 backdrop-blur-sm border border-gray-700' : 'bg-gray-900/50'} p-4 rounded-lg hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300`}>
                            <div className={`p-2 rounded-full ${message.role === 'assistant' ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gradient-to-r from-green-400 to-blue-500'}`}>
                                <MessageSquare size={20} />
                            </div>
                            <div className="flex-1">
                                <div className="font-medium mb-1 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                                    {message.role === 'assistant' ? 'AI Assistant' : 'You'}
                                </div>
                                <div className="text-gray-300">{message.content}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700 bg-black/50 backdrop-blur-sm">
                    <div className="flex gap-4">
                        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your message..." className="flex-1 p-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300" />
                        <button type="submit" className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300">
                            Send
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

ReactDOM.render(<ChatInterface />, document.getElementById('root'));
