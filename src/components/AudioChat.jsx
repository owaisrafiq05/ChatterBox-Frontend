import { useEffect, useRef, useState } from 'react';

const AudioChat = ({ socket, roomId, participants }) => {
  const [stream, setStream] = useState(null);
  const [peers, setPeers] = useState({});
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef();

  useEffect(() => {
    // Request microphone access
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((mediaStream) => {
        setStream(mediaStream);
        if (audioRef.current) {
          audioRef.current.srcObject = mediaStream;
        }

        // Emit the stream to other participants
        socket?.emit('audio-stream', { roomId, stream: mediaStream });
      })
      .catch((error) => {
        console.error('Error accessing microphone:', error);
      });

    return () => {
      // Clean up audio stream
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [roomId, socket]);

  useEffect(() => {
    if (!socket) return;

    // Handle new participant joining with audio
    socket.on('user-connected', ({ userId, stream }) => {
      const audio = new Audio();
      audio.srcObject = stream;
      setPeers((prev) => ({
        ...prev,
        [userId]: { stream, audio },
      }));
    });

    // Handle participant disconnecting
    socket.on('user-disconnected', (userId) => {
      if (peers[userId]) {
        peers[userId].audio.srcObject = null;
        setPeers((prev) => {
          const newPeers = { ...prev };
          delete newPeers[userId];
          return newPeers;
        });
      }
    });

    return () => {
      socket.off('user-connected');
      socket.off('user-disconnected');
    };
  }, [socket, peers]);

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 h-[600px] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Audio Chat</h2>
        <button
          onClick={toggleMute}
          className={`px-4 py-2 rounded-lg transition-colors ${
            isMuted
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white`}
        >
          {isMuted ? 'Unmute' : 'Mute'}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto">
        {participants && participants.map((participant) => (
          <div
            key={participant.user._id}
            className={`bg-gray-700 rounded-lg p-4 flex flex-col items-center ${
              participant.user.isSpeaking ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mb-3 text-2xl font-bold text-white">
              {participant.user.displayName ? 
                participant.user.displayName[0].toUpperCase() :
                participant.user.username[0].toUpperCase()
              }
            </div>
            <p className="text-sm font-medium text-white text-center">
              {participant.user.displayName || participant.user.username}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {participant.role === 'creator' ? 'Host' : 'Participant'}
            </p>
            {peers[participant.user._id] && (
              <div className="mt-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900 text-green-100">
                  Connected
                </span>
              </div>
            )}
            {participant.user._id === socket?.id && isMuted && (
              <div className="mt-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-900 text-red-100">
                  Muted
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      <audio ref={audioRef} autoPlay muted={isMuted} />
      {Object.values(peers).map((peer, index) => (
        <audio key={index} autoPlay src={peer.audio} />
      ))}
    </div>
  );
};

export default AudioChat; 