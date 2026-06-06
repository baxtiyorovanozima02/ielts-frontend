import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
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
import ReadingTestPage from './pages/ReadingTestPage';
import ListeningTestPage from './pages/ListeningTestPage';
import WritingTestPage from './pages/WritingTestPage';
import SpeakingTestPage from './pages/SpeakingTestPage';
import TestResultPage from './pages/TestResultPage';

function PrivateRoute({ children }) {
    const token = localStorage.getItem('access_token');
    return token ? children : <Navigate to="/login" />;
}

function App() {
    return (
        <ErrorBoundary>
            <Router>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/dashboard" element={<PrivateRoute><ErrorBoundary><DashboardPage /></ErrorBoundary></PrivateRoute>} />
                    <Route path="/vocabulary" element={<PrivateRoute><ErrorBoundary><VocabularyPage /></ErrorBoundary></PrivateRoute>} />
                    <Route path="/statistics" element={<PrivateRoute><ErrorBoundary><StatisticsPage /></ErrorBoundary></PrivateRoute>} />
                    <Route path="/profile" element={<PrivateRoute><ErrorBoundary><ProfilePage /></ErrorBoundary></PrivateRoute>} />
                    <Route path="/settings" element={<PrivateRoute><ErrorBoundary><SettingsPage /></ErrorBoundary></PrivateRoute>} />
                    <Route path="/tests" element={<PrivateRoute><ErrorBoundary><TestsPage /></ErrorBoundary></PrivateRoute>} />
                    <Route path="/tests/reading/:id" element={<PrivateRoute><ErrorBoundary><ReadingTestPage /></ErrorBoundary></PrivateRoute>} />
                    <Route path="/tests/listening/:id" element={<PrivateRoute><ErrorBoundary><ListeningTestPage /></ErrorBoundary></PrivateRoute>} />
                    <Route path="/tests/writing/:id" element={<PrivateRoute><ErrorBoundary><WritingTestPage /></ErrorBoundary></PrivateRoute>} />
                    <Route path="/tests/speaking/:id" element={<PrivateRoute><ErrorBoundary><SpeakingTestPage /></ErrorBoundary></PrivateRoute>} />
                    <Route path="/tests/result" element={<PrivateRoute><ErrorBoundary><TestResultPage /></ErrorBoundary></PrivateRoute>} />
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/pricing" element={<PricingPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </Router>
        </ErrorBoundary>
    );
}

export default App;