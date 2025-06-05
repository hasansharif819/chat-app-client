// 'use client';

// import { useEffect, useState } from 'react';
// import Link from 'next/link';
// import axios from 'axios';
// import Cookies from 'js-cookie';
// import { useAuth } from '@/contexts/AuthContext';

// interface ChatUser {
//   id: string;
//   name: string;
//   profileImage: string | null;
//   latestMessage: string;
//   showMessage: boolean;
//   chatId: string;
// }

// export default function ChatPage() {
//   const { user, loading } = useAuth();
//   const [users, setUsers] = useState<ChatUser[]>([]);

//   useEffect(() => {
//     const fetchUsers = async () => {
//       const token = Cookies.get('token');
//       if (!token || !user) return;

//       try {
//         const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/chats`, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//           withCredentials: true,
//         });

//         const chats = res.data;

//         const otherUsers: ChatUser[] = chats.map((chatData: any) => {
//           const chat = chatData.chat;

//           // Find the user who is NOT the logged-in user
//           const otherUserObj = chat.users.find((u: any) => u.user.id !== user.id);

//           const messages = chat.messages || [];
//           const latest = messages.length > 0 ? messages[messages.length - 1] : null;

//           console.log("latest === ", latest)

//           return {
//             id: otherUserObj?.user?.id ?? '',
//             name: otherUserObj?.user?.name ?? 'Unknown',
//             profileImage: otherUserObj?.user?.profilePicture ?? null,
//             latestMessage: latest?.content ?? 'No messages yet',
//             showMessage: latest?.isRead,
//             chatId: chat.id,
//           };
//         });

//         setUsers(otherUsers);
//       } catch (error) {
//         console.error('❌ Failed to fetch users:', error);
//       }
//     };

//     if (!loading && user) {
//       fetchUsers();
//     }
//   }, [user, loading]);

//   if (loading) return <div className="text-center py-10">Loading...</div>;

//   return (
//     <section>
//       <div className="p-4">
//         <Link href={`/users`} className="text-blue-600 hover:underline font-medium">
//           New Message +
//         </Link>
//       </div>
//       <div className="p-6 grid gap-4">
//         {users.map((u) => (
//           <Link key={u.chatId} href={`/message/${u.chatId}`}>
//             <div className="flex items-center gap-4 p-4 bg-white text-black shadow rounded-lg hover:bg-gray-100 transition">
//               <img
//                 src={u.profileImage || '/default-avatar.png'}
//                 alt={u.name}
//                 className="w-12 h-12 rounded-full object-cover"
//               />
//               <div>
//                 <h3 className="font-semibold text-lg">{u.name}</h3>
//                 <p className={`${u.showMessage === false ? 'text-green-500 font-medium text-lg' : 'text-black text-sm'}`}>
//                   {u.latestMessage}
//                 </p>
//               </div>
//             </div>
//           </Link>
//         ))}
//       </div>
//     </section>
//   );
// }



'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useAuth } from '@/contexts/AuthContext';
import { initSocket, getSocket } from '@/utils/socket';
import { Socket } from 'socket.io-client';

interface ChatUser {
  id: string;
  name: string;
  profileImage: string | null;
  latestMessage: string;
  showMessage: boolean;
  chatId: string;
}

export default function ChatPage() {
  const { user, loading } = useAuth();
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

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

        const otherUserObj = chat.users.find((u: any) => u.user.id !== user.id);
        const messages = chat.messages || [];
        const latest = messages.length > 0 ? messages[messages.length - 1] : null;

        return {
          id: otherUserObj?.user?.id ?? '',
          name: otherUserObj?.user?.name ?? 'Unknown',
          profileImage: otherUserObj?.user?.profilePicture ?? null,
          latestMessage: latest?.content ?? 'No messages yet',
          showMessage: latest?.isRead,
          chatId: chat.id,
        };
      });

      setUsers(otherUsers);
    } catch (error) {
      console.error('❌ Failed to fetch users:', error);
    }
  };

  useEffect(() => {
    if (!loading && user) {
      fetchUsers();

      const sock = initSocket();
      setSocket(sock);

      sock.emit('join', user.id);

      sock.on('newMessage', (data: any) => {
        console.log('📥 New message received via socket:', data);
        fetchUsers(); // Re-fetch chat list when a new message comes in
      });

      sock.on('connect', () => {
        console.log('Connected to Socket.IO server');
      });

      return () => {
        sock.disconnect();
      };
    }
  }, [user, loading]);
  

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <section>
      <div className="p-4">
        <Link href={`/users`} className="text-blue-600 hover:underline font-medium">
          New Message +
        </Link>
      </div>
      <div className="p-6 grid gap-4">
        {users.map((u) => (
          <Link key={u.chatId} href={`/message/${u.chatId}`}>
            <div className="flex items-center gap-4 p-4 bg-white text-black shadow rounded-lg hover:bg-gray-100 transition">
              <img
                src={u.profileImage || '/default-avatar.png'}
                alt={u.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h3 className="font-semibold text-lg">{u.name}</h3>
                <p className={`${u.showMessage === false ? 'text-green-500 font-medium text-lg' : 'text-black text-sm'}`}>
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
