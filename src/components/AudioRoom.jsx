import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import io from 'socket.io-client';
import axios from 'axios';

const AudioRoom = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [room, setRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isMuted, setIsMuted] = useState(false);
    const [isInLobby, setIsInLobby] = useState(false);
    const [isCreator, setIsCreator] = useState(false);

    const socketRef = useRef();
    const audioStreamRef = useRef();
    const audioContextRef = useRef();
    const mediaRecorderRef = useRef();
    const audioChunksRef = useRef([]);

    useEffect(() => {
        // Initialize socket connection
        socketRef.current = io(import.meta.env.VITE_API_URL, {
            auth: {
                token: localStorage.getItem('token')
            }
        });

        // Load room details
        const loadRoom = async () => {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL}/api/rooms/${roomId}`,
                    { withCredentials: true }
                );
                setRoom(response.data.data);
                setIsCreator(response.data.data.creator._id === user._id);
                setIsInLobby(response.data.data.status === 'inactive');
            } catch (error) {
                toast.error('Failed to load room');
                navigate('/dashboard');
            }
        };

        loadRoom();

        // Socket event listeners
        socketRef.current.on('room_joined', () => {
            toast.success('Joined room successfully');
        });

        socketRef.current.on('user_joined', (data) => {
            toast.info(`${data.user.displayName} joined the room`);
        });

        socketRef.current.on('user_left', (data) => {
            toast.info(`${data.user.displayName} left the room`);
        });

        socketRef.current.on('new_message', (message) => {
            setMessages(prev => [...prev, message]);
        });

        socketRef.current.on('audio_stream', (data) => {
            if (!isMuted) {
                playAudio(data.audioData);
            }
        });

        socketRef.current.on('error', (error) => {
            toast.error(error);
        });

        // Join room
        socketRef.current.emit('join_room', roomId);

        // Initialize audio
        initializeAudio();

        return () => {
            cleanup();
        };
    }, [roomId, user._id]);

    const initializeAudio = async () => {
        try {
            audioStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioContextRef.current = new AudioContext();
            
            mediaRecorderRef.current = new MediaRecorder(audioStreamRef.current);
            
            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = () => {
                    socketRef.current.emit('audio_stream', {
                        roomId,
                        audioData: reader.result
                    });
                };
                audioChunksRef.current = [];
            };

            // Start recording
            mediaRecorderRef.current.start(100);
        } catch (error) {
            toast.error('Failed to access microphone');
        }
    };

    const playAudio = (audioData) => {
        const audio = new Audio(audioData);
        audio.play();
    };

    const cleanup = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
        }
        if (audioStreamRef.current) {
            audioStreamRef.current.getTracks().forEach(track => track.stop());
        }
        if (socketRef.current) {
            socketRef.current.disconnect();
        }
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        socketRef.current.emit('send_message', {
            roomId,
            content: newMessage
        });

        setNewMessage('');
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
        if (audioStreamRef.current) {
            audioStreamRef.current.getAudioTracks().forEach(track => {
                track.enabled = isMuted;
            });
        }
    };

    const makeRoomLive = async () => {
        try {
            await axios.put(
                `${import.meta.env.VITE_API_URL}/api/rooms/${roomId}/status`,
                { status: 'live' },
                { withCredentials: true }
            );
            setIsInLobby(false);
            toast.success('Room is now live!');
        } catch (error) {
            toast.error('Failed to make room live');
        }
    };

    const leaveRoom = async () => {
        try {
            await axios.delete(
                `${import.meta.env.VITE_API_URL}/api/rooms/${roomId}/leave`,
                { withCredentials: true }
            );
            navigate('/dashboard');
        } catch (error) {
            toast.error('Failed to leave room');
        }
    };

    if (!room) return <div>Loading...</div>;

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Room Header */}
                <div className="bg-black rounded-xl p-6 mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-white">{room.name}</h1>
                            <p className="text-gray-400 mt-1">
                                {room.participants.length} participants
                            </p>
                        </div>
                        <div className="flex space-x-4">
                            {isCreator && isInLobby && (
                                <button
                                    onClick={makeRoomLive}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    Make Room Live
                                </button>
                            )}
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
                            <button
                                onClick={leaveRoom}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                Leave Room
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Participants List */}
                    <div className="lg:col-span-1">
                        <div className="bg-black rounded-xl p-6">
                            <h2 className="text-xl font-bold text-white mb-4">Participants</h2>
                            <div className="space-y-4">
                                {room.participants.map((participant) => (
                                    <div
                                        key={participant.user._id}
                                        className="flex items-center space-x-3 bg-white rounded-lg p-3"
                                    >
                                        <img
                                            src={participant.user.avatar || '/default-avatar.png'}
                                            alt={participant.user.displayName}
                                            className="w-10 h-10 rounded-full"
                                        />
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {participant.user.displayName}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {participant.status}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Chat Section */}
                    <div className="lg:col-span-2">
                        <div className="bg-black rounded-xl p-6 h-[600px] flex flex-col">
                            <h2 className="text-xl font-bold text-white mb-4">Chat</h2>
                            <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                                {messages.map((message, index) => (
                                    <div
                                        key={index}
                                        className="bg-white rounded-lg p-3"
                                    >
                                        <div className="flex items-center space-x-2 mb-1">
                                            <img
                                                src={message.user.avatar || '/default-avatar.png'}
                                                alt={message.user.displayName}
                                                className="w-6 h-6 rounded-full"
                                            />
                                            <span className="font-medium text-gray-900">
                                                {message.user.displayName}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                {new Date(message.timestamp).toLocaleTimeString()}
                                            </span>
                                        </div>
                                        <p className="text-gray-700">{message.content}</p>
                                    </div>
                                ))}
                            </div>
                            <form onSubmit={handleSendMessage} className="flex space-x-4">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                                />
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Send
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AudioRoom; 