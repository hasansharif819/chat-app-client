'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { initSocket, disconnectSocket } from '@/utils/socket';
import Avatar from '@/components/Avatar';
import { FiMessageSquare, FiSearch, FiPlus } from 'react-icons/fi';
import TimeAgo from 'react-timeago';
import { toast } from 'react-toastify';

interface ChatUser {
  id: string;
  name: string;
  profilePicture: string | null;
  latestMessage: string;
  unread: boolean;
  chatId: string;
  timestamp: string;
}

export default function ChatPage() {
  const { user } = useAuth();
  const [chats, setChats] = useState<ChatUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await api.get('/chats');
      const formattedChats = res.data.map((chatData: any) => {
        const chat = chatData.chat;
        const otherUser = chat.users.find((u: any) => u.user.id !== user?.id)?.user;
        const latestMessage = chat.messages?.[0];

        return {
          id: otherUser?.id,
          name: otherUser?.name || 'Unknown',
          profilePicture: otherUser?.profilePicture,
          latestMessage: latestMessage?.content || 'No messages yet',
          unread: latestMessage ? 
            !latestMessage.isRead && latestMessage.senderId !== user?.id : 
            false,
          chatId: chat.id,
          timestamp: latestMessage?.createdAt || chat.updatedAt
        };
      }).sort((a: any, b: any) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setChats(formattedChats);
    } catch (err) {
      console.error('Error fetching chats:', err);
      setError('Failed to load chats. Please try again later.');
      toast.error('Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    fetchChats();

    const socket = initSocket(user.id);
    
    socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });

    socket.on('newMessage', fetchChats);
    socket.on('chatUpdate', fetchChats);

    socket.on('error', (err) => {
      console.error('Socket error:', err);
      toast.error('Connection error occurred');
    });

    return () => {
      socket.off('newMessage');
      socket.off('chatUpdate');
      socket.off('error');
      disconnectSocket();
    };
  }, [user]);

  const filteredChats = chats.filter(chat => 
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="max-w-md mx-auto bg-white h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto bg-white h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchChats}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white h-screen flex flex-col">
      <header className="p-4 border-b sticky top-0 bg-white z-10">
        <h1 className="text-xl font-bold text-gray-800">Messages</h1>
      </header>

      <div className="p-4 border-b sticky top-14 bg-white z-10">
        <div className="relative">
          <FiSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search messages"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredChats.length > 0 ? (
          filteredChats.map((chat) => (
            <Link 
              key={chat.chatId} 
              href={`/message/${chat.chatId}`}
              className="block hover:bg-gray-50 transition"
            >
              <div className="flex items-center p-4 border-b">
                <Avatar 
                  src={chat.profilePicture} 
                  name={chat.name} 
                  size="lg"
                />
                <div className="ml-3 flex-1">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">{chat.name}</h3>
                    <span className="text-xs text-gray-500">
                      <TimeAgo date={chat.timestamp} />
                    </span>
                  </div>
                  <p className={`text-sm truncate ${chat.unread ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                    {chat.latestMessage}
                  </p>
                </div>
                {chat.unread && (
                  <div className="ml-2 w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </div>
            </Link>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
            <FiMessageSquare className="text-4xl mb-2" />
            <p className="text-center">No conversations found<br />{searchTerm ? 'Try a different search' : 'Start a new chat to begin messaging'}</p>
          </div>
        )}
      </div>

      <div className="p-4 border-t sticky bottom-0 bg-white">
        <Link 
          href="/users"
          className="flex items-center justify-center gap-2 w-full bg-blue-500 text-white py-3 rounded-lg text-center font-medium hover:bg-blue-600 transition"
        >
          <FiPlus className="text-lg" />
          New Message
        </Link>
      </div>
    </div>
  );
}