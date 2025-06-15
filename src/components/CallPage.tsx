// 'use client';

// import { useEffect, useRef } from 'react';
// import { io, Socket } from 'socket.io-client';
// import { useAuth } from '@/contexts/AuthContext';

// interface Props {
//   chatId: string;
//   opponentId: string;
//   onEndCall: () => void;
// }

// export default function CallPage({ chatId, opponentId, onEndCall }: Props) {
//   const { user } = useAuth();
//   const socketRef = useRef<Socket | null>(null);
//   const peerRef = useRef<RTCPeerConnection | null>(null);
//   const localStreamRef = useRef<MediaStream | null>(null);
//   const remoteStreamRef = useRef<MediaStream | null>(null);
//   const localVideoRef = useRef<HTMLVideoElement | null>(null);
//   const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

//   useEffect(() => {
//     if (!user) return;

//     const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || '', {
//       query: { userId: user.id },
//       transports: ['websocket'],
//     });

//     socketRef.current = socket;

//     socket.emit('joinChat', chatId);

//     socket.on('incoming-call', async ({ from, offer }) => {
//       await startLocalStream();
//       await createPeer(false, from);

//       await peerRef.current?.setRemoteDescription(new RTCSessionDescription(offer));
//       const answer = await peerRef.current?.createAnswer();
//       await peerRef.current?.setLocalDescription(answer);
//       socket.emit('answer-call', { targetUserId: from, answer });
//     });

//     socket.on('call-answered', async ({ answer }) => {
//       await peerRef.current?.setRemoteDescription(new RTCSessionDescription(answer));
//     });

//     socket.on('ice-candidate', async ({ candidate }) => {
//       if (candidate) {
//         await peerRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
//       }
//     });

//     startLocalStream()
//       .then(() => createPeer(true, opponentId))
//       .then(async () => {
//         const offer = await peerRef.current?.createOffer();
//         await peerRef.current?.setLocalDescription(offer);
//         socket.emit('call-user', { targetUserId: opponentId, offer });
//       })
//       .catch((error) => {
//         console.error('Call setup failed:', error);
//         alert('Call setup failed. Please check your device and permissions.');
//         onEndCall();
//       });

//     return () => {
//       socket.disconnect();
//       endCall();
//     };
//   }, [chatId, opponentId, user]);

//   const startLocalStream = async () => {
//     try {
//       const devices = await navigator.mediaDevices.enumerateDevices();
//       const hasAudio = devices.some(d => d.kind === 'audioinput');
//       const hasVideo = devices.some(d => d.kind === 'videoinput');

//       if (!hasAudio && !hasVideo) {
//         alert('No microphone or camera found. Please connect a device.');
//         throw new Error('No input devices found.');
//       }

//       const constraints: MediaStreamConstraints = {
//         audio: hasAudio,
//         video: hasVideo ? { facingMode: 'user' } : false,
//       };

//       const stream = await navigator.mediaDevices.getUserMedia(constraints);

//       localStreamRef.current = stream;
//       if (localVideoRef.current && hasVideo) {
//         localVideoRef.current.srcObject = stream;
//       }
//     } catch (error) {
//       console.error('Media access error:', error);
//       alert('Unable to access camera or microphone. Please ensure they are connected and permissions are granted.');
//       throw error;
//     }
//   };

//   const createPeer = async (isInitiator: boolean, targetId: string) => {
//     peerRef.current = new RTCPeerConnection({
//       iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
//     });

//     localStreamRef.current?.getTracks().forEach(track => {
//       peerRef.current?.addTrack(track, localStreamRef.current!);
//     });

//     peerRef.current.onicecandidate = (event) => {
//       if (event.candidate) {
//         socketRef.current?.emit('ice-candidate', {
//           targetUserId: targetId,
//           candidate: event.candidate,
//         });
//       }
//     };

//     peerRef.current.ontrack = (event) => {
//       if (!remoteStreamRef.current) {
//         remoteStreamRef.current = new MediaStream();
//         if (remoteVideoRef.current) {
//           remoteVideoRef.current.srcObject = remoteStreamRef.current;
//         }
//       }
//       remoteStreamRef.current.addTrack(event.track);
//     };
//   };

//   const endCall = () => {
//     peerRef.current?.close();
//     localStreamRef.current?.getTracks().forEach(track => track.stop());

//     if (localVideoRef.current) localVideoRef.current.srcObject = null;
//     if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

//     onEndCall();
//   };

//   return (
//     <div className="flex flex-col items-center justify-center h-full bg-black text-white p-4">
//       <h2 className="mb-4 text-lg font-semibold">Video/Audio Call</h2>
//       <div className="flex flex-col md:flex-row gap-4 w-full justify-center">
//         <div className="w-full md:w-1/2 aspect-video bg-gray-900 rounded-lg overflow-hidden relative">
//           <video
//             ref={localVideoRef}
//             autoPlay
//             muted
//             playsInline
//             className="w-full h-full object-cover"
//           />
//           {!localStreamRef.current?.getVideoTracks().length && (
//             <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white text-sm">
//               Audio Only (Local)
//             </div>
//           )}
//         </div>

//         <div className="w-full md:w-1/2 aspect-video bg-gray-900 rounded-lg overflow-hidden relative">
//           <video
//             ref={remoteVideoRef}
//             autoPlay
//             playsInline
//             className="w-full h-full object-cover"
//           />
//           {!remoteStreamRef.current?.getVideoTracks().length && (
//             <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white text-sm">
//               Audio Only (Remote)
//             </div>
//           )}
//         </div>
//       </div>

//       <button
//         onClick={endCall}
//         className="mt-6 px-6 py-2 bg-red-600 hover:bg-red-700 rounded-full"
//       >
//         End Call
//       </button>
//     </div>
//   );
// }






// 'use client';

// import { useEffect, useRef } from 'react';
// import { io, Socket } from 'socket.io-client';
// import { useAuth } from '@/contexts/AuthContext';

// interface Props {
//   chatId: string;
//   opponentId: string;
//   onEndCall: () => void;
// }

// export default function CallPage({ chatId, opponentId, onEndCall }: Props) {
//   const { user } = useAuth();
//   const socketRef = useRef<Socket | null>(null);
//   const peerRef = useRef<RTCPeerConnection | null>(null);
//   const localStreamRef = useRef<MediaStream | null>(null);
//   const remoteStreamRef = useRef<MediaStream | null>(null);
//   const localVideoRef = useRef<HTMLVideoElement | null>(null);
//   const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

//   useEffect(() => {
//     if (!user) return;

//     const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || '', {
//       query: { userId: user.id },
//       transports: ['websocket'],
//     });
//     socketRef.current = socket;

//     socket.emit('joinChat', chatId);

//     socket.on('incoming-call', async ({ from, offer }) => {
//       await tryStartLocalStream(); // Do not throw if it fails
//       await createPeer(false, from);

//       await peerRef.current?.setRemoteDescription(new RTCSessionDescription(offer));
//       const answer = await peerRef.current?.createAnswer();
//       await peerRef.current?.setLocalDescription(answer);
//       socket.emit('answer-call', { targetUserId: from, answer });
//     });

//     socket.on('call-answered', async ({ answer }) => {
//       await peerRef.current?.setRemoteDescription(new RTCSessionDescription(answer));
//     });

//     socket.on('ice-candidate', async ({ candidate }) => {
//       if (candidate) {
//         await peerRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
//       }
//     });

//     tryStartLocalStream().then(() =>
//       createPeer(true, opponentId).then(async () => {
//         const offer = await peerRef.current?.createOffer();
//         await peerRef.current?.setLocalDescription(offer);
//         socket.emit('call-user', { targetUserId: opponentId, offer });
//       })
//     );

//     return () => {
//       socket.disconnect();
//       endCall();
//     };
//   }, [chatId, opponentId, user]);

//   const tryStartLocalStream = async () => {
//     try {
//       const constraints: MediaStreamConstraints = {
//         audio: true,
//         video: true,
//       };

//       const stream = await navigator.mediaDevices.getUserMedia(constraints);
//       localStreamRef.current = stream;
//       if (localVideoRef.current) {
//         localVideoRef.current.srcObject = stream;
//       }
//     } catch (error) {
//       console.warn('Could not access camera/mic. Proceeding without media.');
//       localStreamRef.current = new MediaStream(); // Empty stream to satisfy addTrack
//     }
//   };

//   const createPeer = async (isInitiator: boolean, targetId: string) => {
//     peerRef.current = new RTCPeerConnection({
//       iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
//     });

//     // Even if no tracks, send empty stream for compatibility
//     localStreamRef.current?.getTracks().forEach(track => {
//       peerRef.current?.addTrack(track, localStreamRef.current!);
//     });

//     peerRef.current.onicecandidate = (event) => {
//       if (event.candidate) {
//         socketRef.current?.emit('ice-candidate', {
//           targetUserId: targetId,
//           candidate: event.candidate,
//         });
//       }
//     };

//     peerRef.current.ontrack = (event) => {
//       if (!remoteStreamRef.current) {
//         remoteStreamRef.current = new MediaStream();
//         if (remoteVideoRef.current) {
//           remoteVideoRef.current.srcObject = remoteStreamRef.current;
//         }
//       }
//       remoteStreamRef.current.addTrack(event.track);
//     };
//   };

//   const endCall = () => {
//     peerRef.current?.close();
//     localStreamRef.current?.getTracks().forEach(track => track.stop());

//     if (localVideoRef.current) localVideoRef.current.srcObject = null;
//     if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

//     onEndCall();
//   };

//   return (
//     <div className="flex flex-col items-center justify-center h-full bg-black text-white p-4">
//       <h2 className="mb-4 text-lg font-semibold">Call</h2>

//       <div className="flex flex-col md:flex-row gap-4 w-full justify-center">
//         <div className="w-full md:w-1/2 aspect-video bg-gray-800 rounded-lg overflow-hidden relative">
//           <video
//             ref={localVideoRef}
//             autoPlay
//             muted
//             playsInline
//             className="w-full h-full object-cover"
//           />
//           {!localStreamRef.current?.getVideoTracks?.().length && (
//             <div className="absolute inset-0 flex items-center justify-center text-sm bg-black bg-opacity-60">
//               No Camera - Audio Only
//             </div>
//           )}
//         </div>

//         <div className="w-full md:w-1/2 aspect-video bg-gray-800 rounded-lg overflow-hidden relative">
//           <video
//             ref={remoteVideoRef}
//             autoPlay
//             playsInline
//             className="w-full h-full object-cover"
//           />
//           {!remoteStreamRef.current?.getVideoTracks?.().length && (
//             <div className="absolute inset-0 flex items-center justify-center text-sm bg-black bg-opacity-60">
//               No Remote Camera
//             </div>
//           )}
//         </div>
//       </div>

//       <button
//         onClick={endCall}
//         className="mt-6 px-6 py-2 bg-red-600 hover:bg-red-700 rounded-full"
//       >
//         End Call
//       </button>
//     </div>
//   );
// }









'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  chatId: string;
  opponentId: string;
  onEndCall: () => void;
}

type CallStatus = 'connecting' | 'ringing' | 'active' | 'failed' | 'ended';

export default function CallPage({ chatId, opponentId, onEndCall }: Props) {
  const { user } = useAuth();
  const [callStatus, setCallStatus] = useState<CallStatus>('connecting');
  const [mediaState, setMediaState] = useState({
    audio: true,
    video: true,
    screen: false
  });

  // Refs for WebRTC and media elements
  const socketRef = useRef<Socket | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const callStartTimeRef = useRef<number | null>(null);
  const [callDuration, setCallDuration] = useState('00:00');

  // Determine if current user is the caller
  const isCaller = useCallback(() => {
    return user?.id < opponentId;
  }, [user, opponentId]);

  // Clean up all media resources
  const cleanupMedia = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.onicecandidate = null;
      peerRef.current.oniceconnectionstatechange = null;
      peerRef.current.ontrack = null;
      peerRef.current.close();
      peerRef.current = null;
    }

    localStreamRef.current?.getTracks().forEach(track => track.stop());
    localStreamRef.current = null;

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
  }, []);

  // Setup local media stream
  const setupLocalMedia = useCallback(async () => {
    try {
      const constraints: MediaStreamConstraints = {
        audio: true, // Always request audio
        video: mediaState.video ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 24 },
          facingMode: 'user'
        } : false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Stop previous stream if exists
      localStreamRef.current?.getTracks().forEach(track => track.stop());
      
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      return stream;
    } catch (error) {
      console.error('Media access error:', error);
      setCallStatus('failed');
      throw error;
    }
  }, [mediaState.video]);

  // Create and configure peer connection
  const createPeerConnection = useCallback(async () => {
    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        // Add TURN servers in production:
        // { urls: 'turn:your-turn-server.com', username: 'user', credential: 'pass' }
      ],
      iceCandidatePoolSize: 10,
      iceTransportPolicy: 'all',
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require',
    });

    peerRef.current = peer;

    // Add local tracks if available
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        peer.addTrack(track, localStreamRef.current!);
      });
    }

    // ICE candidate handler
    peer.onicecandidate = ({ candidate }) => {
      if (candidate && socketRef.current?.connected) {
        socketRef.current.emit('ice-candidate', {
          targetUserId: opponentId,
          candidate,
        });
      }
    };

    // Track handler
    peer.ontrack = ({ streams: [stream] }) => {
      if (!remoteStreamRef.current) {
        remoteStreamRef.current = stream;
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
        }
        setCallStatus('active');
        callStartTimeRef.current = Date.now();
      }
    };

    // ICE connection state handler
    peer.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', peer.iceConnectionState);
      switch (peer.iceConnectionState) {
        case 'failed':
        case 'disconnected':
          setCallStatus('failed');
          break;
        case 'closed':
          cleanupMedia();
          break;
      }
    };

    // Add pending ICE candidates if any
    pendingCandidatesRef.current.forEach(candidate => {
      peer.addIceCandidate(new RTCIceCandidate(candidate));
    });
    pendingCandidatesRef.current = [];

    return peer;
  }, [opponentId, cleanupMedia]);

  // Initialize the call as caller
  const startCall = useCallback(async () => {
    try {
      setCallStatus('ringing');
      
      await setupLocalMedia();
      const peer = await createPeerConnection();

      const offer = await peer.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await peer.setLocalDescription(offer);
      
      if (socketRef.current?.connected) {
        socketRef.current.emit('call-user', {
          targetUserId: opponentId,
          offer,
          callerId: user!.id,
        });
      } else {
        throw new Error('Socket not connected');
      }
    } catch (error) {
      console.error('Call initialization failed:', error);
      setCallStatus('failed');
    }
  }, [setupLocalMedia, createPeerConnection, opponentId, user]);

  // Answer incoming call as receiver
  const answerCall = useCallback(async (offer: RTCSessionDescriptionInit) => {
    try {
      setCallStatus('ringing');
      
      await setupLocalMedia();
      const peer = await createPeerConnection();

      await peer.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      socketRef.current?.emit('answer-call', {
        targetUserId: opponentId,
        answer,
      });
    } catch (error) {
      console.error('Error answering call:', error);
      setCallStatus('failed');
    }
  }, [setupLocalMedia, createPeerConnection, opponentId]);

  // End the call
  const endCall = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('end-call', { targetUserId: opponentId });
    }
    cleanupMedia();
    setCallStatus('ended');
    setTimeout(onEndCall, 1000);
  }, [cleanupMedia, opponentId, onEndCall]);

  // Initialize socket connection and event handlers
  useEffect(() => {
    if (!user) return;

    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || '', {
      query: { userId: user.id },
      transports: ['websocket'],
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    const handleConnect = () => {
      console.log('Socket connected');
      socket.emit('joinChat', chatId);
      
      if (isCaller()) {
        startCall();
      }
    };

    const handleIncomingCall = ({ from, offer }: { from: string; offer: RTCSessionDescriptionInit }) => {
      if (from !== opponentId) return;
      setCallStatus('ringing');
      answerCall(offer);
    };

    const handleCallAnswered = ({ answer }: { answer: RTCSessionDescriptionInit }) => {
      if (!peerRef.current) return;
      peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
    };

    const handleIceCandidate = ({ candidate }: { candidate: RTCIceCandidateInit }) => {
      if (!peerRef.current) {
        pendingCandidatesRef.current.push(candidate);
        return;
      }
      peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    };

    const handleRemoteEndCall = () => {
      setCallStatus('ended');
      setTimeout(onEndCall, 1000);
    };

    socket.on('connect', handleConnect);
    socket.on('incoming-call', handleIncomingCall);
    socket.on('call-answered', handleCallAnswered);
    socket.on('ice-candidate', handleIceCandidate);
    socket.on('call-ended', handleRemoteEndCall);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('incoming-call', handleIncomingCall);
      socket.off('call-answered', handleCallAnswered);
      socket.off('ice-candidate', handleIceCandidate);
      socket.off('call-ended', handleRemoteEndCall);
      socket.disconnect();
      cleanupMedia();
    };
  }, [user, chatId, opponentId, isCaller, startCall, answerCall, onEndCall, cleanupMedia]);

  // Call duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (callStatus === 'active' && callStartTimeRef.current) {
      interval = setInterval(() => {
        const seconds = Math.floor((Date.now() - callStartTimeRef.current!) / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        setCallDuration(
          `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
        );
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callStatus]);

  // Toggle media tracks
  const toggleMedia = (type: 'audio' | 'video') => {
    if (!localStreamRef.current) return;

    setMediaState(prev => {
      const newState = { ...prev, [type]: !prev[type] };
      
      localStreamRef.current?.getTracks().forEach(track => {
        if (track.kind === type) {
          track.enabled = newState[type];
        }
      });

      return newState;
    });
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-white p-4 relative">
      {/* Status overlay */}
      {callStatus !== 'active' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-10">
          <div className="text-center">
            <p className="text-xl mb-4">
              {callStatus === 'connecting' && 'Connecting...'}
              {callStatus === 'ringing' && isCaller() && 'Ringing...'}
              {callStatus === 'ringing' && !isCaller() && 'Incoming Call'}
              {callStatus === 'failed' && 'Connection failed'}
              {callStatus === 'ended' && 'Call ended'}
            </p>
            {callStatus === 'failed' && (
              <button
                onClick={isCaller() ? startCall : () => {}}
                className="px-4 py-2 bg-blue-600 rounded-md mr-2 hover:bg-blue-700 transition"
              >
                Retry
              </button>
            )}
            <button
              onClick={endCall}
              className="px-4 py-2 bg-red-600 rounded-md hover:bg-red-700 transition"
            >
              {callStatus === 'failed' ? 'Close' : 'End Call'}
            </button>
          </div>
        </div>
      )}

      {/* Call header */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <h2 className="text-lg font-semibold">
          Call with {opponentId}
        </h2>
        {callStatus === 'active' && (
          <div className="bg-black bg-opacity-50 px-3 py-1 rounded-full">
            {callDuration}
          </div>
        )}
      </div>

      {/* Video streams */}
      <div className="flex flex-col md:flex-row gap-4 w-full max-w-6xl h-[70vh]">
        {/* Remote video */}
        <div className="flex-1 bg-gray-800 rounded-lg overflow-hidden relative">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          {(!remoteStreamRef.current || !remoteStreamRef.current.getVideoTracks().length) && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">{opponentId.charAt(0).toUpperCase()}</span>
                </div>
                <p>{opponentId}</p>
              </div>
            </div>
          )}
        </div>

        {/* Local video */}
        <div className="w-full md:w-1/3 bg-gray-800 rounded-lg overflow-hidden relative">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          {(!localStreamRef.current || !localStreamRef.current.getVideoTracks().length) && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl">You</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="mt-6 flex gap-4">
        <button
          onClick={() => toggleMedia('audio')}
          className={`p-3 rounded-full ${mediaState.audio ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'} transition`}
          title={mediaState.audio ? 'Mute' : 'Unmute'}
        >
          {mediaState.audio ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          )}
        </button>

        <button
          onClick={() => toggleMedia('video')}
          className={`p-3 rounded-full ${mediaState.video ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'} transition`}
          title={mediaState.video ? 'Turn off camera' : 'Turn on camera'}
        >
          {mediaState.video ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          )}
        </button>

        <button
          onClick={endCall}
          className="p-3 rounded-full bg-red-600 hover:bg-red-700 transition"
          title="End call"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
          </svg>
        </button>
      </div>
    </div>
  );
}