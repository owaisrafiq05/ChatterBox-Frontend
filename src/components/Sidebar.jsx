import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path;
    };

    const navItems = [
        {
            name: 'Dashboard',
            path: '/dashboard',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            )
        },
        {
            name: 'Chat Rooms',
            path: '/rooms',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
            )
        },
        {
            name: 'Profile',
            path: '/profile',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            )
        }
    ];

    return (
        <div className="fixed top-0 left-0 h-screen w-20 lg:w-64 bg-[#1a1a1a] text-white flex flex-col">
            {/* Logo */}
            <div className="p-4 border-b border-gray-800">
                <h1 className="text-xl font-bold hidden lg:block">ChatterBox</h1>
                <h1 className="text-xl font-bold lg:hidden">CB</h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    {navItems.map((item) => (
                        <li key={item.path}>
                            <Link
                                to={item.path}
                                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                                    isActive(item.path)
                                        ? 'bg-blue-600 text-white'
                                        : 'hover:bg-gray-800'
                                }`}
                            >
                                {item.icon}
                                <span className="hidden lg:block">{item.name}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t border-gray-800">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700">
                        <img
                            src={user?.avatar || '/default-avatar.png'}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="hidden lg:block">
                        <p className="text-sm font-medium text-white">{user?.displayName || user?.username}</p>
                        <button
                            onClick={logout}
                            className="text-xs text-gray-400 hover:text-white transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar; 