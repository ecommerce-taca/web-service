import { useState } from 'react';
import PropTypes from 'prop-types';
import Modal from '../../../../../../shared/ui-components/src/components/Modal';
import Button from '../../../../../../shared/ui-components/src/components/Button';
import Input from '../../../../../../shared/ui-components/src/components/Input';
import { authApi } from '../../auth/services/auth.api';

const ChangePasswordModal = ({ isOpen, onClose, onSuccess }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccessMessage('');
    setLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const cleanCurrent = currentPassword.trim();
    if (!cleanCurrent) {
      setError('Vui lòng nhập mật khẩu hiện tại.');
      return;
    }

    const cleanNew = newPassword.trim();
    if (!cleanNew) {
      setError('Vui lòng nhập mật khẩu mới.');
      return;
    }

    if (cleanNew.length < 6 || cleanNew.length > 72) {
      setError('Mật khẩu mới phải có độ dài từ 6 đến 72 ký tự.');
      return;
    }

    if (cleanNew === cleanCurrent) {
      setError('Mật khẩu mới không được trùng với mật khẩu hiện tại.');
      return;
    }

    if (cleanNew !== confirmPassword.trim()) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);
    try {
      await authApi.changePassword({
        currentPassword: cleanCurrent,
        oldPassword: cleanCurrent,
        newPassword: cleanNew
      });

      setSuccessMessage('Đổi mật khẩu thành công!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onSuccess?.();

      setTimeout(() => {
        handleClose();
      }, 1200);
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.response?.data?.message || err.message;
      setError(msg || 'Đổi mật khẩu không thành công. Vui lòng kiểm tra lại mật khẩu hiện tại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="ĐỔI MẬT KHẨU"
      width="max-w-[460px]"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {successMessage && (
          <div className="bg-green-50 text-green-700 p-3 text-[14px] rounded-lg font-medium border border-green-200">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="bg-taca-sale/10 text-taca-sale p-3 text-[14px] rounded-lg font-medium border border-taca-sale/20">
            {error}
          </div>
        )}

        <Input
          label="Mật khẩu hiện tại"
          name="currentPassword"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Nhập mật khẩu hiện tại"
          required
        />

        <Input
          label="Mật khẩu mới"
          name="newPassword"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Nhập mật khẩu mới"
          helperText="Độ dài từ 6 đến 72 ký tự"
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

        <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t border-taca-border">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={loading}
            className="!px-6"
          >
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="!px-6"
          >
            {loading ? 'Đang lưu...' : 'Xác nhận đổi mật khẩu'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

ChangePasswordModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
};

export default ChangePasswordModal;
