import { Route, Routes } from 'react-router-dom';
import './App.css';

import Introduction from './Introduction';
import Login from './Login';
import Register from './Register';
import PerformanceServices from './PerformanceServices';
import ContactPage from './ContactPage';
import SchedulePage from './SchedulePage';
import SocialFeedPage from './SocialFeedPage';
import ChatPage from './ChatPage';
import ProfilePage from './ProfilePage';
import { SupportKnowledgeProvider } from './SupportKnowledgeContext';

function App() {
  return (
    <SupportKnowledgeProvider>
      <div className="App">
        <Routes>
          <Route path="/" element={<Introduction />} />
          <Route path="/introduction" element={<Introduction />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/performance-services" element={<PerformanceServices />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/social" element={<SocialFeedPage />} />
          <Route path="/feed" element={<SocialFeedPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/messages" element={<ChatPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
      </div>
    </SupportKnowledgeProvider>
  );
}

export default App;
