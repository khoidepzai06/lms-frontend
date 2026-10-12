import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Công cụ chuyển trang

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // Khởi tạo công cụ

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/api/auth/login', {
        email,
        password
      });
      
      setMessage('Đăng nhập thành công! Đang chuyển trang...');
      localStorage.setItem('token', response.data.token);
      
      // Đợi 1 giây rồi đá thẳng sang trang danh sách khóa học
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
      
    } catch (error: any) {
      setMessage('Lỗi: ' + (error.response?.data?.message || 'Sai thông tin đăng nhập'));
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '30px', border: '1px solid #ddd', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', fontFamily: 'sans-serif' }}>
      <h2 style={{ textAlign: 'center', color: '#333' }}>Đăng nhập LMS</h2>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
        <input
          type="email"
          placeholder="Nhập Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: '12px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <input
          type="password"
          placeholder="Nhập Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: '12px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ padding: '12px', fontSize: '16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
          Đăng Nhập
        </button>
      </form>
      {message && (
        <p style={{ marginTop: '20px', color: message.includes('thành công') ? 'green' : 'red', textAlign: 'center', fontWeight: 'bold' }}>
          {message}
        </p>
      )}
    </div>
  );
}