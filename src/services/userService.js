import axiosInstance from '../utils/axiosConfig';

const API_URL = '/api/users';

export const userService = {
    // Get current user profile
    getProfile: async () => {
        const response = await axiosInstance.get('/api/auth/me');
        return response.data;
    },

    // Update user profile
    updateProfile: async (formData) => {
        // Log the FormData contents for debugging
        console.log('FormData contents:');
        for (let [key, value] of formData.entries()) {
            console.log(key, value);
        }

        const response = await axiosInstance.put('/api/auth/profile', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to update profile');
        }

        return response.data.data;
    },

    // Get user by ID
    getUserById: async (userId) => {
        try {
            const response = await axiosInstance.get(`${API_URL}/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user:', error);
            throw error;
        }
    }
}; 