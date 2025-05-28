# ChatterBox - Real-Time Audio Chat Rooms

ChatterBox is a modern, real-time audio chat application built with React, offering a seamless and interactive communication experience similar to Discord or Clubhouse.

![ChatterBox Preview](public/preview.png)

## 🌟 Features

### 🎙️ Audio Chat Rooms
- **Live Audio Streaming**: Real-time audio communication in rooms
- **Room Status**: Rooms can be live or inactive, controlled by room creators
- **Room Privacy**: Create public or private rooms with access code protection
- **Room Management**: 
  - Create and customize chat rooms
  - Set room descriptions and access settings
  - Live participant list with join/leave notifications
  - Room creator controls for managing the session

### 💬 Text Chat
- **Real-time Messaging**: Instant message delivery in rooms
- **Message History**: Access to previous messages in the room
- **User Presence**: See who's currently in the room
- **Activity Feed**: Real-time notifications for user joins/leaves

### 👤 User Features
- **User Profiles**: 
  - Customizable display names
  - Profile picture upload
  - Personal bio
- **Authentication**: 
  - Secure email/password registration and login
  - JWT-based authentication
  - Protected routes and API access

### 🎨 UI/UX Features
- **Modern Design**: Clean and intuitive interface with dark mode
- **Responsive Layout**: Works seamlessly on desktop and mobile devices
- **Real-time Updates**: Instant UI updates for all room activities
- **Toast Notifications**: Elegant notifications for all system messages
- **Loading States**: Smooth loading states and transitions

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Modern web browser

### Installation

1. Clone the repository:
```bash
git clone https://github.com/owaisrafiq05/ChatterBox-Frontend.git
cd ChatterBox-Frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:5000
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

## 🛠️ Built With

- **Frontend Framework**: React with Vite
- **State Management**: Redux Toolkit
- **Styling**: TailwindCSS
- **Real-time Communication**: Socket.IO
- **Audio Streaming**: WebRTC
- **UI Components**: Custom components with modern design
- **Form Handling**: React Hook Form
- **Notifications**: Sonner Toast
- **HTTP Client**: Axios

## 📱 Browser Support

ChatterBox works on all modern browsers:
- Chrome (recommended)
- Firefox
- Safari
- Edge

## 🔒 Security Features

- JWT-based authentication
- Protected API routes
- Secure WebSocket connections
- File upload validation
- Rate limiting protection
- XSS protection
- CORS configuration

## 🎯 Key Components

### Room Management
- Dashboard for room listing and creation
- Room cards with live status indicators
- Join/Create room modalities
- Room settings for creators

### Audio Controls
- Mute/Unmute functionality
- Audio device selection
- Volume controls
- Connection status indicators

### User Interface
- Sidebar navigation
- Room participant list
- Activity feed
- Chat interface
- Profile settings
- Room creation modal

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Socket.IO for real-time communication
- WebRTC for audio streaming
- TailwindCSS for styling
- React community for amazing tools and libraries
