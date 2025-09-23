import React, { useState, useEffect, useCallback } from 'react';
import { getProductReviews, createReview, updateReview, deleteReview } from '../services/api.services';
import { getUser } from '../utils/authStorage';

const ProductReviews = ({ drinkId, userOrders = [] }) => {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedRating, setSelectedRating] = useState('all');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  
  const user = getUser();
  const userReview = reviews.find(review => review.user_id === user?.id);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getProductReviews(drinkId, 1, 10, selectedRating);
      if (result.success) {
        setReviews(result.data.reviews);
        setAverageRating(parseFloat(result.data.averageRating));
      }
    } catch (error) {
      console.error('Lỗi khi lấy đánh giá:', error);
    } finally {
      setLoading(false);
    }
  }, [drinkId, selectedRating]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  

  const handleSubmitReview = async () => {
    if (!reviewForm.rating || !reviewForm.comment.trim()) {
      alert('Vui lòng điền đầy đủ thông tin đánh giá');
      return;
    }

    setSubmitting(true);
    try {
      let result;
      if (editingReview) {
        result = await updateReview(editingReview.id, reviewForm.rating, reviewForm.comment);
      } else {
        // Tìm đơn hàng chứa sản phẩm này để lấy orderId
        const orderWithProduct = userOrders.find(order => 
          order.orderItems?.some(item => 
            item.drink_id === drinkId || item.drink?.id === drinkId
          )
        );
        
        console.log('Debug review submission:', {
          drinkId,
          userOrders: userOrders.length,
          orderWithProduct: orderWithProduct?.id,
          orderItems: userOrders.flatMap(order => order.orderItems || [])
        });
        
        if (!orderWithProduct) {
          alert('Không tìm thấy đơn hàng chứa sản phẩm này');
          return;
        }
        
        result = await createReview(drinkId, reviewForm.rating, reviewForm.comment, orderWithProduct.id);
      }

      if (result.success) {
        alert(editingReview ? 'Cập nhật đánh giá thành công!' : 'Đánh giá thành công!');
        setShowReviewForm(false);
        setEditingReview(null);
        setReviewForm({ rating: 5, comment: '' });
        fetchReviews();
      } else {
        console.error('Review submission failed:', result.error);
        alert(`Lỗi khi tạo đánh giá: ${result.error}`);
      }
    } catch (error) {
      console.error('Lỗi khi gửi đánh giá:', error);
      alert(`Có lỗi xảy ra khi gửi đánh giá: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) return;

    try {
      const result = await deleteReview(reviewId);
      if (result.success) {
        alert('Xóa đánh giá thành công!');
        fetchReviews();
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error('Lỗi khi xóa đánh giá:', error);
      alert('Có lỗi xảy ra khi xóa đánh giá');
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setReviewForm({ rating: review.rating, comment: review.comment });
    setShowReviewForm(true);
  };

  const renderStars = (rating, interactive = false, onChange = null) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            onClick={interactive ? () => onChange(star) : undefined}
            className={`w-5 h-5 ${
              star <= rating 
                ? 'text-yellow-400' 
                : 'text-gray-300'
            } ${interactive ? 'hover:text-yellow-400 cursor-pointer' : ''}`}
          >
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
    );
  };

  // Check if user has at least a pending or completed order containing this product
  const hasPurchasedProduct = userOrders.some(order => 
    ['pending','confirmed','preparing','shipping','delivered'].includes(order.status) &&
    order.orderItems?.some(item => 
      item.drink_id === drinkId || item.drink?.id === drinkId
    )
  );
  
  // User can review if they have purchased this specific product and haven't reviewed yet
  const canReview = !!user && hasPurchasedProduct && !userReview;
  
  // Debug: log để kiểm tra
  console.log('Debug ProductReviews:', { 
    user: !!user, 
    userOrders: userOrders.length, 
    hasPurchasedProduct,
    userReview: !!userReview,
    canReview,
    drinkId,
    ordersData: userOrders,
    orderItems: userOrders.flatMap(order => order.orderItems || [])
  });

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800 flex items-center">
          <div className="w-1 h-6 bg-purple-600 mr-3"></div>
          Đánh giá sản phẩm
        </h3>
        {userReview ? (
          // User has already reviewed - show edit/delete options
          <div className="flex space-x-2">
            <button
              onClick={() => handleEditReview(userReview)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Sửa đánh giá
            </button>
            <button
              onClick={() => handleDeleteReview(userReview.id)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              Xóa đánh giá
            </button>
          </div>
        ) : (
          // User hasn't reviewed yet
          canReview ? (
            <button
              onClick={() => setShowReviewForm(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
            >
              Viết đánh giá
            </button>
          ) : (
            <button
              disabled
              className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
              title={!user ? "Bạn cần đăng nhập để đánh giá" : !hasPurchasedProduct ? "Bạn chỉ có thể đánh giá sau khi đơn hàng đã giao thành công" : "Không thể đánh giá"}
            >
              Viết đánh giá
            </button>
          )
        )}
      </div>

      {/* Average Rating */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Điểm trung bình</p>
            <div className="flex items-center space-x-2">
              <span className="text-3xl font-bold text-gray-800">
                {isNaN(averageRating) ? '0.0' : averageRating.toFixed(1)}
              </span>
              <span className="text-gray-600">/5</span>
            </div>
          </div>
          <div className="flex items-center">
            {renderStars(isNaN(averageRating) ? 0 : Math.round(averageRating))}
            <span className="ml-2 text-sm text-gray-600">({reviews.length} đánh giá)</span>
          </div>
        </div>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-purple-50 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-gray-800 mb-3">
            {editingReview ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá của bạn'}
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Đánh giá của bạn:
              </label>
              {renderStars(reviewForm.rating, true, (rating) => 
                setReviewForm({ ...reviewForm, rating })
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nhận xét:
              </label>
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows="4"
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleSubmitReview}
                disabled={submitting}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {submitting ? 'Đang gửi...' : (editingReview ? 'Cập nhật' : 'Gửi đánh giá')}
              </button>
              <button
                onClick={() => {
                  setShowReviewForm(false);
                  setEditingReview(null);
                  setReviewForm({ rating: 5, comment: '' });
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center space-x-2 mb-4">
        <span className="text-sm font-medium text-gray-700">Lọc theo:</span>
        {['all', '5', '4', '3', '2', '1'].map((rating) => (
          <button
            key={rating}
            onClick={() => setSelectedRating(rating)}
            className={`px-3 py-1 text-sm rounded-full transition-colors duration-200 ${
              selectedRating === rating
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {rating === 'all' ? 'Tất cả' : `${rating} sao`}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Đang tải đánh giá...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Chưa có đánh giá nào</div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-purple-600">
                        {review.user?.fullName?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {review.user?.fullName || 'Người dùng'}
                      </p>
                      <div className="flex items-center space-x-2">
                        {renderStars(review.rating)}
                        <span className="text-sm text-gray-500">
                          {new Date(review.created_at).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-gray-700 mt-2">{review.comment}</p>
                  )}
                </div>
                
                {/* Edit/Delete buttons for user's own review */}
                {review.user_id === user?.id && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditReview(review)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Xóa
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductReviews;