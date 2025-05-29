'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

interface User {
  id: string;
  name: string;
  profilePicture: string | null;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  sender: User;
  receiver: User;
}

export default function MessagePage() {
  const { id } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [opponent, setOpponent] = useState<User | null>(null);
  const { user, loading } = useAuth();
  const token = Cookies.get('token');

  console.log("IDDDDDDDDDD === ", id)

  // Fetch messages and set opponent info
  const fetchMessages = async () => {
    if (!token || !user) return;

    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/chats/${id}/messages`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessages(res.data);

      // Get opponent from the first message
      const opponentUser =
        res.data.length > 0
          ? res.data[0].senderId === user.id
            ? res.data[0].receiver
            : res.data[0].sender
          : null;

      setOpponent(opponentUser);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMessages();
    }
  }, [id, user]);

  const handleSendMessage = async () => {
    if (!token || !newMessage.trim()) return;

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/chats/create`,
        { receiverId: opponent?.id, content: newMessage },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setNewMessage('');
      fetchMessages();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="p-4 shadow bg-white sticky top-0 z-10 flex items-center gap-4">
        {opponent?.profilePicture ? (
          <Image
            src={opponent.profilePicture}
            alt={opponent.name}
            width={40}
            height={40}
            className="rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-bold">
            {opponent?.name?.charAt(0)}
          </div>
        )}
        <h2 className="text-lg font-semibold">{opponent?.name || 'User'}</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => {
          const isSender = msg.senderId === user?.id;
          return (
            <div
              key={msg.id}
              className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl shadow ${
                  isSender ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-900'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <p className="text-xs mt-1 text-right opacity-70">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="bg-white shadow p-4 sticky bottom-0 flex items-center gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring focus:ring-blue-200"
        />
        <button
          onClick={handleSendMessage}
          className="bg-blue-500 text-white px-5 py-2 rounded-full hover:bg-blue-600 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}





// 'use client';

// import { useParams } from 'next/navigation';
// import { useEffect, useState } from 'react';
// import axios from 'axios';
// import Cookies from 'js-cookie';
// import { useAuth } from '@/contexts/AuthContext';
// import Image from 'next/image';

// interface User {
//   id: string;
//   name: string;
//   profilePicture: string | null;
// }

// interface Message {
//   id: string;
//   senderId: string;
//   receiverId: string;
//   content: string;
//   createdAt: string;
//   sender: User;
//   receiver: User;
// }

// export default function MessagePage() {
//   const params = useParams();
//   const receiverId = params?.id as string;

//   const [messages, setMessages] = useState<Message[]>([]);
//   const [newMessage, setNewMessage] = useState('');
//   const [opponent, setOpponent] = useState<User | null>(null);
//   const { user, loading } = useAuth();
//   const token = Cookies.get('token');

//   const fetchMessages = async () => {
//     if (!token || !user) return;

//     try {
//       const res = await axios.get(
//         `${process.env.NEXT_PUBLIC_API_URL}/chats/${receiverId}/messages`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       setMessages(res.data);

//       // Set opponent from message sender/receiver
//       if (res.data.length > 0) {
//         const firstMessage = res.data[0];
//         const opponentUser =
//           firstMessage.senderId === user.id ? firstMessage.receiver : firstMessage.sender;
//         setOpponent(opponentUser);
//       } else {
//         // No messages yet, fetch opponent manually
//         const userRes = await axios.get(
//           `${process.env.NEXT_PUBLIC_API_URL}/users/${receiverId}`,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );
//         setOpponent(userRes.data);
//       }
//     } catch (error) {
//       console.error('❌ Failed to fetch messages:', error);
//     }
//   };

//   useEffect(() => {
//     if (user && receiverId) {
//       fetchMessages();
//     }
//   }, [receiverId, user]);

//   const handleSendMessage = async () => {
//     if (!token) return;

//     console.log("Token === ", token)
//     console.log("C User === ", user?.id)
//     console.log("Opponent === ", receiverId)

//     const trimmed = newMessage.trim();
//     if (!trimmed) return;

//     try {
//       await axios.post(
//         `${process.env.NEXT_PUBLIC_API_URL}/chats/create`,
//         {
//           receiverId,
//           content: trimmed,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       setNewMessage('');
//       fetchMessages();
//     } catch (error) {
//       console.error('❌ Failed to send message:', error);
//     }
//   };

//   return (
//     <div className="flex flex-col h-screen bg-gray-50">
//       {/* Header */}
//       <div className="p-4 shadow bg-white sticky top-0 z-10 flex items-center gap-4">
//         {opponent?.profilePicture ? (
//           <Image
//             src={opponent.profilePicture}
//             alt={opponent.name}
//             width={40}
//             height={40}
//             className="rounded-full object-cover"
//           />
//         ) : (
//           <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-bold">
//             {opponent?.name?.charAt(0)}
//           </div>
//         )}
//         <h2 className="text-lg font-semibold">{opponent?.name || 'User'}</h2>
//       </div>

//       {/* Messages */}
//       <div className="flex-1 overflow-y-auto p-4 space-y-3">
//         {messages.length === 0 && opponent ? (
//           <p className="text-center text-gray-500">
//             Send a message to <strong>{opponent.name}</strong>
//           </p>
//         ) : (
//           messages.map((msg) => {
//             const isSender = msg.senderId === user?.id;
//             return (
//               <div
//                 key={msg.id}
//                 className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
//               >
//                 <div
//                   className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl shadow ${
//                     isSender ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-900'
//                   }`}
//                 >
//                   <p className="text-sm">{msg.content}</p>
//                   <p className="text-xs mt-1 text-right opacity-70">
//                     {new Date(msg.createdAt).toLocaleTimeString([], {
//                       hour: '2-digit',
//                       minute: '2-digit',
//                     })}
//                   </p>
//                 </div>
//               </div>
//             );
//           })
//         )}
//       </div>

//       {/* Input */}
//       <div className="p-4 bg-white shadow flex gap-2">
//         <input
//           type="text"
//           value={newMessage}
//           onChange={(e) => setNewMessage(e.target.value)}
//           className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
//           placeholder="Type a message..."
//         />
//         <button
//           onClick={handleSendMessage}
//           className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
//         >
//           Send
//         </button>
//       </div>
//     </div>
//   );
// }
