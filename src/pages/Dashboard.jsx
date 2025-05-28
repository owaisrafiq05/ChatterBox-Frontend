import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getRooms, createRoom } from '../features/rooms/roomSlice';
import RoomCard from '../components/RoomCard';
import CreateRoomModal from '../components/CreateRoomModal';

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { rooms, isLoading } = useSelector((state) => state.rooms);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getRooms());
    // Poll for room updates every 30 seconds
    const interval = setInterval(() => {
      dispatch(getRooms());
    }, 30000);
    return () => clearInterval(interval);
  }, [dispatch]);
 
  const handleCreateRoom = async (roomData) => {
    try {
      const result = await dispatch(createRoom(roomData)).unwrap();
      setIsModalOpen(false);
      navigate(`/room/${result._id}`);
    } catch (error) {
      console.error('Failed to create room:', error);
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
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Room
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No rooms available. Create one to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
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
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      room.status === 'live'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-500 text-white'
                    }`}
                  >
                    {room.status}
                  </span>
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

        <CreateRoomModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateRoom}
        />
      </div>
    </div>
  );
};

export default Dashboard; 