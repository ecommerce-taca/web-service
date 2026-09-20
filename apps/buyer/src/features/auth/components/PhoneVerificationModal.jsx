import { useState, useEffect, useCallback } from 'react';
import { Modal, Input, Button } from '@taca/ui-components';
import { authApi } from '../services/auth.api';

const PhoneVerificationModal = ({ isOpen, onClose, phone, onVerificationSuccess }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [challengeId, setChallengeId] = useState(null);
  const [countdown, setCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    let timer;
    if (isOpen && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isOpen, countdown]);

  const handleRequestOtp = useCallback(async () => {
    setError('');
    setIsResending(true);
    try {
      let finalPhone = phone.replace(/\s+/g, '');
      const phoneRegex = /^(0|84|\+84)[3|5|7|8|9][0-9]{8}$/;
      
      if (!phoneRegex.test(finalPhone)) {
        setError('Số điện thoại không hợp lệ (Ví dụ: 0912345678).');
        setIsResending(false);
        return;
      }
      
      if (finalPhone.startsWith('0')) {
        finalPhone = '+84' + finalPhone.slice(1);
      } else if (finalPhone.startsWith('84')) {
        finalPhone = '+' + finalPhone;
      }
      
      const response = await authApi.requestPhoneOtp(finalPhone);
      setChallengeId(response.data.challenge_id);
      setCountdown(60);
    } catch (err) {
      // Backend may return 429 Too Many Requests if they request too often
      setError(err.response?.status === 429 ? 'Bạn yêu cầu quá nhiều lần. Vui lòng thử lại sau 60s.' : (err.message || 'Không thể gửi mã OTP. Vui lòng thử lại sau.'));
    } finally {
      setIsResending(false);
    }
  }, [phone]);

  useEffect(() => {
    if (isOpen && phone) {
      setTimeout(() => {
        handleRequestOtp();
      }, 0);
    }
  }, [isOpen, phone, handleRequestOtp]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError('Vui lòng nhập đúng 6 số OTP.');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      await authApi.verifyPhoneOtp(challengeId, otp);
      onVerificationSuccess();
      handleClose();
    } catch (err) {
      setError(err.message || 'Mã OTP không chính xác hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOtp('');
    setError('');
    setChallengeId(null);
    setCountdown(60);
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      width="max-w-[400px]"
      hideHeader={true}
    >
      <div className="flex flex-col text-center">
        <h2 className="text-[24px] font-bold text-taca-text-main mb-2">
          Xác thực số điện thoại
        </h2>
        <p className="text-[14px] text-taca-text-muted mb-6">
          Mã xác thực gồm 6 số đã được gửi tới số điện thoại <br />
          <span className="font-bold text-taca-text-main">{phone}</span>
        </p>

        {error && (
          <div className="bg-taca-sale/10 text-taca-sale p-3 text-[14px] rounded-lg font-medium border border-taca-sale/20 mb-4 text-left">
            {error}
          </div>
        )}

        <form onSubmit={handleVerify} className="flex flex-col gap-4">
          <Input 
            type="text"
            placeholder="Nhập 6 số OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            required
            className="text-center tracking-widest text-[18px] font-bold"
          />

          <Button 
            type="submit" 
            className="w-full mt-2"
            disabled={loading || otp.length !== 6 || !challengeId}
          >
            {loading ? 'Đang xác thực...' : 'Xác thực'}
          </Button>
        </form>

        <div className="mt-6 text-[14px] text-taca-text-muted">
          Chưa nhận được mã?{' '}
          {countdown > 0 ? (
            <span className="font-medium">Gửi lại sau {countdown}s</span>
          ) : (
            <button 
              type="button" 
              onClick={handleRequestOtp} 
              disabled={isResending}
              className="font-bold text-taca-primary hover:text-taca-primary-hover focus:outline-none"
            >
              {isResending ? 'Đang gửi...' : 'Gửi lại mã'}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default PhoneVerificationModal;
