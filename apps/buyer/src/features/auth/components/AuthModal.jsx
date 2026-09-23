import { useState, useEffect, useCallback } from 'react';
import { Modal, Input, Button } from '@taca/ui-components';
import { authApi } from '../services/auth.api';
import { useAuth } from '../hooks/useAuth';

const AuthModal = () => {
  const { isAuthModalOpen, closeAuthModal, login } = useAuth();
  
  // 'signin' or 'signup'
  const [mode, setMode] = useState('signin');
  
  // Form state
  const [identifier, setIdentifier] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isWaitingVerification, setIsWaitingVerification] = useState(false);

  const isSignIn = mode === 'signin';
  const isForgot = mode === 'forgot';

  const validatePassword = (pwd) => {
    return pwd.length >= 12 && pwd.length <= 72;
  };

  const validateIdentifier = (id) => {
    const trimmedId = id.trim();
    if (trimmedId.includes('@')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedId)) return 'Email không hợp lệ.';
      return null;
    }
    // Nới lỏng regex để cho phép test các số như 0123456789
    const phoneRegex = /^(0|84|\+84)[35789][0-9]{8}$/;
    if (!phoneRegex.test(trimmedId)) return 'Số điện thoại không hợp lệ (VD: 0912345678).';
    return null;
  };

  const validateEmailOnly = (email) => {
    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) return 'Email không hợp lệ.';
    return null;
  };

  const validatePhoneOnly = (phone) => {
    const trimmedPhone = phone.trim();
    if (!trimmedPhone) return null; // Optional
    const phoneRegex = /^(0|84|\+84)[35789][0-9]{8}$/;
    if (!phoneRegex.test(trimmedPhone)) return 'Số điện thoại không hợp lệ (VD: 0912345678).';
    return null;
  };

  const validateName = (val) => {
    const trimmed = val.trim();
    if (trimmed.length < 1 || trimmed.length > 120) return 'Họ tên phải từ 1 đến 120 ký tự.';
    return null;
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    if (!identifier || !password) {
      setError('Vui lòng nhập Email/Số điện thoại và mật khẩu.');
      return;
    }

    const idError = validateIdentifier(identifier);
    if (idError) {
      setError(idError);
      return;
    }

    if (!validatePassword(password)) {
      setError('Mật khẩu không hợp lệ (cần 12-72 ký tự).');
      return;
    }

    setLoading(true);
    try {
      let finalIdentifier = identifier.trim();
      if (!finalIdentifier.includes('@') && finalIdentifier.startsWith('0')) {
        finalIdentifier = '+84' + finalIdentifier.slice(1);
      }

      const response = await authApi.login({ identifier: finalIdentifier, password });
      
      const userFromLogin = response.data?.user || response.user;
      const tokens = response.data?.tokens || response.tokens;
      login(userFromLogin, tokens); // Initial login to set token

      try {
        const profileRes = await authApi.getProfile();
        const fullUser = profileRes.data?.user || profileRes.data;
        if (fullUser) {
          login(fullUser, tokens); // Update with full profile
        }
      } catch (err) {
        console.error('Failed to fetch full profile after login:', err);
      }

      closeAuthModal();
    } catch (err) {
      const errorMsg = err.response?.status === 404 
        ? 'Chưa kết nối Backend (Lỗi 404)' 
        : (err.message || 'Đăng nhập thất bại.');
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    if (!name || !identifier || !password || !confirmPassword) {
      setError('Vui lòng nhập đầy đủ thông tin bắt buộc.');
      return;
    }

    const nameError = validateName(name);
    if (nameError) {
      setError(nameError);
      return;
    }

    const emailError = validateEmailOnly(identifier);
    if (emailError) {
      setError(emailError);
      return;
    }

    const phoneError = validatePhoneOnly(signupPhone);
    if (phoneError) {
      setError(phoneError);
      return;
    }

    if (!validatePassword(password)) {
      setError('Mật khẩu cần từ 12-72 ký tự.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp.');
      return;
    }

    setLoading(true);
    try {
      const email = identifier.trim();
      let finalPhone = null;
      
      if (signupPhone.trim()) {
        const trimmedPhone = signupPhone.trim();
        finalPhone = trimmedPhone.startsWith('0') ? '+84' + trimmedPhone.slice(1) : trimmedPhone;
      }

      const payload = {
        full_name: name.trim(),
        password: password,
        email: email,
        ...(finalPhone && { phone: finalPhone })
      };
      
      const response = await authApi.register(payload);
      const userFromSignup = response.data?.user || response.user;
      const tokens = response.data?.tokens || response.tokens;
      login(userFromSignup, tokens); // Initial login to set token
      
      try {
        const profileRes = await authApi.getProfile();
        const fullUser = profileRes.data?.user || profileRes.data;
        if (fullUser) {
          login(fullUser, tokens); // Update with full profile
        }
      } catch (err) {
        console.error('Failed to fetch full profile after signup:', err);
      }
      
      setIsWaitingVerification(true);
    } catch (err) {
      const errorMsg = err.response?.status === 404 
        ? 'Chưa kết nối Backend (Lỗi 404)' 
        : (err.message || 'Đăng ký thất bại.');
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    if (!identifier) {
      setError('Vui lòng nhập Email hoặc Số điện thoại.');
      return;
    }

    const idError = validateIdentifier(identifier);
    if (idError) {
      setError(idError);
      return;
    }

    setLoading(true);
    try {
      let finalIdentifier = identifier.trim();
      if (!finalIdentifier.includes('@') && finalIdentifier.startsWith('0')) {
        finalIdentifier = '+84' + finalIdentifier.slice(1);
      }

      await authApi.forgotPassword(finalIdentifier);
      setSuccessMessage('Yêu cầu thành công! Vui lòng kiểm tra email hoặc tin nhắn SMS để đặt lại mật khẩu.');
    } catch (err) {
      const errorMsg = err.response?.status === 404 
        ? 'Chưa kết nối Backend (Lỗi 404)' 
        : (err.message || 'Yêu cầu thất bại.');
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const resetState = useCallback(() => {
    setMode('signin');
    setIdentifier('');
    setSignupPhone('');
    setPassword('');
    setName('');
    setConfirmPassword('');
    setError('');
    setSuccessMessage('');
    setIsWaitingVerification(false);
  }, []);

  // Close handler to reset state too
  const handleClose = useCallback(() => {
    resetState();
    closeAuthModal();
  }, [resetState, closeAuthModal]);

  useEffect(() => {
    let intervalId;
    if (isWaitingVerification) {
      intervalId = setInterval(async () => {
        try {
          const profileRes = await authApi.getProfile();
          const user = profileRes.data?.user || profileRes.data;
          if (user && user.email_verified) {
            login(user, null);
            setIsWaitingVerification(false);
            setSuccessMessage('Xác thực email thành công! Đang chuyển hướng...');
            setTimeout(() => {
              handleClose();
            }, 2000);
          }
        } catch (err) {
          console.error('Lỗi kiểm tra xác thực email:', err);
        }
      }, 3000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isWaitingVerification, login, handleClose]);

  return (
    <Modal 
      isOpen={isAuthModalOpen} 
      onClose={handleClose} 
      width="max-w-[500px]"
      hideHeader={true}
    >
      <div className="flex flex-col">
        {isWaitingVerification ? (
          <div className="text-center py-6">
            <div className="mx-auto flex items-center justify-center mb-6">
              <svg className="animate-spin h-10 w-10 text-taca-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h2 className="text-[24px] font-bold text-taca-text-main mb-4">Đang chờ xác thực...</h2>
            <p className="text-[15px] text-taca-text-muted mb-8">
              Đăng ký thành công! Vui lòng kiểm tra email của bạn để xác thực tài khoản. <br/>
              Hệ thống sẽ tự động chuyển hướng sau khi bạn xác nhận email.
            </p>
            <Button variant="outline" onClick={handleClose} className="w-full">
              Đóng và xác thực sau
            </Button>
          </div>
        ) : successMessage ? (
          <div className="text-center py-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-[24px] font-bold text-taca-text-main mb-4">Thành công!</h2>
            <p className="text-[15px] text-taca-text-muted mb-8">{successMessage}</p>
            <Button onClick={handleClose} className="w-full">
              Bắt đầu mua sắm
            </Button>
          </div>
        ) : (
          <>
            {/* Title & Subtitle */}
        <div className="mb-6">
          <h2 className="text-[24px] font-bold text-taca-text-main">
            {isForgot ? 'QUÊN MẬT KHẨU' : (isSignIn ? 'ĐĂNG NHẬP TACA' : 'ĐĂNG KÝ TACA')}
          </h2>
          <p className="text-[14px] text-taca-text-muted mt-2">
            {isForgot 
              ? 'Nhập email hoặc số điện thoại để đặt lại mật khẩu.' 
              : (isSignIn 
                ? 'Theo dõi đơn hàng, lưu voucher và mua sắm nhanh hơn.' 
                : 'Tạo tài khoản để mua sắm và nhận nhiều ưu đãi.')}
          </p>
        </div>
        
        {error && (
          <div className="bg-taca-sale/10 text-taca-sale p-3 text-[14px] rounded-lg font-medium border border-taca-sale/20 mb-4">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={isForgot ? handleForgot : (isSignIn ? handleSignIn : handleSignUp)} className="flex flex-col gap-4">
          
          {!isForgot && !isSignIn && (
            <Input 
              label="Họ và tên"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}

          <Input 
            label={isSignIn || isForgot ? "Email hoặc số điện thoại" : "Email"}
            type={isSignIn || isForgot ? "text" : "email"}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />

          {!isForgot && !isSignIn && (
            <Input 
              label="Số điện thoại (Tuỳ chọn)"
              type="tel"
              value={signupPhone}
              onChange={(e) => setSignupPhone(e.target.value)}
            />
          )}
          
          {!isForgot && (
            <Input 
              label="Mật khẩu"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          )}

          {!isForgot && !isSignIn && (
            <Input 
              label="Nhập lại mật khẩu"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          )}

          <Button 
            type="submit" 
            className="w-full mt-4"
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : (isForgot ? 'Gửi yêu cầu' : (isSignIn ? 'Đăng nhập' : 'Đăng ký'))}
          </Button>

          {isSignIn && (
            <div className="text-center mt-2">
              <button type="button" onClick={() => setMode('forgot')} className="text-[14px] font-bold text-taca-primary hover:text-taca-primary-hover focus:outline-none">
                Quên mật khẩu?
              </button>
            </div>
          )}
        </form>

        {!isForgot && (
          <div className="relative flex items-center py-6">
            <div className="flex-grow border-t border-taca-border"></div>
            <span className="flex-shrink-0 mx-4 text-taca-text-muted text-[13px]">Hoặc tiếp tục với</span>
            <div className="flex-grow border-t border-taca-border"></div>
          </div>
        )}

        {/* Placeholder cho Login with Google sau này */}
        {!isForgot && (
          <button 
            type="button"
            className="flex items-center justify-center w-full bg-white border border-taca-border rounded-lg py-2 hover:bg-gray-50 transition-colors"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5 mr-2" />
            <span className="text-[14px] font-bold text-taca-text-main">Google</span>
          </button>
        )}

        {!isForgot && <div className="w-full h-[1px] bg-taca-border mt-6 mb-4"></div>}

        <div className="text-center text-[14px] text-taca-text-main">
          {isForgot ? (
            <button type="button" onClick={() => setMode('signin')} className="font-bold cursor-pointer hover:text-taca-primary focus:outline-none flex items-center justify-center mx-auto gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              Quay lại đăng nhập
            </button>
          ) : (
            isSignIn ? (
              <>
                Chưa có tài khoản?{' '}
                <button type="button" onClick={() => setMode('signup')} className="font-bold cursor-pointer hover:text-taca-primary focus:outline-none">
                  Đăng ký ngay
                </button>
              </>
            ) : (
              <>
                Đã có tài khoản?{' '}
                <button type="button" onClick={() => setMode('signin')} className="font-bold cursor-pointer hover:text-taca-primary focus:outline-none">
                  Đăng nhập
                </button>
              </>
            )
          )}
        </div>
        </>
        )}
      </div>
    </Modal>
  );
};

export default AuthModal;
