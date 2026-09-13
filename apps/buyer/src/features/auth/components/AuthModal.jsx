import { useState } from 'react';
import { Modal, Input, Button } from '@taca/ui-components';
import { authApi } from '../services/auth.api';
import { useAuth } from '../hooks/useAuth';

const AuthModal = () => {
  const { isAuthModalOpen, closeAuthModal, login } = useAuth();
  
  // 'signin' or 'signup'
  const [mode, setMode] = useState('signin');
  
  // Form state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
    if (!phoneRegex.test(trimmedId)) return 'Số điện thoại không hợp lệ (VD: 0912345678).';
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

      const user = await authApi.login({ identifier: finalIdentifier, password });
      login(user);
      closeAuthModal();
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!name || !identifier || !password || !confirmPassword) {
      setError('Vui lòng nhập đầy đủ thông tin.');
      return;
    }

    const nameError = validateName(name);
    if (nameError) {
      setError(nameError);
      return;
    }

    const idError = validateIdentifier(identifier);
    if (idError) {
      setError(idError);
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
      let finalIdentifier = identifier.trim();
      if (!finalIdentifier.includes('@') && finalIdentifier.startsWith('0')) {
        finalIdentifier = '+84' + finalIdentifier.slice(1);
      }

      const user = await authApi.register({ name: name.trim(), identifier: finalIdentifier, password });
      login(user);
      closeAuthModal();
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setIdentifier('');
    setPassword('');
    setName('');
    setConfirmPassword('');
    setError('');
  };

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    resetState();
  };

  // Close handler to reset state too
  const handleClose = () => {
    resetState();
    closeAuthModal();
  };

  const isSignIn = mode === 'signin';

  return (
    <Modal 
      isOpen={isAuthModalOpen} 
      onClose={handleClose} 
      width="max-w-[500px]"
      hideHeader={true}
    >
      <div className="flex flex-col">
        {/* Title & Subtitle */}
        <div className="mb-6">
          <h2 className="text-[24px] font-bold text-taca-text-main">
            {isSignIn ? 'ĐĂNG NHẬP TACA' : 'ĐĂNG KÝ TACA'}
          </h2>
          <p className="text-[14px] text-taca-text-muted mt-2">
            {isSignIn 
              ? 'Theo dõi đơn hàng, lưu voucher và mua sắm nhanh hơn.' 
              : 'Tạo tài khoản để mua sắm và nhận nhiều ưu đãi.'}
          </p>
        </div>
        
        {error && (
          <div className="bg-taca-sale/10 text-taca-sale p-3 text-[14px] rounded-lg font-medium border border-taca-sale/20 mb-4">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={isSignIn ? handleSignIn : handleSignUp} className="flex flex-col gap-4">
          
          {!isSignIn && (
            <Input 
              label="Họ và tên"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}

          <Input 
            label="Email hoặc số điện thoại"
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
          
          <Input 
            label="Mật khẩu"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {!isSignIn && (
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
            {loading ? 'Đang xử lý...' : (isSignIn ? 'Đăng nhập' : 'Đăng ký')}
          </Button>

          {isSignIn && (
            <div className="text-center mt-2">
              <button type="button" className="text-[14px] font-bold text-taca-primary hover:text-taca-primary-hover focus:outline-none">
                Quên mật khẩu?
              </button>
            </div>
          )}
        </form>

        <div className="relative flex items-center py-6">
          <div className="flex-grow border-t border-taca-border"></div>
          <span className="flex-shrink-0 mx-4 text-taca-text-muted text-[13px]">Hoặc tiếp tục với</span>
          <div className="flex-grow border-t border-taca-border"></div>
        </div>

        {/* Placeholder cho Login with Google sau này */}
        <button 
          type="button"
          className="flex items-center justify-center w-full bg-white border border-taca-border rounded-lg py-2 hover:bg-gray-50 transition-colors"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5 mr-2" />
          <span className="text-[14px] font-bold text-taca-text-main">Google</span>
        </button>

        <div className="w-full h-[1px] bg-taca-border mt-6 mb-4"></div>

        <div className="text-center text-[14px] text-taca-text-main">
          {isSignIn ? (
            <>
              Chưa có tài khoản?{' '}
              <button type="button" onClick={toggleMode} className="font-bold cursor-pointer hover:text-taca-primary focus:outline-none">
                Đăng ký ngay
              </button>
            </>
          ) : (
            <>
              Đã có tài khoản?{' '}
              <button type="button" onClick={toggleMode} className="font-bold cursor-pointer hover:text-taca-primary focus:outline-none">
                Đăng nhập
              </button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default AuthModal;
