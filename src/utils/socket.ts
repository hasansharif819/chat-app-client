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


import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initSocket = (): Socket => {
  if (!socket) {
    const url = process.env.NEXT_PUBLIC_SOCKET_URL!;
    socket = io(url, {
      transports: ['websocket'],
      withCredentials: true,
    });
  }

  return socket;
};

export const getSocket = (): Socket | null => socket;
