import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getRoom, joinRoom, leaveRoom } from '../features/rooms/roomSlice';
import { initSocket, on, off, joinRoom as socketJoinRoom, leaveRoom as socketLeaveRoom } from '../services/socketService';
import TextChat from '../components/TextChat';
import AudioChat from '../components/AudioChat';

const Room = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentRoom } = useSelector((state) => state.rooms);
  const { user } = useSelector((state) => state.auth);
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [accessCode, setAccessCode] = useState('');
  const [showAccessCodeModal, setShowAccessCodeModal] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [participants, setParticipants] = useState([]);
  const messagesRef = useRef(messages);

  // Keep messagesRef in sync with messages state
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

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
  const handleUserJoined = useCallback((data) => {
    console.log('User joined:', data);
    dispatch(getRoom(id)); // Refresh room data to get updated participants
  }, [dispatch, id]);

  // Handle user left
  const handleUserLeft = useCallback((data) => {
    console.log('User left:', data);
    dispatch(getRoom(id)); // Refresh room data to get updated participants
  }, [dispatch, id]);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = initSocket(user.token);
    setSocket(newSocket);

    // Set up event handlers
    on('chatMessage', handleChatMessage);
    on('error', handleError);
    on('userJoined', handleUserJoined);
    on('userLeft', handleUserLeft);

    // Join room on socket connection
    socketJoinRoom(id);

    return () => {
      // Cleanup event handlers and leave room
      off('chatMessage', handleChatMessage);
      off('error', handleError);
      off('userJoined', handleUserJoined);
      off('userLeft', handleUserLeft);
      socketLeaveRoom(id);
    };
  }, [user.token, id, handleChatMessage, handleError, handleUserJoined, handleUserLeft]);

  useEffect(() => {
    dispatch(getRoom(id));
  }, [id, dispatch]);

  useEffect(() => {
    if (currentRoom) {
      if (!currentRoom.isPublic && !accessCode) {
        setShowAccessCodeModal(true);
      }
      setParticipants(currentRoom.participants);

      // Load existing messages if any
      if (currentRoom.messages) {
        const existingMessages = currentRoom.messages.map(msg => ({
          userId: msg.sender._id,
          message: msg.content,
          timestamp: msg.timestamp
        }));
        
        // Only update if we don't already have these messages
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
      alert(error);
    }
  };

  const handleLeaveRoom = () => {
    dispatch(leaveRoom(id));
    socketLeaveRoom(id);
    navigate('/');
  };

  if (!currentRoom) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-[calc(100vh-4rem)]">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">{currentRoom.name}</h1>
          <p className="text-gray-600">{currentRoom.description}</p>
        </div>
        <button
          onClick={handleLeaveRoom}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
        >
          Leave Room
        </button>
      </div>

      {connectionError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {connectionError}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 h-[calc(100%-2rem)]">
        <div className="col-span-2">
          <AudioChat
            socket={socket}
            roomId={id}
            participants={participants}
          />
        </div>
        <div className="col-span-1">
          <TextChat
            socket={socket}
            roomId={id}
            messages={messages}
            currentUser={user}
          />
        </div>
      </div>

      {showAccessCodeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Enter Access Code</h2>
            <input
              type="text"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 mb-4"
              placeholder="Enter room access code"
            />
            <button
              onClick={handleJoinRoom}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md"
            >
              Join Room
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Room; 