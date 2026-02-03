import { Route, Routes } from 'react-router-dom';
import './App.css';

import Introduction from './Introduction';
import Login from './Login';
import PerformanceServices from './PerformanceServices';
import MediaUploadPage from './MediaUploadPage';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Introduction />} />
        <Route path="/introduction" element={<Introduction />} />
        <Route path="/login" element={<Login />} />
        <Route path="/performance-services" element={<PerformanceServices />} />
        <Route path="/blog" element={<MediaUploadPage />} />
      </Routes>
    </div>
  );
}

export default App;
