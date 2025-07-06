import { useState, useRef, useEffect } from 'react';
import { FaRobot, FaTimes, FaPaperPlane, FaUser, FaSpinner } from 'react-icons/fa';
import { chatWithAI } from '../../api/aiApi';

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      message: 'Hello! 👋 I\'m your K-Store Cart assistant. How can I help you today?',
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      message: inputMessage.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await chatWithAI(
        inputMessage.trim(),
        messages.slice(-10) // Send last 10 messages for context
      );

      const botMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        message: response.response,
        timestamp: response.timestamp
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        message: 'Sorry, I\'m having trouble responding right now. Please try again or contact our support team at support@kstorecard.com',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickActions = [
    { text: 'Show popular products', icon: '🔥' },
    { text: 'Check my orders', icon: '📦' },
    { text: 'Help with cart', icon: '🛒' },
    { text: 'Store information', icon: 'ℹ️' }
  ];

  const handleQuickAction = async (actionText) => {
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      message: actionText,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await chatWithAI(
        actionText,
        messages.slice(-10)
      );

      const botMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        message: response.response,
        timestamp: response.timestamp
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error with quick action:', error);
      const errorMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        message: 'Sorry, I\'m having trouble responding right now. Please try again or contact our support team.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <div className="fixed bottom-6 right-20 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 animate-pulse"
          aria-label="Open AI Chat Assistant"
        >
          {isOpen ? <FaTimes size={24} /> : <FaRobot size={24} />}
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-20 w-96 h-[500px] bg-white rounded-lg shadow-2xl border border-gray-200 z-40 flex flex-col animate-fadeIn">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FaRobot className="text-xl" />
              <div>
                <h3 className="font-semibold">K-Store Assistant</h3>
                <p className="text-xs opacity-90">Online • Ready to help</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 rounded-full p-1 transition-colors"
            >
              <FaTimes size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-800 shadow-sm border'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.sender === 'bot' && (
                      <FaRobot className="text-blue-500 mt-1 flex-shrink-0" size={16} />
                    )}
                    {message.sender === 'user' && (
                      <FaUser className="text-white mt-1 flex-shrink-0" size={16} />
                    )}
                    <div className="flex-1">
                      <div className="text-sm">
                        {message.message.split('\n').map((line, index) => (
                          <p key={index} className={index > 0 ? 'mt-2' : ''}>
                            {line}
                          </p>
                        ))}
                      </div>
                      <p className={`text-xs mt-1 ${
                        message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 shadow-sm border rounded-lg p-3 max-w-[80%]">
                  <div className="flex items-center space-x-2">
                    <FaRobot className="text-blue-500" size={16} />
                    <FaSpinner className="animate-spin text-blue-500" size={16} />
                    <span className="text-sm text-gray-600">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length === 1 && (
            <div className="p-3 border-t bg-white">
              <p className="text-xs text-gray-600 mb-2">Quick actions:</p>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action.text)}
                    className="text-left p-2 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  >
                    <span className="mr-1">{action.icon}</span>
                    {action.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t bg-white rounded-b-lg">
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg px-4 py-2 transition-colors"
              >
                <FaPaperPlane size={14} />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Powered by AI • K-Store Cart Assistant
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatbot;