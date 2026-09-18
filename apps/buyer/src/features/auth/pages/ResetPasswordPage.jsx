import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button, Input } from '@taca/ui-components';
import { authApi } from '../services/auth.api';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle', 'submitting', 'success', 'error'
  const [message, setMessage] = useState('');

  const validatePassword = (pwd) => {
    return pwd.length >= 12 && pwd.length <= 72;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    
    if (!token) {
      setStatus('error');
      setMessage('Đường dẫn không hợp lệ hoặc thiếu mã xác thực (token).');
      return;
    }

    if (!validatePassword(password)) {
      setStatus('error');
      setMessage('Mật khẩu không hợp lệ (cần từ 12-72 ký tự).');
      return;
    }

    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('Mật khẩu nhập lại không khớp.');
      return;
    }

    setStatus('submitting');
    try {
      await authApi.resetPassword(token, password);
      setStatus('success');
      setMessage('Đặt lại mật khẩu thành công! Bạn có thể quay về trang chủ và đăng nhập bằng mật khẩu mới.');
    } catch (err) {
      setStatus('error');
      const errorMsg = err.response?.status === 404 
        ? 'Chưa kết nối Backend (Lỗi 404)' 
        : (err.message || 'Đặt lại mật khẩu thất bại, mã xác thực có thể đã hết hạn.');
      setMessage(errorMsg);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[500px] py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-taca-border text-center">
        {status === 'success' ? (
          <div>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-[20px] font-bold text-gray-900 mb-2">Thành công!</h2>
            <p className="text-[14px] text-taca-text-muted mb-6">{message}</p>
            <Link to="/">
              <Button className="w-full">Về trang chủ</Button>
            </Link>
          </div>
        ) : (
          <div>
            <h2 className="text-[24px] font-bold text-taca-text-main mb-2">ĐẶT LẠI MẬT KHẨU</h2>
            <p className="text-[14px] text-taca-text-muted mb-6">Vui lòng nhập mật khẩu mới của bạn bên dưới.</p>
            
            {status === 'error' && (
              <div className="bg-taca-sale/10 text-taca-sale p-3 text-[14px] rounded-lg font-medium border border-taca-sale/20 mb-4 text-left">
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
              <Input 
                label="Mật khẩu mới"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={status === 'submitting'}
              />
              <Input 
                label="Nhập lại mật khẩu mới"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={status === 'submitting'}
              />
              <Button 
                type="submit" 
                className="w-full mt-4"
                disabled={status === 'submitting'}
              >
                {status === 'submitting' ? 'Đang xử lý...' : 'Xác nhận đổi mật khẩu'}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
