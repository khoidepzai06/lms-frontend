import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false); // Trạng thái kiểm tra quyền Admin
  
  // State cho Form Thêm khóa học mới (Create)
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const navigate = useNavigate();

  // Hàm tải danh sách khóa học
  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      const userRole = localStorage.getItem('role') || 'ADMIN'; // Mặc định để test
      if (userRole === 'ADMIN') {
        setIsAdmin(true);
      }

      const response = await axios.get('https://lms-backendd-x2ap.onrender.com/api/courses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setCourses(response.data);
    } catch (err: any) {
      setError('Lỗi tải dữ liệu: ' + (err.response?.data?.message || err.message));
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [navigate]);

  // --- HÀM 1: TẠO MỚI KHÓA HỌC (CREATE) ---
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId') || '1'; // Lấy userId đã lưu hoặc mặc định là '1'

      await axios.post('https://lms-backendd-x2ap.onrender.com/api/courses', {
        title: newTitle,
        description: newDesc
      }, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'user-id': userId // Kẹp thêm trường này để vượt qua middleware của Backend
        }
      });

      // Tắt modal, reset form và tải lại danh sách
      setShowAddModal(false);
      setNewTitle('');
      setNewDesc('');
      fetchCourses();
    } catch (err: any) {
      alert('Lỗi tạo khóa học: ' + (err.response?.data?.message || err.message));
    }
  };

  // --- HÀM 2: XÓA KHÓA HỌC (DELETE) ---
  const handleDeleteCourse = async (courseId: number) => {
    if (!window.confirm('Sếp có chắc chắn muốn xóa khóa học này không?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId') || '1'; // Lấy userId

      await axios.delete(`https://lms-backendd-x2ap.onrender.com/api/courses/${courseId}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'user-id': userId // Kẹp thêm trường này luôn
        }
      });

      // Tải lại danh sách sau khi xóa
      fetchCourses();
    } catch (err: any) {
      alert('Lỗi xóa khóa học: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    navigate('/');
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      {/* THANH HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
        <h2>Hệ thống quản lý Khóa học (LMS)</h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* PHÂN QUYỀN: Chỉ ADMIN mới thấy nút Thêm khóa học */}
          {isAdmin && (
            <button onClick={() => setShowAddModal(true)} style={{ padding: '8px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
              + Thêm khóa học mới
            </button>
          )}
          <button onClick={handleLogout} style={{ padding: '8px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            Đăng xuất
          </button>
        </div>
      </div>
      
      {error && <p style={{ color: 'red', marginTop: '20px' }}>{error}</p>}

      {/* DANH SÁCH KHÓA HỌC (READ & DELETE) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '30px' }}>
        {courses.length > 0 ? (
          courses.map((course: any, index: number) => (
            <div key={index} style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', position: 'relative' }}>
              
              {/* Nút Xóa dành riêng cho Admin */}
              {isAdmin && (
                <button 
                  onClick={() => handleDeleteCourse(course.id)} 
                  style={{ position: 'absolute', top: '15px', right: '15px', backgroundColor: '#ff4d4f', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                >
                  Xóa
                </button>
              )}

              <h3 style={{ marginTop: 0, color: '#007bff', paddingRight: '40px' }}>{course.title || course.name}</h3>
              <p style={{ color: '#555' }}>{course.description || 'Chưa có mô tả...'}</p>
              
              <button 
                onClick={() => navigate(`/course/${course.id}`)}
                style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', width: '100%', marginTop: '10px', fontWeight: 'bold' }}
              >
                Vào chi tiết khóa học
              </button>
            </div>
          ))
        ) : (
          <p style={{ fontStyle: 'italic', color: 'gray' }}>Chưa có khóa học nào hoặc đang tải dữ liệu...</p>
        )}
      </div>

      {/* MODAL TẠO KHÓA HỌC MỚI (CREATE FORM) */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '10px', width: '450px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
            <h3 style={{ marginTop: 0, color: '#333' }}>📚 Thêm khóa học mới</h3>
            
            <form onSubmit={handleCreateCourse} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Tên khóa học:</label>
                <input 
                  type="text" 
                  placeholder="Nhập tên khóa học..." 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '5px', border: '1px solid #ccc' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Mô tả khóa học:</label>
                <textarea 
                  placeholder="Nhập mô tả chi tiết..." 
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={3}
                  style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '5px', border: '1px solid #ccc', fontFamily: 'sans-serif' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '8px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                  Hủy
                </button>
                <button type="submit" style={{ padding: '8px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Tạo mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}