export interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  phone: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  profilePicture?: string;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  timestamp: Date;
  isRead: boolean;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  age: number;
  phone: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
}