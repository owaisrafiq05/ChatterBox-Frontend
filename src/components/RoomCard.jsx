import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { updateRoomStatus } from '../features/rooms/roomSlice';

const RoomCard = ({ room, user }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isCreator = room.creator._id === user._id;

  const handleStatusChange = () => {
    if (isCreator) {
      dispatch(
        updateRoomStatus({
          roomId: room._id,
          status: room.status === 'inactive' ? 'live' : 'inactive',
        })
      );
    }
  };

  const handleJoinRoom = () => {
    navigate(`/rooms/${room._id}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-semibold">{room.name}</h2>
        <span
          className={`px-2 py-1 rounded text-sm ${
            room.status === 'live'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {room.status}
        </span>
      </div>

      <p className="text-gray-600 mb-4">{room.description || 'No description'}</p>

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          <p>Created by: {room.creator.displayName}</p>
          <p>Participants: {room.participants.length}</p>
        </div>

        <div className="space-x-2">
          {isCreator && (
            <button
              onClick={handleStatusChange}
              className={`px-4 py-2 rounded-md ${
                room.status === 'inactive'
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              {room.status === 'inactive' ? 'Go Live' : 'End Session'}
            </button>
          )}
          <button
            onClick={handleJoinRoom}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
            disabled={!isCreator && room.status === 'inactive'}
          >
            {room.isPublic ? 'Join' : 'Enter Code'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomCard; 