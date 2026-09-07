import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@taca/ui-components';
import { authApi } from '../services/auth.api';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('Đang xác thực email của bạn...');
  const verifyAttempted = useRef(false);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Đường dẫn không hợp lệ hoặc không có mã xác thực.');
        return;
      }
      
      if (verifyAttempted.current) return;
      verifyAttempted.current = true;

      try {
        await authApi.verifyEmail(token);
        setStatus('success');
        setMessage('Xác thực email thành công! Bạn có thể tiếp tục sử dụng dịch vụ.');
      } catch (err) {
        setStatus('error');
        setMessage(err.message || 'Mã xác thực không hợp lệ hoặc đã hết hạn.');
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="flex items-center justify-center min-h-[500px] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-taca-border text-center">
        {status === 'verifying' && (
          <div>
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-taca-border border-t-taca-primary mb-4"></div>
            <h2 className="text-[20px] font-bold text-taca-text-main mb-2">Đang xác thực</h2>
            <p className="text-[14px] text-taca-text-muted">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-[20px] font-bold text-gray-900 mb-2">Xác thực thành công!</h2>
            <p className="text-[14px] text-taca-text-muted mb-6">{message}</p>
            <Link to="/">
              <Button className="w-full">Về trang chủ</Button>
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-taca-sale" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-[20px] font-bold text-gray-900 mb-2">Xác thực thất bại</h2>
            <p className="text-[14px] text-taca-text-muted mb-6">{message}</p>
            <Link to="/">
              <Button className="w-full">Về trang chủ</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
