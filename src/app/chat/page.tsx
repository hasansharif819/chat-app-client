'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useAuth } from '@/contexts/AuthContext';

interface ChatUser {
  id: string;
  name: string;
  profileImage: string | null;
  latestMessage: string;
  chatId: string;
}

export default function ChatPage() {
  const { user, loading } = useAuth();
  const [users, setUsers] = useState<ChatUser[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const token = Cookies.get('token');
      if (!token || !user) return;

      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/chats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });

        const chats = res.data;

        const otherUsers: ChatUser[] = chats.map((chatData: any) => {
          const chat = chatData.chat;

          // Find the user who is NOT the logged-in user
          const otherUserObj = chat.users.find((u: any) => u.user.id !== user.id);

          // Get latest message (assuming last one in array is latest)
          const latestMessage = chat.messages.length > 0
            ? chat.messages[chat.messages.length - 1].content
            : 'No messages yet';

          return {
            id: otherUserObj.user.id,
            name: otherUserObj.user.name,
            profileImage: otherUserObj.user.profilePicture,
            latestMessage,
            chatId: chat.id,
          };
        });

        setUsers(otherUsers);
      } catch (error) {
        console.error('❌ Failed to fetch users:', error);
      }
    };

    if (!loading && user) {
      fetchUsers();
    }
  }, [user, loading]);

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <section>
        <div>
            <Link href={`/users`} >New Message + </Link>
        </div>
        <div className="p-6 grid gap-4">
            {users.map((u) => (
                <Link key={u.chatId} href={`/message/${u.chatId}`}>
                <div className="flex items-center gap-4 p-4 bg-white shadow rounded-lg hover:bg-gray-100 transition">
                    <img
                    src={u.profileImage || '/default-avatar.png'}
                    alt={u.name}
                    className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                    <h3 className="font-semibold text-lg">{u.name}</h3>
                    <p className="text-sm text-gray-800 font-medium">
                        {u.latestMessage}
                    </p>
                    </div>
                </div>
                </Link>
            ))}
        </div>
    </section>
  );
}
