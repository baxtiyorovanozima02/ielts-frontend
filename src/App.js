import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import VocabularyPage from './pages/VocabularyPage';
import StatisticsPage from './pages/StatisticsPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import LandingPage from './pages/LandingPage';
import PricingPage from './pages/PricingPage';
import NotFoundPage from './pages/NotFoundPage';
import TestsPage from './pages/TestsPage';
import WritingTestPage from './pages/WritingTestPage';
import SpeakingTestPage from './pages/SpeakingTestPage';
import TestResultPage from './pages/TestResultPage';

function PrivateRoute({ children }) {
    const token = localStorage.getItem('access_token');
    return token ? children : <Navigate to="/login" />;
}

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
                <Route path="/vocabulary" element={<PrivateRoute><VocabularyPage /></PrivateRoute>} />
                <Route path="/statistics" element={<PrivateRoute><StatisticsPage /></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
                <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
                <Route path="/tests" element={<PrivateRoute><TestsPage /></PrivateRoute>} />
                <Route path="/tests/writing/:id" element={<PrivateRoute><WritingTestPage /></PrivateRoute>} />
                <Route path="/tests/speaking/:id" element={<PrivateRoute><SpeakingTestPage /></PrivateRoute>} />
                <Route path="/tests/result" element={<PrivateRoute><TestResultPage /></PrivateRoute>} />
                <Route path="/" element={<LandingPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </Router>
    );
}

export default App;