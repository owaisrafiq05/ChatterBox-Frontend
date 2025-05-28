import axiosInstance from '../utils/axiosConfig';

const API_URL = '/api/rooms';

export const roomService = {
    // Get all rooms
    getRooms: async () => {
        try {
            console.log('Fetching rooms from API...');
            const response = await axiosInstance.get(API_URL);
            console.log('API Response:', response);
            return response.data;
        } catch (error) {
            console.error('Error fetching rooms:', error);
            throw error;
        }
    },

    // Get a single room
    getRoom: async (roomId) => {
        const response = await axiosInstance.get(`${API_URL}/${roomId}`);
        return response.data;
    },

    // Create a new room
    createRoom: async (roomData) => {
        const response = await axiosInstance.post(API_URL, {
            name: roomData.name,
            description: roomData.description || '',
            isPublic: roomData.isPublic,
            accessCode: !roomData.isPublic ? roomData.accessCode : undefined
        });
        return response.data;
    },

    // Join a room
    joinRoom: async (roomId, accessCode) => {
        const response = await axiosInstance.post(`${API_URL}/${roomId}/join`, {
            accessCode
        });
        return response.data;
    },

    // Leave a room
    leaveRoom: async (roomId) => {
        const response = await axiosInstance.post(`${API_URL}/${roomId}/leave`);
        return response.data;
    },

    // Update room status
    updateRoomStatus: async (roomId, status) => {
        const response = await axiosInstance.patch(`${API_URL}/${roomId}/status`, {
            status
        });
        return response.data;
    },

    // Send message in room
    sendMessage: async (roomId, content) => {
        const response = await axiosInstance.post(`${API_URL}/${roomId}/messages`, { content });
        return response.data;
    }
}; 