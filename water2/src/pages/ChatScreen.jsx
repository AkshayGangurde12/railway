import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import { AppContext } from '../context/AppContext';
import Header from '../components/Header';
import { ArrowLeft, Paperclip, Download, File, Send, X, Clock, Check, CheckCheck, Mic, MicOff } from 'lucide-react';

const ChatScreen = () => {
  const { user } = useContext(AppContext);
  const { receiverEmail } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [attachment, setAttachment] = useState(null);
  const [attachmentName, setAttachmentName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [receiverInfo, setReceiverInfo] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognitionError, setRecognitionError] = useState(null);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    const initializeSpeechRecognition = () => {
      try {
        // Check if we're on localhost
        const isLocalhost = window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1';
        
        // Allow both HTTPS and localhost
        const isSecureContext = window.isSecureContext || isLocalhost;
        
        if (!isSecureContext) {
          setRecognitionError('Speech recognition requires a secure connection (HTTPS) or localhost. Please use HTTPS or run on localhost.');
          return;
        }

        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
          const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
          recognitionRef.current = new SpeechRecognition();
          recognitionRef.current.continuous = true;
          recognitionRef.current.interimResults = true;
          recognitionRef.current.lang = 'en-US';
          recognitionRef.current.maxAlternatives = 1;

          recognitionRef.current.onstart = () => {
            setIsListening(true);
            setRecognitionError(null);
          };

          recognitionRef.current.onend = () => {
            setIsListening(false);
            setIsRecording(false);
          };

          recognitionRef.current.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            let errorMessage = 'Speech recognition error occurred.';
            
            switch (event.error) {
              case 'network':
                errorMessage = isLocalhost 
                  ? 'Network error. Please ensure you are running on localhost:5173 and your browser has internet access.'
                  : 'Network error. Please ensure you are using HTTPS or localhost.';
                break;
              case 'not-allowed':
                errorMessage = 'Microphone access was denied. Please allow microphone access in your browser settings.';
                break;
              case 'audio-capture':
                errorMessage = 'No microphone detected. Please check your microphone connection.';
                break;
              case 'service-not-allowed':
                errorMessage = 'Speech recognition service is not allowed. Please use Chrome, Edge, or Safari.';
                break;
              case 'aborted':
                errorMessage = 'Speech recognition was aborted. Please try again.';
                break;
              case 'no-speech':
                errorMessage = 'No speech was detected. Please try speaking again.';
                break;
              default:
                errorMessage = `Error: ${event.error}. Please try again or use text input instead.`;
            }
            
            setRecognitionError(errorMessage);
            setIsListening(false);
            setIsRecording(false);
          };

          recognitionRef.current.onresult = (event) => {
            const transcript = Array.from(event.results)
              .map(result => result[0])
              .map(result => result.transcript)
              .join('');

            setMessage(transcript);
          };

          // Add network status check
          window.addEventListener('online', handleNetworkStatus);
          window.addEventListener('offline', handleNetworkStatus);
        } else {
          setRecognitionError('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
        }
      } catch (error) {
        console.error('Error initializing speech recognition:', error);
        setRecognitionError('Failed to initialize speech recognition. Please refresh the page and try again.');
      }
    };

    const handleNetworkStatus = () => {
      if (!navigator.onLine) {
        setRecognitionError('No internet connection. Please check your network.');
        if (isRecording) {
          recognitionRef.current?.stop();
          setIsRecording(false);
          setIsListening(false);
        }
      } else {
        setRecognitionError(null);
      }
    };

    initializeSpeechRecognition();

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      window.removeEventListener('online', handleNetworkStatus);
      window.removeEventListener('offline', handleNetworkStatus);
    };
  }, []);

  // Connect to socket.io server
  useEffect(() => {
    socketRef.current = io('http://localhost:5000');
    
    if (user?.email) {
      socketRef.current.emit('user_online', user.email);
    }
    
    socketRef.current.on('user_status', (users) => {
      setOnlineUsers(users);
    });
    
    socketRef.current.on('typing_indicator', (data) => {
      if (data.sender === receiverEmail) {
        setIsTyping(data.isTyping);
      }
    });
    
    socketRef.current.on('receive_message', (newMessage) => {
      if (
        (newMessage.sender === receiverEmail && newMessage.receiver === user?.email) ||
        (newMessage.sender === user?.email && newMessage.receiver === receiverEmail)
      ) {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }
    });
    
    return () => {
      socketRef.current.disconnect();
    };
  }, [user?.email, receiverEmail]);

  // Fetch receiver information
  useEffect(() => {
    const fetchReceiverInfo = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/user/info/${receiverEmail}`);
        if (response.data.success) {
          setReceiverInfo(response.data.user);
        }
      } catch (error) {
        console.error('Error fetching receiver info:', error);
      }
    };
    
    fetchReceiverInfo();
  }, [receiverEmail]);

  // Fetch chat history
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        if (user?.email && receiverEmail) {
          const response = await axios.get('http://localhost:5000/api/messages/history', {
            params: {
              sender: user.email,
              receiver: receiverEmail
            }
          });
          
          if (response.data.success) {
            setMessages(response.data.messages);
          }
        }
      } catch (error) {
        console.error('Error fetching chat history:', error);
      }
    };
    
    fetchChatHistory();
  }, [user?.email, receiverEmail]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleTyping = () => {
    if (socketRef.current && user?.email && receiverEmail) {
      socketRef.current.emit('typing', {
        sender: user.email,
        receiver: receiverEmail
      });
      
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      
      const timeout = setTimeout(() => {
        socketRef.current.emit('stop_typing', {
          sender: user.email,
          receiver: receiverEmail
        });
      }, 2000);
      
      setTypingTimeout(timeout);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Only PDF files are supported');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }
      
      setAttachmentName(file.name);
      
      const reader = new FileReader();
      reader.onload = () => {
        setAttachment(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearAttachment = () => {
    setAttachment(null);
    setAttachmentName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadAttachment = (attachmentData, fileName) => {
    const link = document.createElement('a');
    link.href = attachmentData;
    link.download = fileName || 'download.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if ((!message.trim() && !attachment) || !user?.email || !receiverEmail) return;
    
    setIsUploading(true);
    
    const messageData = {
      sender: user.email,
      receiver: receiverEmail,
      content: message.trim() || 'Sent an attachment',
      timestamp: new Date(),
      hasAttachment: !!attachment,
      attachmentType: attachment ? 'pdf' : 'none',
      attachmentData: attachment,
      attachmentName: attachmentName
    };
    
    try {
      await axios.post('http://localhost:5000/api/messages/send', messageData);
      socketRef.current.emit('send_message', messageData);
      setMessages((prevMessages) => [...prevMessages, messageData]);
      setMessage('');
      clearAttachment();
      
      socketRef.current.emit('stop_typing', {
        sender: user.email,
        receiver: receiverEmail
      });
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  };

  const isUserOnline = onlineUsers.includes(receiverEmail);

  const goBackToChats = () => {
    navigate('/chats');
  };

  const toggleRecording = async () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';
    const isSecureContext = window.isSecureContext || isLocalhost;

    if (!isSecureContext) {
      setRecognitionError('Speech recognition requires a secure connection (HTTPS) or localhost. Please use HTTPS or run on localhost.');
      return;
    }

    if (!navigator.onLine) {
      setRecognitionError('No internet connection. Please check your network.');
      return;
    }

    try {
      // Request microphone permission explicitly
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Stop the stream after getting permission

      if (isRecording) {
        recognitionRef.current.stop();
        setIsRecording(false);
      } else {
        recognitionRef.current.start();
        setIsRecording(true);
      }
    } catch (error) {
      console.error('Error accessing microphone:', error);
      if (error.name === 'NotAllowedError') {
        setRecognitionError('Microphone access was denied. Please allow microphone access in your browser settings.');
      } else if (error.name === 'NotFoundError') {
        setRecognitionError('No microphone detected. Please check your microphone connection.');
      } else if (error.name === 'NotReadableError') {
        setRecognitionError('Your microphone is busy or not working properly. Please check if it\'s being used by another application.');
      } else {
        setRecognitionError('Failed to access microphone. Please check your browser settings and try again.');
      }
    }
  };

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Chat header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button 
                  onClick={goBackToChats}
                  className="mr-3 p-2 rounded-full hover:bg-blue-800 transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="flex items-center">
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center text-xl font-semibold">
                      {receiverInfo?.name?.charAt(0) || receiverEmail?.charAt(0)}
                    </div>
                    <span 
                      className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                        isUserOnline ? 'bg-green-400' : 'bg-gray-400'
                      }`}
                    ></span>
                  </div>
                  <div className="ml-3">
                    <p className="font-semibold text-lg">{receiverInfo?.name || receiverEmail}</p>
                    <div className="flex items-center text-sm text-blue-100">
                      <span className="mr-2">{isUserOnline ? 'Online' : 'Offline'}</span>
                      {receiverInfo?.speciality && (
                        <span className="px-2 py-0.5 bg-blue-500 rounded-full text-xs">
                          {receiverInfo.speciality}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Messages container */}
          <div className="h-[calc(100vh-280px)] overflow-y-auto p-4 bg-gray-50">
            {messages.map((msg, index) => {
              const showDate = index === 0 || 
                new Date(msg.timestamp).toDateString() !== 
                new Date(messages[index - 1].timestamp).toDateString();
              
              return (
                <React.Fragment key={index}>
                  {showDate && (
                    <div className="flex justify-center my-4">
                      <div className="bg-gray-200 rounded-full px-4 py-1 text-sm text-gray-600">
                        {formatDate(msg.timestamp)}
                      </div>
                    </div>
                  )}
                  <div 
                    className={`mb-4 flex ${msg.sender === user?.email ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-xs rounded-2xl px-4 py-2 ${
                        msg.sender === user?.email 
                          ? 'bg-blue-600 text-white rounded-br-none' 
                          : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      
                      {msg.hasAttachment && msg.attachmentData && (
                        <div className={`mt-2 p-2 rounded-lg flex items-center justify-between ${
                          msg.sender === user?.email 
                            ? 'bg-blue-500 bg-opacity-20' 
                            : 'bg-gray-100'
                        }`}>
                          <div className="flex items-center">
                            <File size={16} className="mr-2" />
                            <span className="text-sm truncate max-w-[120px]">
                              {msg.attachmentName || 'Document.pdf'}
                            </span>
                          </div>
                          <button
                            onClick={() => downloadAttachment(msg.attachmentData, msg.attachmentName)}
                            className="p-1 rounded hover:bg-white hover:bg-opacity-20"
                            title="Download file"
                          >
                            <Download size={16} />
                          </button>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-end mt-1 space-x-1">
                        <span className="text-xs opacity-75">
                          {formatTime(msg.timestamp)}
                        </span>
                        {msg.sender === user?.email && (
                          <span className="text-xs">
                            {msg.read ? <CheckCheck size={14} /> : <Check size={14} />}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
            {isTyping && (
              <div className="flex justify-start mb-4">
                <div className="bg-white text-gray-800 rounded-2xl px-4 py-2 rounded-bl-none shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Attachment preview */}
          {attachment && (
            <div className="p-3 bg-gray-50 border-t flex items-center justify-between">
              <div className="flex items-center">
                <File size={18} className="mr-2 text-blue-600" />
                <span className="text-sm truncate max-w-[200px]">{attachmentName}</span>
              </div>
              <button
                onClick={clearAttachment}
                className="p-1 rounded-full hover:bg-gray-200 transition-colors"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>
          )}
          
          {/* Message input */}
          <form onSubmit={sendMessage} className="p-4 border-t bg-white">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-500 hover:text-blue-600 focus:outline-none rounded-full hover:bg-gray-100 transition-colors"
                title="Attach PDF"
              >
                <Paperclip size={20} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf"
                className="hidden"
              />
              <div className="relative flex-1">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleTyping}
                  placeholder={isListening ? "Listening..." : "Type a message..."}
                  className="w-full border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isUploading}
                />
                {isListening && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-red-500">Listening...</span>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={toggleRecording}
                className={`p-2 rounded-full transition-colors ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'text-gray-500 hover:text-blue-600 hover:bg-gray-100'
                } ${(!navigator.onLine || !window.isSecureContext) ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={isRecording ? "Stop recording" : "Start voice input"}
                disabled={!navigator.onLine || !window.isSecureContext}
              >
                {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
              <button
                type="submit"
                className={`p-2 rounded-full ${
                  isUploading 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white transition-colors`}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Clock size={20} className="animate-spin" />
                ) : (
                  <Send size={20} />
                )}
              </button>
            </div>
            {recognitionError && (
              <div className="mt-2 text-sm text-red-500 text-center bg-red-50 p-2 rounded">
                {recognitionError}
                {!window.isSecureContext && window.location.hostname !== 'localhost' && (
                  <div className="mt-1 text-xs">
                    Note: Speech recognition requires HTTPS or localhost. If you're developing locally, use localhost:5173
                  </div>
                )}
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
};

export default ChatScreen;