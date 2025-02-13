const Menu = ({ size }) => <span style={{ fontSize: size }}>☰</span>;
const X = ({ size }) => <span style={{ fontSize: size }}>✖</span>;
const Settings = ({ size }) => <span style={{ fontSize: size }}>⚙</span>;
const MessageSquare = ({ size }) => <span style={{ fontSize: size }}>💬</span>;
const Plus = ({ size }) => <span style={{ fontSize: size }}>＋</span>;

const ChatMessage = ({ message }) => (
    <div className={`flex items-start gap-4 ${message.role === 'assistant' ? 'bg-gray-800/50 backdrop-blur-sm border border-gray-700' : 'bg-gray-900/50'} p-4 rounded-lg hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300`}>
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
);
