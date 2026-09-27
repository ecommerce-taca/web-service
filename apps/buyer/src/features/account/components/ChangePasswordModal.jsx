import { useState } from 'react';
import PropTypes from 'prop-types';
import Modal from '../../../../../../shared/ui-components/src/components/Modal';
import Button from '../../../../../../shared/ui-components/src/components/Button';
import Input from '../../../../../../shared/ui-components/src/components/Input';
import { authApi } from '../../auth/services/auth.api';
import { getAuthErrorMessage } from '../../auth/utils/authError';

const ChangePasswordModal = ({ isOpen, onClose, email }) => {
  const [mode, setMode] = useState('request'); // 'request' | 'reset'
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [mockResetUrl, setMockResetUrl] = useState('');

  const resetState = () => {
    setMode('request');
    setToken('');
    setNewPassword('');
    setConfirmPassword('');
    setLoading(false);
    setMessage('');
    setError('');
    setMockResetUrl('');
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleRequestResetLink = async () => {
    if (!email) {
      setError('Không tìm thấy email của tài khoản.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await authApi.forgotPassword(email);
      setMessage(`Hướng dẫn đặt lại mật khẩu đã được gửi đến email ${email}. Vui lòng kiểm tra hộp thư của bạn.`);
      if (response?.data?.mock_reset_url) {
        setMockResetUrl(response.data.mock_reset_url);
        if (response.data.mock_token) {
          setToken(response.data.mock_token);
        }
      }
    } catch (err) {
      setError(getAuthErrorMessage(err, 'forgot'));
    } finally {
      setLoading(false);
    }
  };

  const handleDirectReset = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const cleanToken = token.trim();
    if (!cleanToken) {
      setError('Vui lòng nhập mã xác thực (token) được gửi qua email.');
      return;
    }

    if (newPassword.length < 12 || newPassword.length > 72) {
      setError('Mật khẩu mới phải có độ dài từ 12 đến 72 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp.');
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword(cleanToken, newPassword);
      setMessage('Cập nhật mật khẩu thành công! Bạn có thể sử dụng mật khẩu mới để đăng nhập.');
      setNewPassword('');
      setConfirmPassword('');
      setToken('');
    } catch (err) {
      setError(getAuthErrorMessage(err, 'reset'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="CẬP NHẬT MẬT KHẨU"
      width="max-w-[480px]"
    >
      <div className="flex flex-col gap-4">
        {/* Switch tab */}
        <div className="flex border-b border-taca-border">
          <button
            type="button"
            onClick={() => { setMode('request'); setError(''); setMessage(''); }}
            className={`flex-1 py-2.5 text-[14px] font-bold text-center border-b-2 transition-colors cursor-pointer ${
              mode === 'request'
                ? 'border-taca-primary text-taca-primary'
                : 'border-transparent text-taca-text-muted hover:text-taca-text-main'
            }`}
          >
            1. Gửi mã xác thực
          </button>
          <button
            type="button"
            onClick={() => { setMode('reset'); setError(''); setMessage(''); }}
            className={`flex-1 py-2.5 text-[14px] font-bold text-center border-b-2 transition-colors cursor-pointer ${
              mode === 'reset'
                ? 'border-taca-primary text-taca-primary'
                : 'border-transparent text-taca-text-muted hover:text-taca-text-main'
            }`}
          >
            2. Đặt mật khẩu mới
          </button>
        </div>

        {message && (
          <div className="bg-green-50 text-green-700 p-3 text-[14px] rounded-lg font-medium border border-green-200">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-taca-sale/10 text-taca-sale p-3 text-[14px] rounded-lg font-medium border border-taca-sale/20">
            {error}
          </div>
        )}

        {mode === 'request' ? (
          <div className="flex flex-col gap-4 py-2">
            <p className="text-[14px] text-taca-text-muted leading-relaxed">
              Để bảo mật tài khoản, hệ thống sẽ gửi liên kết và mã xác thực đặt lại mật khẩu đến địa chỉ email đã đăng ký của bạn.
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-[14px]">
              <span className="text-taca-text-muted">Email nhận liên kết: </span>
              <strong className="text-taca-text-main">{email || 'Chưa cập nhật'}</strong>
            </div>

            {mockResetUrl && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-[13px] text-blue-700 flex flex-col gap-2">
                <span>[Chế độ kiểm thử Mock] Đã tạo mã xác thực mẫu.</span>
                <button
                  type="button"
                  onClick={() => setMode('reset')}
                  className="text-left font-bold underline hover:text-blue-900 cursor-pointer"
                >
                  Bấm vào đây để chuyển sang bước 2 (Điền sẵn mã xác thực)
                </button>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 mt-4">
              <Button type="button" variant="secondary" onClick={handleClose}>
                Đóng
              </Button>
              <Button
                type="button"
                onClick={handleRequestResetLink}
                disabled={loading || !email}
              >
                {loading ? 'Đang gửi...' : 'Gửi liên kết đổi mật khẩu'}
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleDirectReset} className="flex flex-col gap-4 py-2">
            <p className="text-[14px] text-taca-text-muted leading-relaxed">
              Nhập mã xác thực (token) nhận được qua email cùng mật khẩu mới của bạn (12-72 ký tự).
            </p>

            <Input
              label="Mã xác thực (Token từ email)"
              name="token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Dán mã xác thực nhận được từ email"
              required
            />

            <Input
              label="Mật khẩu mới (12 - 72 ký tự)"
              name="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nhập mật khẩu mới"
              required
            />

            <Input
              label="Nhập lại mật khẩu mới"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu mới"
              required
            />

            <div className="flex items-center justify-end gap-3 mt-4">
              <Button type="button" variant="secondary" onClick={handleClose}>
                Hủy
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Đang cập nhật...' : 'Xác nhận đổi mật khẩu'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};

ChangePasswordModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  email: PropTypes.string,
};

export default ChangePasswordModal;
