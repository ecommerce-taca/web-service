/**
 * Chuẩn hóa và chuyển đổi các mã lỗi / phản hồi kỹ thuật từ server thành thông báo tiếng Việt thân thiện với người dùng.
 * Tuân thủ chuẩn tài liệu API auth-user (https://github.com/ecommerce-taca/docs/tree/main/auth-user-docs/docs/api/auth-user.md).
 * Đảm bảo KHÔNG BAO GIỜ hiển thị mã lỗi kỹ thuật (như "Request failed with status code 401") ra màn hình.
 *
 * @param {Error|Object|string} err - Lỗi nhận được từ try/catch hoặc API client
 * @param {'signin'|'signup'|'verify'|'forgot'|'reset'} context - Ngữ cảnh thực hiện thao tác
 * @returns {string} Thông báo lỗi tiếng Việt dễ hiểu
 */
export const getAuthErrorMessage = (err, context = 'signin') => {
  if (!err) {
    return 'Đã có lỗi xảy ra. Vui lòng thử lại.';
  }

  // Nếu đã là một chuỗi tiếng Việt có dấu rõ ràng
  if (typeof err === 'string' && isVietnamese(err)) {
    return err;
  }

  const status = err.response?.status;
  const data = err.response?.data;
  
  // Trích xuất mã lỗi error.code theo cấu trúc chuẩn trong tài liệu auth-user.md
  // Ví dụ: { error: { code: "AUTH_EMAIL_EXISTS", message: "..." } } hoặc { code: "..." }
  const errorCode = data?.error?.code || data?.code || '';
  const rawMsg = data?.error?.message || data?.message || err.message || '';
  const lowerMsg = String(rawMsg).toLowerCase();
  const upperCode = String(errorCode).toUpperCase();

  // 1. Ánh xạ các mã lỗi chính xác từ tài liệu auth-user.md
  if (upperCode === 'AUTH_EMAIL_EXISTS' || upperCode.includes('EMAIL_EXISTS')) {
    return 'Tài khoản hoặc email này đã tồn tại trong hệ thống. Vui lòng đăng nhập.';
  }

  if (upperCode === 'AUTH_PHONE_EXISTS' || upperCode.includes('PHONE_EXISTS')) {
    return 'Số điện thoại này đã được sử dụng cho một tài khoản khác.';
  }

  if (upperCode === 'AUTH_INVALID_CREDENTIALS') {
    return 'Email/Số điện thoại hoặc mật khẩu không chính xác.';
  }

  if (upperCode === 'AUTH_ACCOUNT_LOCKED') {
    return 'Tài khoản đã bị tạm khóa do nhập sai mật khẩu quá 5 lần. Vui lòng thử lại sau 15 phút.';
  }

  if (upperCode === 'AUTH_ACCOUNT_SUSPENDED') {
    return 'Tài khoản của bạn đã bị tạm khóa. Vui lòng liên hệ bộ phận hỗ trợ.';
  }

  if (upperCode === 'AUTH_PHONE_NOT_VERIFIED') {
    return 'Số điện thoại chưa được xác thực.';
  }

  if (upperCode === 'AUTH_VERIFICATION_INVALID') {
    return 'Đường dẫn xác thực không hợp lệ, đã hết hạn hoặc đã được sử dụng.';
  }

  if (upperCode === 'AUTH_VERIFICATION_ALREADY_COMPLETE' || lowerMsg.includes('already complete') || lowerMsg.includes('already verified')) {
    if (context === 'resend' || context === 'profile') {
      return 'Email của tài khoản này đã được xác thực trước đó.';
    }
    return 'Tài khoản này đã được xác thực trước đó. Bạn có thể đăng nhập ngay.';
  }

  if (upperCode === 'AUTH_RESEND_LIMIT_EXCEEDED') {
    return 'Bạn đã yêu cầu gửi lại email xác thực quá số lần cho phép (tối đa 3 lần/giờ).';
  }

  if (upperCode === 'RATE_LIMITED' || status === 429) {
    return 'Bạn đã thao tác quá nhiều lần. Vui lòng đợi trong giây lát rồi thử lại.';
  }

  if (upperCode === 'AUTH_INVALID_INPUT') {
    if (context === 'signup') {
      return 'Thông tin đăng ký không hợp lệ. Vui lòng kiểm tra lại họ tên, email hoặc mật khẩu (12-72 ký tự).';
    }
    return 'Thông tin nhập vào không hợp lệ. Vui lòng kiểm tra lại.';
  }

  // 2. Nhận diện lỗi Conflict 409 hoặc tài khoản đã tồn tại
  if (status === 409) {
    if (context === 'resend' || context === 'verify' || context === 'profile') {
      return 'Email của tài khoản này đã được xác thực trước đó.';
    }
    return 'Tài khoản hoặc email này đã tồn tại trong hệ thống. Vui lòng đăng nhập.';
  }

  if (
    lowerMsg.includes('already exists') ||
    lowerMsg.includes('tồn tại') ||
    lowerMsg.includes('already registered') ||
    lowerMsg.includes('duplicate') ||
    lowerMsg.includes('user exists') ||
    lowerMsg.includes('email taken') ||
    (context === 'signup' && status === 401)
  ) {
    return 'Tài khoản hoặc email này đã tồn tại trong hệ thống. Vui lòng đăng nhập.';
  }

  // 3. Nhận diện lỗi tài khoản chưa kích hoạt / chưa xác nhận email
  if (
    lowerMsg.includes('unverified') ||
    lowerMsg.includes('not verified') ||
    lowerMsg.includes('chưa xác thực') ||
    lowerMsg.includes('chưa kích hoạt') ||
    lowerMsg.includes('pending verification') ||
    lowerMsg.includes('verify email')
  ) {
    return 'Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email và nhấp vào đường link xác nhận.';
  }

  // 4. Nhận diện lỗi HTTP 401 Unauthorized
  if (status === 401 || lowerMsg.includes('status code 401') || lowerMsg.includes('unauthorized')) {
    if (context === 'signin') {
      return 'Email/Số điện thoại hoặc mật khẩu không chính xác.';
    }
    if (context === 'signup') {
      return 'Tài khoản hoặc email này đã tồn tại trong hệ thống. Vui lòng đăng nhập.';
    }
    if (context === 'verify') {
      return 'Đường dẫn xác thực không hợp lệ hoặc đã hết hạn.';
    }
    return 'Phiên làm việc đã hết hạn hoặc bạn không có quyền truy cập.';
  }

  // 5. Nhận diện lỗi HTTP 404 Not Found
  if (status === 404 || lowerMsg.includes('status code 404') || upperCode === 'AUTH_USER_NOT_FOUND') {
    if (context === 'signin') {
      return 'Tài khoản không tồn tại trên hệ thống. Vui lòng kiểm tra lại hoặc đăng ký mới.';
    }
    if (context === 'verify') {
      return 'Đường dẫn xác thực không hợp lệ hoặc không tìm thấy tài khoản.';
    }
    return 'Không tìm thấy dữ liệu yêu cầu hoặc máy chủ chưa sẵn sàng.';
  }

  // 6. Nhận diện lỗi HTTP 403 Forbidden
  if (status === 403 || lowerMsg.includes('status code 403')) {
    return 'Tài khoản chưa được kích hoạt hoặc bạn không có quyền thực hiện thao tác này.';
  }

  // 7. Nhận diện lỗi Server 500, 502, 503, 504
  if ((status && status >= 500) || lowerMsg.includes('status code 5')) {
    return 'Hệ thống đang gặp sự cố tạm thời. Vui lòng thử lại sau ít phút.';
  }

  // 8. Lỗi kết nối mạng
  if (lowerMsg.includes('network error') || lowerMsg.includes('failed to fetch') || lowerMsg.includes('connection refused')) {
    return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn.';
  }

  // 9. Giữ lại chuỗi tiếng Việt rõ ràng nếu có từ backend
  if (rawMsg && isVietnamese(rawMsg)) {
    return rawMsg;
  }

  // 10. Fallback mặc định theo ngữ cảnh
  switch (context) {
    case 'signin':
      return 'Email/Số điện thoại hoặc mật khẩu không chính xác.';
    case 'signup':
      return 'Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.';
    case 'verify':
      return 'Đường dẫn xác thực không hợp lệ hoặc đã hết hạn.';
    case 'resend':
      return 'Không thể gửi lại email xác thực. Vui lòng thử lại sau.';
    case 'profile':
      return 'Cập nhật thông tin hồ sơ thất bại. Vui lòng thử lại.';
    case 'forgot':
      return 'Không thể gửi yêu cầu đặt lại mật khẩu. Vui lòng thử lại.';
    case 'reset':
      return 'Đặt lại mật khẩu thất bại, đường dẫn có thể đã hết hạn.';
    default:
      return 'Đã có lỗi xảy ra. Vui lòng thử lại sau.';
  }
};

/**
 * Kiểm tra xem một chuỗi có chứa ký tự tiếng Việt có dấu hay không
 */
function isVietnamese(text) {
  return /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(text);
}
