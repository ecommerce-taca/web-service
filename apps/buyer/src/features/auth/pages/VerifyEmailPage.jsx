import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '@taca/ui-components';
import { authApi } from '../services/auth.api';
import { useAuth } from '../hooks/useAuth';
import { getAuthErrorMessage } from '../utils/authError';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('t') || searchParams.get('token');
  const { user, openAuthModal } = useAuth();
  
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('Đang xác thực email của bạn...');
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const verifyAttempted = useRef(false);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Đường dẫn không hợp lệ hoặc thiếu mã xác thực email.');
        return;
      }
      
      if (verifyAttempted.current) return;
      verifyAttempted.current = true;

      try {
        const res = await authApi.verifyEmail(token);
        const email = res.data?.user?.email || '';
        if (email) {
          setVerifiedEmail(email);
        }

        // Broadcast sự kiện kích hoạt thành công sang các tab/modal khác kèm email
        window.dispatchEvent(new CustomEvent('auth:email_verified', { detail: { email } }));
        localStorage.setItem('taca_auth_verified_event', JSON.stringify({ email, time: Date.now() }));

        setStatus('success');
        setMessage('Xác thực email thành công! Tài khoản của bạn đã được kích hoạt. Vui lòng bấm Đăng nhập bên dưới.');
      } catch (err) {
        setStatus('error');
        setMessage(getAuthErrorMessage(err, 'verify'));
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
            
            {(verifiedEmail || user?.email) && (
              <div className="mb-6 flex flex-col items-center justify-center gap-2">
                <div className="text-[16px] font-medium text-taca-text-main">
                  {verifiedEmail || user?.email}
                </div>
                <div className="inline-flex items-center gap-1 text-[13px] text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Đã xác thực
                </div>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => openAuthModal()} className="w-full sm:w-auto">
                Đăng nhập ngay
              </Button>
              <Link to="/">
                <Button variant="outline" className="w-full sm:w-auto">
                  Về trang chủ
                </Button>
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-taca-sale" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-[20px] font-bold text-gray-900 mb-2">Xác thực không thành công</h2>
            <p className="text-[14px] text-taca-text-muted mb-6">{message}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => openAuthModal()} className="w-full sm:w-auto">
                Đăng nhập
              </Button>
              <Link to="/">
                <Button variant="outline" className="w-full sm:w-auto">Về trang chủ</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
