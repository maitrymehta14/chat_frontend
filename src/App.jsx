import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocialProvider } from './context/SocialContext';
import { ThemeProvider } from './context/ThemeContext';
import PrivateRoute from './components/routes/PrivateRoute';
import PublicRoute from './components/routes/PublicRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UsersPage from './pages/UsersPage';
import FriendsPage from './pages/FriendsPage';
import ChatPage from './pages/ChatPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocialProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes wrapper (guards screens from already authenticated users) */}
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>
            
            {/* Private routes wrapper (guards screens from unauthenticated users) */}
            <Route element={<PrivateRoute />}>
              <Route path="/users" element={<UsersPage />} />
              <Route path="/friends" element={<FriendsPage />} />
              <Route path="/chat" element={<ChatPage />} />
            </Route>
            
            {/* General Redirects */}
            <Route path="/" element={<Navigate to="/users" replace />} />
            <Route path="*" element={<Navigate to="/users" replace />} />
          </Routes>
        </BrowserRouter>
      </SocialProvider>
    </AuthProvider>
  </ThemeProvider>
  );
}

export default App;
