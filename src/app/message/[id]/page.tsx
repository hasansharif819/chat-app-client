'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { initSocket, disconnectSocket } from '@/utils/socket';
import Avatar from '@/components/Avatar';
import { FiSend, FiChevronLeft, FiImage } from 'react-icons/fi';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import CallPage from '@/components/CallPage';
import { FiPhone, FiVideo } from 'react-icons/fi';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  sender: {
    id: string;
    name: string;
    profilePicture: string | null;
  };
  receiver: {
    id: string;
    name: string;
    profilePicture: string | null;
  };
}

export default function MessagePage() {
  const { id: chatId } = useParams<{ id: string }>();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [opponent, setOpponent] = useState<{
    id: string;
    name: string;
    profilePicture: string | null;
  } | null>(null);
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [tempMessages, setTempMessages] = useState<Message[]>([]);
  const [isCalling, setIsCalling] = useState(false);

  const fetchMessages = async () => {
    try {
      const res = await api.get<Message[]>(`/chats/${chatId}/messages`);
      setMessages(res.data);

      if (res.data.length > 0) {
        const opponentUser = res.data[0].senderId === user?.id 
          ? res.data[0].receiver 
          : res.data[0].sender;
        setOpponent(opponentUser);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || !chatId) return;

    fetchMessages();

    const socket = initSocket(user.id);
    socket.emit('joinChat', chatId);

    socket.on('newMessage', (msg: Message) => {
      // Filter out any temporary messages with the same content
      setMessages(prev => {
        const existingMessage = prev.find(m => m.id === msg.id);
        if (!existingMessage) {
          return [...prev, msg];
        }
        return prev;
      });
      setTempMessages(prev => prev.filter(m => m.content !== msg.content));
    });

    if (messages.length > 0) {
      socket.emit('markMessagesRead', { chatId, userId: user.id });
    }

    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    return () => {
      socket.emit('leaveChat', chatId);
      socket.off('newMessage');
      disconnectSocket();
    };
  }, [chatId, user]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !opponent || isSending) return;

    setIsSending(true);
    const tempId = `temp-${Date.now()}`;
    const tempMsg = {
      id: tempId,
      senderId: user.id,
      receiverId: opponent.id,
      content: newMessage,
      createdAt: new Date().toISOString(),
      isRead: false,
      sender: {
        id: user.id,
        name: user.name || '',
        profilePicture: user.profilePicture || null
      },
      receiver: {
        id: opponent.id,
        name: opponent.name || '',
        profilePicture: opponent.profilePicture || null
      }
    };

    // Add to temporary messages (optimistic update)
    setTempMessages(prev => [...prev, tempMsg]);
    setNewMessage('');

    try {
      const res = await api.post<Message>('/chats/create', {
        chatId,
        content: newMessage,
        receiverId: opponent.id 
      });

      // Remove temp message and add the real one
      setTempMessages(prev => prev.filter(m => m.id !== tempId));
      setMessages(prev => [...prev, res.data]);

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Failed to send message');
      // Remove the failed temp message
      setTempMessages(prev => prev.filter(m => m.id !== tempId));
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Combine real messages with temporary ones
  const allMessages = [...messages, ...tempMessages].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-gray-50 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isCalling && opponent) {
  return (
    <CallPage
      chatId={chatId}
      opponentId={opponent.id}
      onEndCall={() => setIsCalling(false)}
    />
  );
}

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* <header className="bg-white shadow-sm p-4 flex items-center sticky top-0 z-10">
        <button 
          onClick={() => router.back()}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
        >
          <FiChevronLeft className="text-xl text-black" />
        </button>
        <div className="flex items-center flex-1">
          <Avatar 
            src={opponent?.profilePicture} 
            name={opponent?.name} 
            size="md"
          />
          <div className="ml-3">
            <h2 className="font-semibold text-lg text-black">{opponent?.name || 'User'}</h2>
          </div>
        </div>
      </header> */}

      <header className="bg-white shadow-sm p-4 flex items-center sticky top-0 z-10 justify-between">
        <div className="flex items-center">
          <button 
            onClick={() => router.back()}
            className="mr-4 p-2 rounded-full hover:bg-gray-100"
          >
            <FiChevronLeft className="text-xl text-black" />
          </button>
          <Avatar 
            src={opponent?.profilePicture} 
            name={opponent?.name} 
            size="md"
          />
          <div className="ml-3">
            <h2 className="font-semibold text-lg text-black">{opponent?.name || 'User'}</h2>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsCalling(true)} className="p-2 text-blue-500 hover:text-blue-700">
            <FiPhone className="text-xl" />
          </button>
          <button onClick={() => setIsCalling(true)} className="p-2 text-green-500 hover:text-green-700">
            <FiVideo className="text-xl" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {allMessages.map((msg, index) => {
          const isSender = msg.senderId === user?.id;
          const showDate = index === 0 || 
            new Date(msg.createdAt).getDate() !== 
            new Date(allMessages[index - 1]?.createdAt)?.getDate();

          return (
            <div key={`${msg.id}-${isSender ? 'sent' : 'received'}`} className="space-y-2">
              {showDate && (
                <div className="text-center text-xs text-gray-500 my-4">
                  {format(new Date(msg.createdAt), 'MMMM d, yyyy')}
                </div>
              )}
              <div className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl ${
                    isSender 
                      ? 'bg-blue-500 text-white rounded-br-none' 
                      : 'bg-gray-200 text-gray-900 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <div className="flex items-center justify-end mt-1 space-x-1">
                    <span className="text-xs opacity-70">
                      {format(new Date(msg.createdAt), 'h:mm a')}
                    </span>
                    {isSender && msg.isRead && (
                      <span className="text-xs">✓✓</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white border-t p-4 sticky bottom-0">
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-500 hover:text-gray-700">
            <FiImage className="text-xl" />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 text-black"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isSending}
            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            <FiSend className="text-xl" />
          </button>
        </div>
      </div>
    </div>
  );
}