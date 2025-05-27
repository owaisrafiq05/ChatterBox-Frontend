import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const validateForm = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            toast.error('Please enter a valid email address');
            return false;
        }
        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters long');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/auth/login`,
                formData,
                { withCredentials: true }
            );

            if (response.data.success) {
                toast.success('Login successful!');
                login(response.data.data, response.data.token);
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left side - Branding */}
            <div className="w-full lg:w-1/2 hidden lg:block relative">
                <div className="absolute inset-0 bg-black bg-opacity-30 z-10 flex flex-col justify-center items-center">
                    <div className="text-center p-8">
                        <h1 className="text-5xl font-bold text-white mb-4">ChatterBox</h1>
                        <p className="text-xl text-white mb-8">Real-time audio chat rooms for meaningful conversations</p>
                        <div className="flex flex-col space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="bg-blue-600 p-2 rounded-full">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                </div>
                                <span className="text-white">Real-time audio conversations</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="bg-blue-600 p-2 rounded-full">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                </div>
                                <span className="text-white">Create and join chat rooms</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="bg-blue-600 p-2 rounded-full">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                </div>
                                <span className="text-white">Connect with people worldwide</span>
                            </div>
                        </div>
                    </div>
                </div>
                <img
                    src="/images/chat-background.jpg"
                    alt="ChatterBox"
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Right side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-gradient-to-br from-blue-700 via-blue-900 to-[#1a1a1a] p-4">
                <div className="w-full max-w-[500px] p-8 bg-[#242424] rounded-lg shadow-2xl">
                    <div className="mobile-logo block lg:hidden mb-4 text-center">
                        <h1 className="text-3xl font-bold text-white">ChatterBox</h1>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-6 text-center">Welcome back!</h2>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="text-sm text-gray-300 mb-1.5 block">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white 
                                         focus:outline-none focus:border-blue-500 transition-colors"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-sm text-gray-300 mb-1.5 block">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white 
                                         focus:outline-none focus:border-blue-500 transition-colors"
                                required
                            />
                        </div>

                        <div className="mt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
                                        transition-colors duration-200 font-medium flex items-center justify-center"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Logging in...
                                    </>
                                ) : (
                                    "Log In"
                                )}
                            </button>
                        </div>

                        <p className="text-center text-gray-400 text-sm mt-6">
                            Don't have an account?{" "}
                            <a
                                href="/signup"
                                className="text-blue-500 hover:text-blue-400 transition-colors"
                            >
                                Sign up
                            </a>
                        </p>

                        <div className="pt-4 text-xs text-center text-gray-500">
                            By logging in, you agree to ChatterBox's{" "}
                            <a href="/terms" className="text-blue-500 hover:text-blue-400 ml-1">Terms of Service</a> and{" "}
                            <a href="/privacy" className="text-blue-500 hover:text-blue-400 ml-1">Privacy Policy</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login; 