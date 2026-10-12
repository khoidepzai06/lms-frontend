import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios'; // Đã mở khóa công cụ gọi API

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // --- STATE ---
  const [showModal, setShowModal] = useState(false);
  const [submissionLink, setSubmissionLink] = useState('');
  const [submitMessage, setSubmitMessage] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'Giảng viên', text: 'Chào các em, tài liệu đồ án đã có. Ai có thắc mắc gì cứ hỏi tại đây nhé!', isTeacher: true }
  ]);

  // --- HÀM 1: GỌI API NỘP BÀI THẬT ---
  const handleSubmit = async () => {
    if (!submissionLink) {
      setSubmitMessage('Vui lòng nhập link bài làm!');
      return;
    }
    
    try {
      const token = localStorage.getItem('token'); // Lấy vé thông hành
      
      // Gọi API xuống Backend (Sếp nhớ check lại xem đường dẫn API bên Backend đã khớp chưa nhé, ví dụ: /api/submissions)
      await axios.post('http://localhost:3001/api/submissions', {
        courseId: Number(id), // Báo cho Backend biết nộp cho khóa học nào
        link: submissionLink
      }, {
        headers: { 'Authorization': `Bearer ${token}` } // Kẹp token vào để Backend xác thực
      });
      
      setSubmitMessage('🎉 Nộp bài thành công!');
      setTimeout(() => {
        setShowModal(false);
        setSubmitMessage('');
        setSubmissionLink('');
      }, 1500);
      
    } catch (error: any) {
      setSubmitMessage('Lỗi: ' + (error.response?.data?.message || 'Lỗi server, chưa nộp được'));
    }
  };

  // --- HÀM 2: GỌI API GỬI TIN NHẮN THẬT ---
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      
      // Gọi API chat xuống Backend (Ví dụ: /api/comments hoặc tên gì đó sếp đặt bên Backend)
      // Giả sử sếp tạm thời chưa có API này thì nó sẽ báo lỗi 404, nhưng giao diện vẫn sẽ hiển thị tin nhắn tạm cho sếp coi
      try {
          await axios.post(`http://localhost:3001/api/courses/${id}/comments`, {
            text: chatInput
          }, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
      } catch (apiError) {
          console.log("Cảnh báo: Có thể Backend chưa tạo Route cho API Comment/Chat", apiError);
      }

      // Cập nhật giao diện ngay lập tức cho mượt
      setMessages([...messages, { sender: 'Học viên', text: chatInput, isTeacher: false }]);
      setChatInput('');
      
    } catch (error: any) {
      alert('Lỗi gửi tin nhắn: ' + error.message);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif', border: '1px solid #ddd', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
      <button onClick={() => navigate('/dashboard')} style={{ padding: '8px 12px', marginBottom: '20px', cursor: 'pointer', border: 'none', borderRadius: '5px', backgroundColor: '#6c757d', color: 'white' }}>
        🔙 Quay lại Dashboard
      </button>
      
      <h2 style={{ color: '#007bff' }}>Chi tiết khóa học (Mã môn: {id})</h2>
      
      {/* 1. KHU VỰC NHIỆM VỤ & NỘP BÀI */}
      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', borderLeft: '5px solid #28a745' }}>
        <h3 style={{ marginTop: 0 }}>📌 Nhiệm vụ / Bài tập</h3>
        <p>Sinh viên xem tài liệu và nộp link bài làm (Github, Google Drive) tại đây.</p>
        <button onClick={() => setShowModal(true)} style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
          + Nộp bài tập
        </button>
      </div>

      {/* 2. KHU VỰC GIAO TIẾP (COMMUNICATION) */}
      <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h3 style={{ marginTop: 0, color: '#ff9800' }}>💬 Thảo luận / Hỏi đáp (Communication)</h3>
        
        <div style={{ height: '200px', overflowY: 'auto', backgroundColor: '#f1f1f1', padding: '15px', borderRadius: '5px', marginBottom: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {messages.map((msg, index) => (
            <div key={index} style={{ alignSelf: msg.isTeacher ? 'flex-start' : 'flex-end', backgroundColor: msg.isTeacher ? '#fff' : '#d1e7dd', padding: '10px 15px', borderRadius: '15px', maxWidth: '70%', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <strong style={{ color: msg.isTeacher ? '#dc3545' : '#0f5132', fontSize: '13px' }}>{msg.sender}</strong>
              <div style={{ marginTop: '5px' }}>{msg.text}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            placeholder="Nhập câu hỏi hoặc bình luận..." 
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
          <button onClick={handleSendMessage} style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            Gửi
          </button>
        </div>
      </div>

      {/* 3. MODAL NỘP BÀI */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '10px', width: '400px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
            <h3 style={{ marginTop: 0, color: '#333' }}>🚀 Nộp bài tập</h3>
            <p style={{ fontSize: '14px', color: '#666' }}>Vui lòng dán đường dẫn (link) bài làm của bạn vào bên dưới.</p>
            
            <input 
              type="text" 
              placeholder="VD: https://github.com/..." 
              value={submissionLink}
              onChange={(e) => setSubmissionLink(e.target.value)}
              style={{ width: '100%', padding: '12px', boxSizing: 'border-box', marginBottom: '20px', borderRadius: '5px', border: '1px solid #ccc' }}
            />
            
            {submitMessage && (
              <p style={{ color: submitMessage.includes('thành công') ? 'green' : 'red', fontWeight: 'bold', textAlign: 'center', marginTop: '-10px', marginBottom: '15px' }}>
                {submitMessage}
              </p>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowModal(false); setSubmitMessage(''); }} style={{ padding: '8px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                Hủy
              </button>
              <button onClick={handleSubmit} style={{ padding: '8px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                Xác nhận nộp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}