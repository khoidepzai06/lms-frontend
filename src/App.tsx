import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard'; 
import CourseDetail from './CourseDetail'; // Thêm dòng này

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/course/:id" element={<CourseDetail />} /> {/* Thêm dòng này */}
      </Routes>
    </Router>
  );
}

export default App;