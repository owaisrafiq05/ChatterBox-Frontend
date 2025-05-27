import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/profile`, {
                withCredentials: true
            });
            if (response.data.success) {
                setUser(response.data.data);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (userData, token) => {
        setUser(userData);
        navigate('/dashboard');
    };

    const logout = async () => {
        try {
            await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
                withCredentials: true
            });
            setUser(null);
            navigate('/login');
            toast.success('Logged out successfully');
        } catch (error) {
            console.error('Logout failed:', error);
            toast.error('Failed to logout');
        }
    };

    const updateProfile = async (profileData) => {
        try {
            const response = await axios.put(
                `${import.meta.env.VITE_API_URL}/api/auth/profile`,
                profileData,
                { withCredentials: true }
            );
            if (response.data.success) {
                setUser(response.data.data);
                toast.success('Profile updated successfully');
            }
        } catch (error) {
            console.error('Profile update failed:', error);
            toast.error('Failed to update profile');
        }
    };

    const value = {
        user,
        loading,
        login,
        logout,
        updateProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}; 