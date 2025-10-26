import React, { useState } from 'react';
import { forgotPassword, verifyForgotOtp, resetPassword } from '../services/api.services';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ArrowLeft, CheckCircle, Eye, EyeOff } from 'lucide-react';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);
    try {
      await forgotPassword(email);
      setMessage('OTP đã được gửi đến email của bạn');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể gửi OTP. Vui lòng kiểm tra email và thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (!/^\d*$/.test(value)) return; // Chỉ cho phép số
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);
    const otpCode = otp.join('');
    try {
      await verifyForgotOtp(email, otpCode);
      setMessage('OTP hợp lệ, vui lòng nhập mật khẩu mới');
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'OTP không hợp lệ. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    
    setIsLoading(true);
    try {
      const otpCode = otp.join('');
      await resetPassword(email, otpCode, newPassword, confirmPassword);
      setMessage('Đặt lại mật khẩu thành công!');
      setStep(4);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setMessage('');
    setIsLoading(true);
    try {
      await forgotPassword(email);
      setMessage('OTP mới đã được gửi đến email của bạn');
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể gửi lại OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex">
      {/* Left Side - Image Background with Overlay */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600">
        {/* Animated Background Circles */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        
        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
          <div className="max-w-md text-center">
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center shadow-2xl">
                <Lock className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4 drop-shadow-lg">
              Đặt lại mật khẩu 🔐
            </h1>
            <p className="text-lg text-white/90 leading-relaxed drop-shadow">
              Đừng lo lắng! Chúng tôi sẽ giúp bạn lấy lại quyền truy cập vào tài khoản của bạn một cách nhanh chóng và an toàn.
            </p>
            
            {/* Step Indicators */}
            <div className="mt-8 flex justify-center gap-3">
              <div className={`w-3 h-3 rounded-full transition-all ${step >= 1 ? 'bg-white w-8' : 'bg-white/30'}`}></div>
              <div className={`w-3 h-3 rounded-full transition-all ${step >= 2 ? 'bg-white w-8' : 'bg-white/30'}`}></div>
              <div className={`w-3 h-3 rounded-full transition-all ${step >= 3 ? 'bg-white w-8' : 'bg-white/30'}`}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl mb-4 shadow-lg">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Quên mật khẩu</h2>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            {/* Alert Messages */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            
            {message && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-700">{message}</p>
              </div>
            )}

            {/* Step 1: Email */}
            {step === 1 && (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Nhập email của bạn
                  </h2>
                  <p className="text-gray-500 text-sm">
                    Chúng tôi sẽ gửi mã OTP đến email của bạn để xác thực
                  </p>
                </div>

                <form onSubmit={handleEmailSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Địa chỉ Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        placeholder="example@email.com"
                        className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3.5 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Đang gửi...</span>
                      </>
                    ) : (
                      <>
                        <span>Gửi mã OTP</span>
                        <ArrowRight size={20} />
                      </>
                    )}
                  </button>

                  <Link
                    to="/login"
                    className="flex items-center justify-center gap-2 text-indigo-500 hover:text-indigo-600 font-semibold transition-colors text-sm mt-4"
                  >
                    <ArrowLeft size={18} />
                    <span>Quay lại đăng nhập</span>
                  </Link>
                </form>
              </>
            )}

            {/* Step 2: OTP Verification */}
            {step === 2 && (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Xác thực OTP
                  </h2>
                  <p className="text-gray-500 text-sm">
                    Nhập mã OTP 6 số đã được gửi đến <span className="font-semibold text-gray-700">{email}</span>
                  </p>
                </div>

                <form onSubmit={handleOtpSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Mã OTP
                    </label>
                    <div className="flex gap-2 justify-between">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          id={`otp-${index}`}
                          type="text"
                          maxLength="1"
                          value={digit}
                          onChange={(e) => handleOtpChange(e, index)}
                          onKeyDown={(e) => handleOtpKeyDown(e, index)}
                          className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
                          required
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || otp.some(d => !d)}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3.5 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Đang xác thực...</span>
                      </>
                    ) : (
                      <>
                        <span>Xác nhận OTP</span>
                        <ArrowRight size={20} />
                      </>
                    )}
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={isLoading}
                      className="text-sm text-indigo-500 hover:text-indigo-600 font-semibold transition-colors disabled:opacity-50"
                    >
                      Gửi lại mã OTP
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex items-center justify-center gap-2 text-gray-500 hover:text-gray-700 font-semibold transition-colors text-sm w-full"
                  >
                    <ArrowLeft size={18} />
                    <span>Thay đổi email</span>
                  </button>
                </form>
              </>
            )}

            {/* Step 3: New Password */}
            {step === 3 && (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Tạo mật khẩu mới
                  </h2>
                  <p className="text-gray-500 text-sm">
                    Mật khẩu phải có ít nhất 6 ký tự
                  </p>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Mật khẩu mới
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Nhập mật khẩu mới"
                        className="w-full pl-12 pr-12 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Xác nhận mật khẩu
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Nhập lại mật khẩu mới"
                        className="w-full pl-12 pr-12 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3.5 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Đang xử lý...</span>
                      </>
                    ) : (
                      <>
                        <span>Đặt lại mật khẩu</span>
                        <CheckCircle size={20} />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}

            {/* Step 4: Success */}
            {step === 4 && (
              <div className="text-center py-8">
                <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                  Thành công!
                </h2>
                <p className="text-gray-600 mb-6">
                  Mật khẩu của bạn đã được đặt lại thành công. Bạn sẽ được chuyển đến trang đăng nhập...
                </p>
                <div className="flex justify-center">
                  <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default ForgotPassword;