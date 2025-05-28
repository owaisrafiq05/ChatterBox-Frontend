import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/userService';

const ProfileSettings = () => {
    const { user, setUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        displayName: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                displayName: user.displayName || '',
                email: user.email || ''
            }));
            setAvatarPreview(user.avatar);
        }
    }, [user]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast.error('Image size should be less than 5MB');
                return;
            }
            setAvatar(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const validatePasswordChange = () => {
        if (formData.newPassword && !formData.currentPassword) {
            toast.error('Please enter your current password');
            return false;
        }
        if (formData.newPassword && formData.newPassword.length < 6) {
            toast.error('New password must be at least 6 characters long');
            return false;
        }
        if (formData.newPassword !== formData.confirmNewPassword) {
            toast.error('New passwords do not match');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validatePasswordChange()) return;

        setLoading(true);
        try {
            // Create FormData object
            const formDataObj = new FormData();
            
            // Always add displayName if it exists (since it's required)
            if (formData.displayName) {
                formDataObj.append('displayName', formData.displayName);
            }
            
            // Add avatar if changed
            if (avatar) {
                formDataObj.append('avatar', avatar);
            }
            
            // Add password fields if provided
            if (formData.newPassword && formData.currentPassword) {
                formDataObj.append('currentPassword', formData.currentPassword);
                formDataObj.append('newPassword', formData.newPassword);
            }

            // Only make the API call if there are changes
            if ([...formDataObj.entries()].length > 0) {
                const updatedUser = await userService.updateProfile(formDataObj);
                setUser(updatedUser);
                toast.success('Profile updated successfully');
                
                // Clear password fields
                setFormData(prev => ({
                    ...prev,
                    currentPassword: '',
                    newPassword: '',
                    confirmNewPassword: ''
                }));
                
                // Clear avatar state
                setAvatar(null);
            } else {
                toast.error('No changes to update');
            }
        } catch (error) {
            console.error('Profile update error:', error);
            toast.error(error.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#1a1a1a] text-white p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Avatar Section */}
                    <div className="bg-[#242424] rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">Profile Picture</h2>
                        <div className="flex items-center space-x-6">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-700">
                                    <img
                                        src={avatarPreview || '/default-avatar.png'}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <input
                                    type="file"
                                    id="avatar"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    className="hidden"
                                />
                            </div>
                            <label
                                htmlFor="avatar"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                            >
                                Change Picture
                            </label>
                        </div>
                    </div>

                    {/* General Information */}
                    <div className="bg-[#242424] rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">General Information</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-300 mb-1.5 block">Display Name</label>
                                <input
                                    type="text"
                                    id="displayName"
                                    value={formData.displayName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-[#2a2a2a] border border-gray-700 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-300 mb-1.5 block">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={formData.email}
                                    disabled
                                    className="w-full px-4 py-2.5 bg-[#2a2a2a] border border-gray-700 rounded-lg opacity-60 cursor-not-allowed"
                                />
                                <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                            </div>
                        </div>
                    </div>

                    {/* Change Password */}
                    <div className="bg-[#242424] rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">Change Password</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-300 mb-1.5 block">Current Password</label>
                                <input
                                    type="password"
                                    id="currentPassword"
                                    value={formData.currentPassword}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-[#2a2a2a] border border-gray-700 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-300 mb-1.5 block">New Password</label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-[#2a2a2a] border border-gray-700 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-300 mb-1.5 block">Confirm New Password</label>
                                <input
                                    type="password"
                                    id="confirmNewPassword"
                                    value={formData.confirmNewPassword}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-[#2a2a2a] border border-gray-700 rounded-lg"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Saving Changes...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileSettings; 