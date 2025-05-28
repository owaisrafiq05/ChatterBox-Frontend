import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getRoom, joinRoom, leaveRoom, updateRoomStatus } from '../features/rooms/roomSlice';
import { useAuth } from '../contexts/AuthContext';
import { initSocket, on, off, joinRoom as socketJoinRoom, leaveRoom as socketLeaveRoom } from '../services/socketService';
import { userService } from '../services/userService';
import TextChat from './TextChat';
import AudioChat from './AudioChat';
import { toast } from 'sonner';
import { debounce } from 'lodash';

const Room = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentRoom } = useSelector((state) => state.rooms);
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [accessCode, setAccessCode] = useState('');
  const [showAccessCodeModal, setShowAccessCodeModal] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const messagesRef = useRef(messages);
  const lastActivityRef = useRef(null);
  const lastRoomUpdateRef = useRef(Date.now());
  const roomUpdateTimeoutRef = useRef(null);

  // Debounced room update function
  const debouncedRoomUpdate = useCallback(
    debounce(() => {
      const now = Date.now();
      if (now - lastRoomUpdateRef.current >= 5000) { // Minimum 5 seconds between updates
        dispatch(getRoom(id));
        lastRoomUpdateRef.current = now;
      }
    }, 1000), // 1 second debounce
    [dispatch, id]
  );

  // Function to safely update room
  const safeUpdateRoom = useCallback(() => {
    if (roomUpdateTimeoutRef.current) {
      clearTimeout(roomUpdateTimeoutRef.current);
    }
    debouncedRoomUpdate();
  }, [debouncedRoomUpdate]);

  // Keep messagesRef in sync with messages state
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Cleanup function for debounced updates
  useEffect(() => {
    return () => {
      debouncedRoomUpdate.cancel();
      if (roomUpdateTimeoutRef.current) {
        clearTimeout(roomUpdateTimeoutRef.current);
      }
    };
  }, [debouncedRoomUpdate]);

  // Initial room load
  useEffect(() => {
    if (user) {
      dispatch(getRoom(id));
      // Set up periodic room updates every 30 seconds
      const interval = setInterval(() => {
        const now = Date.now();
        if (now - lastRoomUpdateRef.current >= 5000) {
          dispatch(getRoom(id));
          lastRoomUpdateRef.current = now;
        }
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [id, dispatch, user]);

  // Function to check if an activity is duplicate
  const isDuplicateActivity = (newActivity) => {
    const lastActivity = lastActivityRef.current;
    if (!lastActivity) return false;

    const timeDiff = Math.abs(new Date(newActivity.timestamp) - new Date(lastActivity.timestamp));
    return (
      lastActivity.type === newActivity.type &&
      lastActivity.userId === newActivity.userId &&
      timeDiff < 2000 // 2 seconds threshold
    );
  };

  // Function to add activity
  const addActivity = useCallback((activity) => {
    if (!isDuplicateActivity(activity)) {
      lastActivityRef.current = activity;
      setRecentActivity(prev => [activity, ...prev.slice(0, 9)]);
      safeUpdateRoom();
    }
  }, [safeUpdateRoom]);

  // Handle incoming chat message
  const handleChatMessage = useCallback((message) => {
    console.log('Received message:', message);
    setMessages(prev => [...prev, message]);
  }, []);

  // Handle error
  const handleError = useCallback((error) => {
    setConnectionError(error);
  }, []);

  // Handle user joined
  const handleUserJoined = useCallback(async (data) => {
    console.log('User joined:', data);
    try {
      // Try to get user info from room data first
      let displayName = data.room?.participants?.find(p => p.user._id === data.userId)?.user?.displayName;
      
      // If not found in room data, fetch from API
      if (!displayName) {
        const userInfo = await userService.getUserById(data.userId);
        displayName = userInfo.displayName;
      }

      const activity = {
        type: 'join',
        userId: data.userId,
        displayName: displayName || 'Unknown User',
        timestamp: new Date()
      };

      addActivity(activity);
    } catch (error) {
      console.error('Error handling user joined:', error);
      const activity = {
        type: 'join',
        userId: data.userId,
        displayName: 'Unknown User',
        timestamp: new Date()
      };
      addActivity(activity);
    }
  }, [addActivity]);

  // Handle user left
  const handleUserLeft = useCallback(async (data) => {
    console.log('User left:', data);
    try {
      // Try to get user info from room data first
      let displayName = data.room?.participants?.find(p => p.user._id === data.userId)?.user?.displayName;
      
      // If not found in room data, fetch from API
      if (!displayName) {
        const userInfo = await userService.getUserById(data.userId);
        displayName = userInfo.displayName;
      }

      const activity = {
        type: 'leave',
        userId: data.userId,
        displayName: displayName || 'Unknown User',
        timestamp: new Date()
      };

      addActivity(activity);
    } catch (error) {
      console.error('Error handling user left:', error);
      const activity = {
        type: 'leave',
        userId: data.userId,
        displayName: 'Unknown User',
        timestamp: new Date()
      };
      addActivity(activity);
    }
  }, [addActivity]);

  useEffect(() => {
    if (user?.token) {
      const newSocket = initSocket(user.token);
      setSocket(newSocket);

      on('chatMessage', handleChatMessage);
      on('error', handleError);
      on('userJoined', handleUserJoined);
      on('userLeft', handleUserLeft);

      socketJoinRoom(id);

      return () => {
        off('chatMessage', handleChatMessage);
        off('error', handleError);
        off('userJoined', handleUserJoined);
        off('userLeft', handleUserLeft);
        socketLeaveRoom(id);
      };
    }
  }, [user?.token, id, handleChatMessage, handleError, handleUserJoined, handleUserLeft]);

  useEffect(() => {
    if (currentRoom) {
      if (!currentRoom.isPublic && !accessCode) {
        setShowAccessCodeModal(true);
      }
      setParticipants(currentRoom.participants);

      if (currentRoom.messages) {
        const existingMessages = currentRoom.messages.map(msg => ({
          userId: msg.sender._id,
          displayName: msg.sender.displayName || 'Anonymous',
          message: msg.content,
          timestamp: msg.timestamp
        }));
        
        if (existingMessages.length > messagesRef.current.length) {
          setMessages(existingMessages);
        }
      }
    }
  }, [currentRoom, accessCode]);

  const handleJoinRoom = async () => {
    try {
      await dispatch(joinRoom({ roomId: id, accessCode })).unwrap();
      setShowAccessCodeModal(false);
      socketJoinRoom(id);
    } catch (error) {
      toast.error(error.message || 'Failed to join room');
    }
  };

  const handleLeaveRoom = () => {
    dispatch(leaveRoom(id));
    socketLeaveRoom(id);
    navigate('/');
  };

  const handleToggleLive = async () => {
    try {
      await dispatch(updateRoomStatus({
        roomId: id,
        status: currentRoom.status === 'inactive' ? 'live' : 'inactive'
      })).unwrap();
      toast.success(`Room is now ${currentRoom.status === 'inactive' ? 'live' : 'inactive'}`);
    } catch (error) {
      toast.error('Failed to update room status');
    }
  };

  if (!user || !currentRoom) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const isCreator = currentRoom.creator._id === user._id;

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">{currentRoom.name}</h1>
            <p className="text-gray-400 mt-1">
              {currentRoom.participants?.length || 0} participants
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {isCreator && (
              <button
                onClick={handleToggleLive}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentRoom.status === 'inactive'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-yellow-600 hover:bg-yellow-700'
                } text-white`}
              >
                {currentRoom.status === 'inactive' ? 'Go Live' : 'End Session'}
              </button>
            )}
            <button
              onClick={handleLeaveRoom}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Leave Room
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <AudioChat
              socket={socket}
              roomId={id}
              participants={participants}
              user={user}
            />
            
            {/* Recent Activity Feed */}
            <div className="mt-6 bg-[#242424] rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-2">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="text-sm text-gray-400">
                    <span className="font-medium text-white">{activity.displayName}</span>
                    {activity.type === 'join' ? ' joined ' : ' left '}
                    the room
                    <span className="text-xs ml-2">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div>
            <TextChat
              socket={socket}
              roomId={id}
              messages={messages}
              user={user}
            />
          </div>
        </div>
      </div>

      {/* Access Code Modal */}
      {showAccessCodeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-[#242424] rounded-xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">Enter Access Code</h2>
            <input
              type="text"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              className="w-full px-4 py-2 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 mb-4"
              placeholder="Enter access code"
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleJoinRoom}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Join Room
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Room; 