import { useState, useRef, useEffect } from 'react';

const TextChat = ({ socket, roomId, messages, user }) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    socket?.emit('chat-message', {
      roomId,
      userId: user._id,
      displayName: user.displayName || 'Anonymous',
      message: newMessage.trim(),
      timestamp: new Date()
    });

    setNewMessage('');
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 h-[600px] flex flex-col">
      <h2 className="text-xl font-bold text-white mb-4">Chat</h2>
      
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-700">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.userId === user._id ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                msg.userId === user._id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-100'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-sm font-medium">
                  {msg.userId === user._id ? 'You' : msg.displayName || 'Anonymous'}
                </span>
                <span className="text-xs opacity-75">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="break-words">{msg.message}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 placeholder-gray-400"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!newMessage.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default TextChat; 