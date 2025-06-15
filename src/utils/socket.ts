// import { io, Socket } from 'socket.io-client';

// let socket: Socket | null = null;

// export const initSocket = (): Socket => {
//   if (!socket) {
//     const url = process.env.NEXT_PUBLIC_SOCKET_URL as string;
//     console.log('Connecting to socket:', url);

//     socket = io(url, {
//       transports: ['websocket'], // optional: you can also remove this line
//       withCredentials: true,
//     });
//   }
//   return socket;
// };

// export const getSocket = (): Socket | null => socket;


// import { io, Socket } from 'socket.io-client';

// let socket: Socket | null = null;

// export const initSocket = (): Socket => {
//   if (!socket) {
//     const url = process.env.NEXT_PUBLIC_SOCKET_URL!;
//     socket = io(url, {
//       transports: ['websocket'],
//       withCredentials: true,
//     });
//   }

//   return socket;
// };

// export const getSocket = (): Socket | null => socket;



import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';

let socket: Socket | null = null;

export const initSocket = (userId: string): Socket => {
  if (!socket) {
    const token = Cookies.get('token');
    
    socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000', {
      path: '/socket.io',
      withCredentials: true,
      query: { 
        userId,
        token
      },
      transports: ['websocket'],
      autoConnect: true,
    });
  }
  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};