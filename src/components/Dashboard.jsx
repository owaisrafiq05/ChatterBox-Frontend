import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import axios from 'axios';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [showCreateRoom, setShowCreateRoom] = useState(false);
    const [showJoinPrivate, setShowJoinPrivate] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [roomData, setRoomData] = useState({
        name: '',
        isPrivate: false,
        password: ''
    });
    const [joinPassword, setJoinPassword] = useState('');
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRooms();
        
        // Set up polling every 5 seconds
        const interval = setInterval(loadRooms, 5000);
        
        // Cleanup interval on component unmount
        return () => clearInterval(interval);
    }, []);

    const loadRooms = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/rooms`,
                { 
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            setRooms(response.data.data);
        } catch (error) {
            console.error('Error loading rooms:', error);
            toast.error(error.response?.data?.message || 'Failed to load rooms');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRoom = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/rooms`,
                roomData,
                { 
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            toast.success('Room created successfully');
            setShowCreateRoom(false);
            setRoomData({ name: '', isPrivate: false, password: '' });
            await loadRooms();
            navigate(`/room/${response.data.data._id}`);
        } catch (error) {
            console.error('Error creating room:', error);
            toast.error(error.response?.data?.message || 'Failed to create room');
        }
    };

    const handleJoinRoom = async (room) => {
        if (room.isPrivate) {
            setSelectedRoom(room);
            setShowJoinPrivate(true);
            return;
        }

        try {
            await axios.post(
                `${import.meta.env.VITE_API_URL}/api/rooms/${room._id}/join`,
                {},
                { 
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            navigate(`/room/${room._id}`);
        } catch (error) {
            console.error('Error joining room:', error);
            toast.error(error.response?.data?.message || 'Failed to join room');
        }
    };

    const handleJoinPrivateRoom = async () => {
        if (!selectedRoom) return;

        try {
            await axios.post(
                `${import.meta.env.VITE_API_URL}/api/rooms/${selectedRoom._id}/join`,
                { password: joinPassword },
                { 
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            setShowJoinPrivate(false);
            setJoinPassword('');
            navigate(`/room/${selectedRoom._id}`);
        } catch (error) {
            console.error('Error joining private room:', error);
            toast.error(error.response?.data?.message || 'Failed to join room');
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.displayName || 'User'}</h1>
                        <p className="text-gray-600 mt-1">Join or create an audio chat room</p>
                    </div>
                    <button
                        onClick={() => setShowCreateRoom(true)}
                        className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        Create Room
                    </button>
                </div>

                {/* Active Rooms Section */}
                <div className="bg-black rounded-xl p-6 mb-8">
                    <h2 className="text-2xl font-bold text-white mb-6">Active Rooms</h2>
                    {loading ? (
                        <div className="text-white">Loading rooms...</div>
                    ) : rooms.length === 0 ? (
                        <div className="text-white">No active rooms available</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {rooms.map((room) => (
                                <div
                                    key={room._id}
                                    className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-xl font-semibold text-gray-900">{room.name}</h3>
                                        {room.isPrivate && (
                                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded">
                                                Private
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center text-gray-600 mb-4">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        {room.participants.length} participants
                                    </div>
                                    <button
                                        onClick={() => handleJoinRoom(room)}
                                        className="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                                    >
                                        Join Room
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Create Room Modal */}
                {showCreateRoom && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl p-8 max-w-md w-full">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Room</h2>
                            <form onSubmit={handleCreateRoom}>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-medium mb-2">
                                        Room Name
                                    </label>
                                    <input
                                        type="text"
                                        value={roomData.name}
                                        onChange={(e) => setRoomData({ ...roomData, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                                        placeholder="Enter room name"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="flex items-center text-gray-700">
                                        <input
                                            type="checkbox"
                                            checked={roomData.isPrivate}
                                            onChange={(e) => setRoomData({ ...roomData, isPrivate: e.target.checked })}
                                            className="mr-2"
                                        />
                                        Make this room private
                                    </label>
                                </div>
                                {roomData.isPrivate && (
                                    <div className="mb-6">
                                        <label className="block text-gray-700 text-sm font-medium mb-2">
                                            Room Password
                                        </label>
                                        <input
                                            type="password"
                                            value={roomData.password}
                                            onChange={(e) => setRoomData({ ...roomData, password: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                                            placeholder="Enter room password"
                                            required
                                        />
                                    </div>
                                )}
                                <div className="flex justify-end space-x-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateRoom(false)}
                                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                                    >
                                        Create Room
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Join Private Room Modal */}
                {showJoinPrivate && selectedRoom && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl p-8 max-w-md w-full">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Join Private Room</h2>
                            <div className="mb-6">
                                <p className="text-gray-700 mb-4">
                                    Enter the password to join {selectedRoom.name}
                                </p>
                                <input
                                    type="password"
                                    value={joinPassword}
                                    onChange={(e) => setJoinPassword(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                                    placeholder="Enter room password"
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-4">
                                <button
                                    onClick={() => {
                                        setShowJoinPrivate(false);
                                        setSelectedRoom(null);
                                        setJoinPassword('');
                                    }}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleJoinPrivateRoom}
                                    className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                                >
                                    Join Room
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard; 