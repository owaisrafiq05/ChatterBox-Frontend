import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getRooms, createRoom } from '../features/rooms/roomSlice';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

const Dashboard = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useAuth();
    const { rooms, isLoading, isError, message } = useSelector((state) => {
        console.log('Redux state:', state);
        return state.rooms;
    });
    const [showCreateRoom, setShowCreateRoom] = useState(false);
    const [roomData, setRoomData] = useState({
        name: '',
        description: '',
        isPublic: true,
        accessCode: ''
    });

    useEffect(() => {
        console.log('Fetching rooms...');
        dispatch(getRooms());
        // Poll for room updates every 30 seconds
        const interval = setInterval(() => {
            console.log('Polling rooms...');
            dispatch(getRooms());
        }, 30000);
        return () => clearInterval(interval);
    }, [dispatch]);

    useEffect(() => {
        console.log('Current rooms:', rooms);
        if (isError) {
            toast.error(message || 'Failed to fetch rooms');
        }
    }, [rooms, isError, message]);

    const handleCreateRoom = async (e) => {
        e.preventDefault();
        try {
            const result = await dispatch(createRoom(roomData)).unwrap();
            toast.success('Room created successfully');
            setShowCreateRoom(false);
            setRoomData({
                name: '',
                description: '',
                isPublic: true,
                accessCode: ''
            });
            navigate(`/room/${result._id}`);
        } catch (error) {
            console.error('Error creating room:', error);
            toast.error(error.response?.data?.message || 'Failed to create room');
        }
    };

    return (
        <div className="min-h-screen bg-[#1a1a1a] text-white p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Welcome, {user?.displayName || 'User'}</h1>
                        <p className="text-gray-400 mt-1">Join or create an audio chat room</p>
                    </div>
                    <button
                        onClick={() => setShowCreateRoom(true)}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Create Room
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : rooms?.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-400">No rooms available. Create one to get started!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {rooms?.filter(room => 
                            room.creator._id === user._id ? true : room.status === 'live'
                        ).map((room) => (
                            <div
                                key={room._id}
                                className="bg-[#242424] rounded-lg p-6 hover:bg-[#2a2a2a] transition-colors"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-semibold">{room.name}</h3>
                                        <p className="text-gray-400 text-sm mt-1">
                                            {room.description || 'No description'}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end space-y-2">
                                        <span
                                            className={`text-xs px-2 py-1 rounded-full ${
                                                room.status === 'live'
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-gray-500 text-white'
                                            }`}
                                        >
                                            {room.status}
                                        </span>
                                        {room.creator._id === user._id && (
                                            <span className="text-xs text-gray-400">Your Room</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex justify-between items-center mt-4">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-gray-400">
                                            Created by: {room.creator.displayName}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/room/${room._id}`)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                    >
                                        Join Room
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {showCreateRoom && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                        <div className="bg-[#242424] rounded-xl p-8 max-w-md w-full">
                            <h2 className="text-2xl font-bold mb-6">Create Room</h2>
                            <form onSubmit={handleCreateRoom}>
                                <div className="mb-6">
                                    <label className="block text-sm text-gray-400 mb-2">Room Name</label>
                                    <input
                                        type="text"
                                        value={roomData.name}
                                        onChange={(e) => setRoomData({ ...roomData, name: e.target.value })}
                                        className="w-full px-4 py-2 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div className="mb-6">
                                    <label className="block text-sm text-gray-400 mb-2">Description</label>
                                    <textarea
                                        value={roomData.description}
                                        onChange={(e) => setRoomData({ ...roomData, description: e.target.value })}
                                        className="w-full px-4 py-2 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                        rows={3}
                                    />
                                </div>
                                <div className="mb-6">
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={roomData.isPublic}
                                            onChange={(e) => setRoomData({ ...roomData, isPublic: e.target.checked })}
                                            className="form-checkbox text-blue-600"
                                        />
                                        <span className="text-sm text-gray-400">Public Room</span>
                                    </label>
                                </div>
                                {!roomData.isPublic && (
                                    <div className="mb-6">
                                        <label className="block text-sm text-gray-400 mb-2">Access Code</label>
                                        <input
                                            type="text"
                                            value={roomData.accessCode}
                                            onChange={(e) => setRoomData({ ...roomData, accessCode: e.target.value })}
                                            className="w-full px-4 py-2 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                            required={!roomData.isPublic}
                                        />
                                    </div>
                                )}
                                <div className="flex justify-end space-x-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateRoom(false)}
                                        className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                    >
                                        Create Room
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard; 