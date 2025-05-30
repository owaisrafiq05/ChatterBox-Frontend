import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Signup from './components/Signup';
import ProfileSettings from './components/ProfileSettings';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Room from './components/Room';

const App = () => {
    return (
        <Router>
            <AuthProvider>
                <Toaster position="top-right" />
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    {/* <Route path="/dashboard" element={<Dashboard />} /> */}

                    {/* Protected Routes */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <div className="flex">
                                    <Sidebar />
                                    <main className="flex-1 ml-20 lg:ml-64">
                                        <Dashboard />
                                    </main>
                                </div>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <div className="flex">
                                    <Sidebar />
                                    <main className="flex-1 ml-20 lg:ml-64">
                                        <ProfileSettings />
                                    </main>
                                </div>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/room/:id"
                        element={
                            <ProtectedRoute>
                                <Room />
                            </ProtectedRoute>
                        }
                    />
                    {/* Redirect root to dashboard if authenticated, otherwise to login */}
                    <Route
                        path="/"
                        element={<Navigate to="/dashboard" replace />}
                    />
                </Routes>
            </AuthProvider>
        </Router>
    );
};

export default App;