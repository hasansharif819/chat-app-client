'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

interface ChatUser {
  id: string;
  name: string;
  profilePicture: string | null;
}

export default function UserPage() {
  const { user, loading } = useAuth();
  const [users, setUsers] = useState<ChatUser[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const token = Cookies.get('token');
      if (!token || !user) return;

      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });

        const allUsers: ChatUser[] = res.data;
        const filtered = allUsers.filter((u) => u.id !== user.id);
        setUsers(filtered);
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
    <section className="min-h-screen bg-gray-50 p-6">
      <div className="grid gap-4 max-w-2xl mx-auto">
        {users.map((u) => (
          <Link key={u.id} href={`/message/${u.id}`}>
            <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-md hover:bg-gray-100 transition cursor-pointer">
              {u.profilePicture ? (
                <Image
                  src={u.profilePicture}
                  alt={u.name}
                  width={50}
                  height={50}
                  className="rounded-full object-cover w-12 h-12"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-semibold">
                  {u.name.charAt(0)}
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold">{u.name}</h3>
                <p className="text-sm text-gray-600">Tap to message</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
