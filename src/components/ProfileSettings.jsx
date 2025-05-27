import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import axios from 'axios';

const ProfileSettings = () => {
    const { user, updateProfile } = useAuth();
    const [formData, setFormData] = useState({
        displayName: '',
        bio: ''
    });
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                displayName: user.displayName || '',
                bio: user.bio || ''
            });
            setPreviewUrl(user.avatar || '');
        }
    }, [user]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error('Please select an image file');
                return;
            }
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size should be less than 5MB');
                return;
            }
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formDataToSend = new FormData();
            
            // Only append fields that have values
            if (formData.displayName) {
                formDataToSend.append('displayName', formData.displayName);
            }
            if (formData.bio) {
                formDataToSend.append('bio', formData.bio);
            }
            if (selectedFile) {
                formDataToSend.append('avatar', selectedFile);
            }

            console.log('Sending form data:', {
                displayName: formData.displayName,
                bio: formData.bio,
                hasFile: !!selectedFile,
                fileName: selectedFile?.name
            });

            const response = await axios.put(
                `${import.meta.env.VITE_API_URL}/api/auth/profile`,
                formDataToSend,
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.data.success) {
                toast.success('Profile updated successfully');
                updateProfile(response.data.data);
                // Clear the selected file after successful upload
                setSelectedFile(null);
            }
        } catch (error) {
            console.error('Profile update error:', error);
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-[#242424] rounded-lg shadow-xl p-8">
                    <h2 className="text-2xl font-bold text-white mb-8">Profile Settings</h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Avatar Upload */}
                        <div className="flex items-center space-x-6">
                            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-700">
                                <img
                                    src={previewUrl || '/default-avatar.png'}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Profile Picture
                                </label>
                                <input
                                    type="file"
                                    id="avatar"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                                <button
                                    type="button"
                                    onClick={() => document.getElementById('avatar').click()}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Change Avatar
                                </button>
                                <p className="mt-2 text-xs text-gray-400">
                                    Max file size: 5MB. Supported formats: JPG, PNG, GIF
                                </p>
                            </div>
                        </div>

                        {/* Display Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Display Name
                            </label>
                            <input
                                type="text"
                                id="displayName"
                                value={formData.displayName}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white 
                                         focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="Enter your display name"
                            />
                        </div>

                        {/* Bio */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Bio
                            </label>
                            <textarea
                                id="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                rows="4"
                                className="w-full px-4 py-2.5 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white 
                                         focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="Tell us about yourself"
                            />
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                                         transition-colors flex items-center"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Saving...
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfileSettings; 