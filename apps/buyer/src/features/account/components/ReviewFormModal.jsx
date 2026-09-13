import PropTypes from 'prop-types';
import { useState } from 'react';
import Modal from '../../../../../../shared/ui-components/src/components/Modal';
import Button from '../../../../../../shared/ui-components/src/components/Button';
import { reviewApi } from '../services/review.api';

const ReviewFormModal = ({ isOpen, onClose, reviewItem, onSuccess }) => {
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await reviewApi.submitReview({
        product_id: reviewItem?.product_id,
        rating,
        content
      });
      alert('Gửi đánh giá thành công!');
      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      alert('Có lỗi xảy ra: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !reviewItem) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Đánh giá sản phẩm" size="md">
      <div className="flex gap-4 p-4 bg-gray-50 rounded-lg mb-6">
        <img src={reviewItem.image || 'https://via.placeholder.com/60'} alt={reviewItem.name} className="w-[60px] h-[60px] rounded object-cover border border-gray-200" />
        <div>
          <h4 className="text-[14px] font-semibold text-taca-text-main m-0 mb-1">{reviewItem.name}</h4>
          <p className="text-[12px] text-gray-500 m-0">Phân loại hàng: {reviewItem.variant}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <p className="text-[14px] font-semibold text-taca-text-main mb-2">Chất lượng sản phẩm</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`text-[32px] transition-colors leading-none bg-transparent border-none cursor-pointer ${star <= rating ? 'text-[#ff9d00]' : 'text-gray-300'}`}
              >
                ★
              </button>
            ))}
            <span className="ml-2 text-[14px] text-gray-500 self-center">
              {rating === 5 ? 'Tuyệt vời' : rating === 4 ? 'Hài lòng' : rating === 3 ? 'Bình thường' : rating === 2 ? 'Tạm được' : 'Rất tệ'}
            </span>
          </div>
        </div>

        <div>
          <p className="text-[14px] font-semibold text-taca-text-main mb-2">Nhận xét chi tiết</p>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Hãy chia sẻ những điều bạn thích về sản phẩm này nhé (tối thiểu 15 ký tự)"
            className="w-full h-[120px] p-3 border border-gray-200 rounded-lg outline-none focus:border-taca-primary text-[14px] resize-none"
            required
            minLength={15}
          ></textarea>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} className="!px-6">
            Trở lại
          </Button>
          <Button type="submit" disabled={loading || content.length < 15} className="!px-8">
            {loading ? 'Đang gửi...' : 'Hoàn thành'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

ReviewFormModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  reviewItem: PropTypes.object,
  onSuccess: PropTypes.func
};

export default ReviewFormModal;
