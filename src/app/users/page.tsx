'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import Avatar from '@/components/Avatar';
import { FiSearch } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';

interface User {
  id: string;
  name: string;
  profilePicture: string | null;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users');
        // Filter out current user
        setUsers(res.data.filter((u: User) => u.id !== user?.id));
      } catch (err) {
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user]);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="max-w-md mx-auto bg-white h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white h-screen flex flex-col">
      <header className="p-4 border-b sticky top-0 bg-white z-10">
        <h1 className="text-xl font-bold text-gray-800">New Message</h1>
      </header>

      <div className="p-4 border-b sticky top-14 bg-white z-10">
        <div className="relative">
          <FiSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search users"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredUsers.map((user) => (
          <Link 
            key={user.id} 
            href={`/message/new?userId=${user.id}`}
            className="block hover:bg-gray-50 transition"
          >
            <div className="flex items-center p-4 border-b">
              <Avatar 
                src={user.profilePicture} 
                name={user.name} 
                size="lg"
              />
              <div className="ml-3">
                <h3 className="font-semibold">{user.name}</h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}