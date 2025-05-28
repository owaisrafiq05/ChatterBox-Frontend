import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import axiosInstance from '../utils/axiosConfig';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Set up axios interceptor when user changes
    useEffect(() => {
        if (user?.token) {
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
        } else {
            delete axiosInstance.defaults.headers.common['Authorization'];
        }
    }, [user]);

    // Initial auth check
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const savedUser = localStorage.getItem('user');
            if (!savedUser) {
                setUser(null);
                setLoading(false);
                return;
            }

            const parsedUser = JSON.parse(savedUser);
            
            if (!parsedUser.token) {
                setUser(null);
                localStorage.removeItem('user');
                setLoading(false);
                return;
            }

            // Set token in axios instance
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;

            // Verify token with backend
            const response = await axiosInstance.get('/api/auth/me');
            if (response.data) {
                // Update user data with latest from server but keep the token
                setUser({
                    ...response.data,
                    token: parsedUser.token
                });
            } else {
                handleLogout();
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            handleLogout();
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('user');
        delete axiosInstance.defaults.headers.common['Authorization'];
    };

    const login = async (userData) => {
        try {
            const response = await axiosInstance.post('/api/auth/login', userData);
            const userWithToken = response.data;
            
            // Set token in axios instance
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${userWithToken.token}`;
            
            // Save user data
            localStorage.setItem('user', JSON.stringify(userWithToken));
            setUser(userWithToken);
            
            navigate('/dashboard');
            return true;
        } catch (error) {
            console.error('Login failed:', error);
            toast.error(error.response?.data?.message || 'Login failed');
            return false;
        }
    };

    const register = async (userData) => {
        try {
            const response = await axiosInstance.post('/api/auth/register', userData);
            const userWithToken = response.data;
            
            // Set token in axios instance
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${userWithToken.token}`;
            
            // Save user data
            localStorage.setItem('user', JSON.stringify(userWithToken));
            setUser(userWithToken);
            
            navigate('/dashboard');
            return true;
        } catch (error) {
            console.error('Registration failed:', error);
            toast.error(error.response?.data?.message || 'Registration failed');
            return false;
        }
    };

    const logout = async () => {
        try {
            await axiosInstance.post('/api/auth/logout');
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            handleLogout();
            navigate('/login');
            toast.success('Logged out successfully');
        }
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        checkAuth
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider; 