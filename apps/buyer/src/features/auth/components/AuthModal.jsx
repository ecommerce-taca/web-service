import { useState, useEffect, useCallback } from 'react';
import { Loader2, } from 'lucide-react';
import { Modal, Input, Button } from '@taca/ui-components';
import { authApi } from '../services/auth.api';
import { useAuth } from '../hooks/useAuth';
import { getAuthErrorMessage } from '../utils/authError';

const GoogleIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

const AuthModal = () => {
  const { isAuthModalOpen, closeAuthModal, login } = useAuth();
  
  // 'signin' | 'signup' | 'forgot' | 'waiting_email_link'
  const [mode, setMode] = useState('signin');
  
  // Form state
  const [identifier, setIdentifier] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Email verification link state
  const [pendingEmail, setPendingEmail] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [resendInfo, setResendInfo] = useState('');

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const isSignIn = mode === 'signin';
  const isForgot = mode === 'forgot';
  const isWaitingEmailLink = mode === 'waiting_email_link';

  // Timer countdown khi ở màn hình chờ xác thực email
  useEffect(() => {
    let timer;
    if (isWaitingEmailLink && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isWaitingEmailLink, countdown]);

  const resetState = useCallback(() => {
    setMode('signin');
    setIdentifier('');
    setSignupPhone('');
    setPassword('');
    setName('');
    setConfirmPassword('');
    setPendingEmail('');
    setCountdown(60);
    setResendInfo('');
    setError('');
    setSuccessMessage('');
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    closeAuthModal();
  }, [resetState, closeAuthModal]);

  // Lắng nghe sự kiện xác thực thành công từ VerifyEmailPage (ở tab khác hoặc cùng tab)
  useEffect(() => {
    if (!isWaitingEmailLink || !pendingEmail) return;

    const handleEmailVerifiedEvent = (verifiedEmail) => {
      if (!verifiedEmail) return;
      if (verifiedEmail.toLowerCase() === pendingEmail.toLowerCase()) {
        setSuccessMessage('Xác thực email thành công! Tài khoản đã được kích hoạt. Đang chuyển về màn hình Đăng nhập...');
        setTimeout(() => {
          setMode('signin');
          setIdentifier(pendingEmail);
          setPassword('');
          setError('');
          setSuccessMessage('Xác thực email thành công! Bạn có thể đăng nhập ngay bây giờ.');
        }, 1200);
      }
    };

    const handleStorageChange = (e) => {
      if (e.key === 'taca_auth_verified_event' && e.newValue) {
        try {
          const eventData = JSON.parse(e.newValue);
          handleEmailVerifiedEvent(eventData?.email);
        } catch {
          // ignore
        }
      }
    };

    const handleCustomEvent = (e) => {
      handleEmailVerifiedEvent(e.detail?.email);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth:email_verified', handleCustomEvent);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth:email_verified', handleCustomEvent);
    };
  }, [isWaitingEmailLink, pendingEmail]);

  // Khởi tạo Google Identity Services (GIS) khi mở AuthModal
  useEffect(() => {
    if (!isAuthModalOpen || typeof window === 'undefined') return;
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (window.google?.accounts?.id && clientId) {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (credentialResponse) => {
            if (!credentialResponse?.credential) return;
            setGoogleLoading(true);
            try {
              const res = await authApi.loginWithGoogle(credentialResponse.credential);
              const payload = res?.data?.data || res?.data || res;
              login(payload.user, payload.tokens);
              handleClose();
            } catch (err) {
              const errorMsg = getAuthErrorMessage(err, 'google') || 'Đăng nhập Google không thành công. Vui lòng thử lại.';
              setError(errorMsg);
            } finally {
              setGoogleLoading(false);
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });
      } catch {
        // bỏ qua nếu SDK chưa sẵn sàng
      }
    }
  }, [isAuthModalOpen, login, handleClose]);

  const validatePassword = (pwd) => {
    return pwd.length >= 12 && pwd.length <= 72;
  };

  const validateIdentifier = (id) => {
    const trimmedId = id.trim();
    if (trimmedId.includes('@')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedId)) return 'Email không đúng định dạng.';
      return null;
    }
    const phoneRegex = /^(0|84|\+84)[35789][0-9]{8}$/;
    if (!phoneRegex.test(trimmedId)) return 'Số điện thoại không hợp lệ (VD: 0912345678).';
    return null;
  };

  const validateEmailOnly = (email) => {
    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) return 'Email không đúng định dạng.';
    return null;
  };

  const validatePhoneOnly = (phone) => {
    const trimmedPhone = phone.trim();
    if (!trimmedPhone) return null; // Không bắt buộc
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
      setError('Mật khẩu không hợp lệ (cần từ 12-72 ký tự).');
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

      // Chặn đăng nhập nếu tài khoản chưa được xác thực email
      if (userFromLogin && userFromLogin.email_verified === false) {
        setError('Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email và nhấp vào đường link xác nhận.');
        setPendingEmail(userFromLogin.email || finalIdentifier);
        return;
      }

      login(userFromLogin, tokens);

      try {
        const profileRes = await authApi.getProfile();
        const fullUser = profileRes.data?.user || profileRes.data;
        if (fullUser) {
          login(fullUser, tokens);
        }
      } catch (err) {
        console.error('Lỗi lấy thông tin profile sau khi đăng nhập:', err);
      }

      closeAuthModal();
    } catch (err) {
      const errorMsg = getAuthErrorMessage(err, 'signin');
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
      
      await authApi.register(payload);
      
      // Chuyển sang màn hình yêu cầu click link trong email để kích hoạt, CHƯA đăng nhập người dùng
      setPendingEmail(email);
      setCountdown(60);
      setResendInfo('');
      setError('');
      setPassword('');
      setConfirmPassword('');
      setMode('waiting_email_link');
    } catch (err) {
      const errorMsg = getAuthErrorMessage(err, 'signup');
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendLink = async () => {
    if (countdown > 0) return;
    setError('');
    setResendInfo('');
    setLoading(true);
    try {
      await authApi.resendEmailVerification();
      setCountdown(60);
      setResendInfo('Đã gửi lại link xác nhận đến email của bạn! Vui lòng kiểm tra hộp thư.');
      setTimeout(() => setResendInfo(''), 5000);
    } catch (err) {
      setError(getAuthErrorMessage(err, 'verify'));
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
      const errorMsg = getAuthErrorMessage(err, 'forgot');
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (typeof window !== 'undefined' && window.google?.accounts?.id && clientId) {
        window.google.accounts.id.prompt(async (notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            if (import.meta.env.VITE_USE_MOCK === 'true') {
              const res = await authApi.loginWithGoogle();
              const payload = res?.data?.data || res?.data || res;
              login(payload.user, payload.tokens);
              handleClose();
            } else {
              setError('Cửa sổ đăng nhập Google bị chặn hoặc chưa được cấp quyền (Origin: ' + window.location.origin + '). Vui lòng kiểm tra cấu hình Google Cloud.');
            }
            setGoogleLoading(false);
          }
        });
      } else {
        if (import.meta.env.VITE_USE_MOCK === 'true') {
          const res = await authApi.loginWithGoogle(`mock_google_id_token_${Date.now()}`);
          const payload = res?.data?.data || res?.data || res;
          login(payload.user, payload.tokens);
          handleClose();
        } else {
          setError('Không thể tải Google Identity Services (có thể do mạng hoặc trình duyệt chặn). Vui lòng thử lại.');
          setGoogleLoading(false);
        }
      }
    } catch (err) {
      const errorMsg = getAuthErrorMessage(err, 'google') || 'Đăng nhập Google không thành công. Vui lòng thử lại.';
      setError(errorMsg);
      setGoogleLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isAuthModalOpen} 
      onClose={handleClose} 
      width="max-w-[500px]"
      hideHeader={true}
    >
      <div className="flex flex-col">
        {/* Màn hình thành công chung */}
        {successMessage ? (
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
        ) : isWaitingEmailLink ? (
          /* Màn hình yêu cầu kiểm tra email và bấm vào LINK xác nhận */
          <div className="py-2 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-taca-primary/10 text-taca-primary mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-[22px] font-bold text-taca-text-main">
              XÁC THỰC EMAIL CỦA BẠN
            </h2>
            <p className="text-[14px] text-taca-text-muted mt-2">
              Chúng tôi đã gửi một đường dẫn (link) xác nhận đến email:
            </p>
            
            <div className="font-bold text-taca-text-main bg-gray-50 border border-taca-border px-4 py-2.5 rounded-lg my-3 text-[15px] break-all inline-block max-w-full">
              {pendingEmail}
            </div>

            <p className="text-[14px] text-taca-text-muted px-4 mb-4 leading-relaxed">
              Vui lòng kiểm tra hộp thư đến (hoặc thư rác/Spam) và <span className="font-bold text-taca-text-main">bấm vào link xác nhận</span> để kích hoạt tài khoản.
            </p>

            {resendInfo && (
              <div className="bg-green-50 text-green-700 p-2.5 text-[13px] rounded-lg font-medium border border-green-200 mb-4 text-center">
                {resendInfo}
              </div>
            )}

            {error && (
              <div className="bg-taca-sale/10 text-taca-sale p-3 text-[14px] rounded-lg font-medium border border-taca-sale/20 mb-4 text-left">
                {error}
              </div>
            )}


            <div className="mt-6 flex flex-col items-center gap-3 text-[14px]">
              <div className="text-taca-text-muted">
                Chưa nhận được email?{' '}
                {countdown > 0 ? (
                  <span className="font-medium text-taca-text-main">Gửi lại sau {countdown}s</span>
                ) : (
                  <button 
                    type="button" 
                    onClick={handleResendLink} 
                    disabled={loading}
                    className="font-bold text-taca-primary hover:text-taca-primary-hover focus:outline-none cursor-pointer"
                  >
                    Gửi lại link xác nhận
                  </button>
                )}
              </div>

              <button 
                type="button" 
                onClick={() => {
                  setMode('signup');
                  setError('');
                }} 
                className="text-[13px] text-taca-text-muted hover:text-taca-text-main underline cursor-pointer mt-1"
              >
                Đổi email hoặc thông tin đăng ký
              </button>

              <Button variant="outline" onClick={handleClose} className="w-full mt-2">
                Đóng
              </Button>
            </div>
          </div>
        ) : (
          /* Màn hình Đăng nhập / Đăng ký / Quên mật khẩu */
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
            
            {/* Error Message tiếng Việt */}
            {error && (
              <div className="bg-taca-sale/10 text-taca-sale p-3 text-[14px] rounded-lg font-medium border border-taca-sale/20 mb-4">
                <div>{error}</div>

                {/* Nếu tài khoản chưa kích hoạt khi đăng nhập -> chuyển sang màn hình hướng dẫn link xác thực */}
                {(error.includes('chưa được xác thực email') || error.includes('chưa được kích hoạt') || error.includes('link xác nhận')) && isSignIn && (
                  <button
                    type="button"
                    onClick={() => {
                      if (identifier.includes('@')) {
                        setPendingEmail(identifier.trim());
                      }
                      setMode('waiting_email_link');
                      setError('');
                    }}
                    className="mt-2 inline-flex items-center gap-1 text-[13px] font-bold text-taca-primary hover:underline cursor-pointer"
                  >
                    Xem hướng dẫn xác nhận email &rarr;
                  </button>
                )}
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
                {loading ? 'Đang xử lý...' : (isForgot ? 'Gửi yêu cầu' : (isSignIn ? 'Đăng nhập' : 'Tiếp tục đăng ký'))}
              </Button>

              {isSignIn && (
                <div className="text-center mt-2">
                  <button type="button" onClick={() => { setMode('forgot'); setError(''); }} className="text-[14px] font-bold text-taca-primary hover:text-taca-primary-hover focus:outline-none cursor-pointer">
                    Quên mật khẩu?
                  </button>
                </div>
              )}
            </form>

            {!isForgot && (
              <>
                <div className="relative flex items-center my-5">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink-0 px-3 text-slate-400 text-[12px] font-medium tracking-wide uppercase">
                    Hoặc
                  </span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                <button 
                  type="button"
                  id="google-signin-button"
                  onClick={handleGoogleSignIn}
                  disabled={loading || googleLoading}
                  aria-label={isSignIn ? 'Đăng nhập với Google' : 'Đăng ký với Google'}
                  className="relative flex items-center justify-center w-full h-11 px-4 bg-white hover:bg-slate-50/90 active:bg-slate-100 border border-slate-300 hover:border-slate-400 rounded-xl font-medium text-[14px] text-slate-700 hover:text-slate-900 transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs hover:shadow-xs active:scale-[0.99] gap-3 select-none focus:outline-hidden focus:ring-2 focus:ring-[#4285F4]/30 focus:border-[#4285F4] group"
                >
                  {googleLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-[#4285F4]" />
                  ) : (
                    <GoogleIcon />
                  )}
                  <span className="font-semibold text-[13px] tracking-tight">
                    {googleLoading 
                      ? 'Đang kết nối Google...' 
                      : (isSignIn ? 'Đăng nhập với Google' : 'Đăng ký với Google')}
                  </span>
                </button>

                {/* <div className="flex items-center justify-center gap-1.5 mt-2.5 mb-5 text-[11px] text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Đăng nhập 1-chạm nhanh chóng · Bảo mật chuẩn Google</span>
                </div> */}
              </>
            )}

            <div className="text-center text-[13px] text-slate-600 pt-3 border-t border-slate-100">
              {isForgot ? (
                <button type="button" onClick={() => { setMode('signin'); setError(''); }} className="font-bold cursor-pointer hover:text-taca-primary focus:outline-none flex items-center justify-center mx-auto gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                  Quay lại đăng nhập
                </button>
              ) : (
                isSignIn ? (
                  <>
                    Chưa có tài khoản?{' '}
                    <button type="button" onClick={() => { setMode('signup'); setError(''); }} className="font-bold text-taca-primary hover:text-taca-primary-hover hover:underline cursor-pointer focus:outline-none">
                      Đăng ký ngay
                    </button>
                  </>
                ) : (
                  <>
                    Đã có tài khoản?{' '}
                    <button type="button" onClick={() => { setMode('signin'); setError(''); }} className="font-bold text-taca-primary hover:text-taca-primary-hover hover:underline cursor-pointer focus:outline-none">
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
