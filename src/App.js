import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Categories from './pages/Categories';
import VideoReferences from './pages/VideoReferences';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Sidebar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/video-references" replace />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/video-references" element={<VideoReferences />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
