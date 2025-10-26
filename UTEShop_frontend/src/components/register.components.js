import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, User, Mail, Phone, MapPin, Lock, Calendar, ArrowRight, CheckCircle } from "lucide-react";
import { validateRegisterForm } from "../utils/validate";
import { registerRequestOtp, registerConfirm, checkUsernameAvailable, checkEmailAvailable } from "../services/user.services";

export default function RegisterForm() {
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    dob: "",
    address: "",
    password: "",
    confirmPassword: "",
    otp: "",
  });

  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState(null);
  const [step, setStep] = useState("form");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
    // Clear error khi user bắt đầu sửa
    if (errors[e.target.id]) {
      setErrors({ ...errors, [e.target.id]: null });
    }
  };

  const handleUsernameBlur = async () => {
    const username = form.username?.trim();
    if (!username) return;
    try {
      const { available } = await checkUsernameAvailable(username);
      if (!available) {
        setErrors((prev) => ({ ...prev, username: "Tên đăng nhập đã được sử dụng." }));
      }
    } catch (err) {
      // bỏ qua lỗi mạng cho check này
    }
  };

  const handleEmailBlur = async () => {
    const email = form.email?.trim();
    if (!email) return;
    try {
      const { available } = await checkEmailAvailable(email);
      if (!available) {
        setErrors((prev) => ({ ...prev, email: "Email đã được sử dụng." }));
      }
    } catch (err) {
      // bỏ qua lỗi mạng cho check này
    }
  };

  const sendOtp = async () => {
    const errs = validateRegisterForm(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsLoading(true);
    try {
      const { fullName, username, email, phone, dob, address, password } = form;
      const payload = { fullName, username, email, phone, dob, address, password };
      await registerRequestOtp(payload);
      setStep("otp");
      setNotice({ type: "info", text: "OTP đã được gửi đến email của bạn. Vui lòng kiểm tra." });
    } catch (err) {
      const serverErrors = err?.response?.data?.errors;
      if (serverErrors && typeof serverErrors === "object") {
        setErrors(serverErrors);
      }
      setNotice({
        type: "error",
        text: err?.response?.data?.message || "Gửi OTP thất bại. Vui lòng thử lại.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const confirmRegister = async () => {
    if (!/^[0-9]{6}$/.test(form.otp)) {
      setErrors({ otp: "OTP phải gồm 6 chữ số" });
      return;
    }

    setIsLoading(true);
    try {
      await registerConfirm({ otp: form.otp });
      setNotice({
        type: "success",
        text: "Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.",
      });
      setTimeout(() => {
        setForm({
          fullName: "",
          username: "",
          email: "",
          phone: "",
          dob: "",
          address: "",
          password: "",
          confirmPassword: "",
          otp: "",
        });
        setStep("form");
        setErrors({});
        setNotice(null);
      }, 2000);
    } catch (err) {
      const serverErrors = err?.response?.data?.errors;
      if (serverErrors && typeof serverErrors === "object") {
        setErrors(serverErrors);
      }
      setNotice({
        type: "error",
        text: err?.response?.data?.message || "Xác minh OTP thất bại. Vui lòng thử lại.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex">
      {/* Left Side - Image Background with Overlay */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-green-400 via-teal-500 to-blue-600">
        {/* Animated Background Circles */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        
        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col justify-start items-center w-full p-12 text-white pt-32">
          <div className="max-w-md text-center">
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center shadow-2xl">
                <User className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4 drop-shadow-lg">
              Tham gia cùng chúng tôi! 🎉
            </h1>
            <p className="text-lg text-white/90 leading-relaxed drop-shadow">
              Tạo tài khoản để trải nghiệm những thức uống tuyệt vời và ưu đãi đặc biệt dành riêng cho bạn!
            </p>
            
            {/* Decorative Icons */}
            <div className="mt-8 flex justify-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl animate-bounce">
                ✨
              </div>
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl animate-bounce animation-delay-1000">
                🎁
              </div>
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl animate-bounce animation-delay-2000">
                🌟
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-start justify-center p-8 bg-gray-50 overflow-y-auto pt-2 lg:pt-3">
        <div className="w-full max-w-md my-auto">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-teal-500 rounded-2xl mb-4 shadow-lg">
              <span className="text-3xl">🍹</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">UTE Shop</h2>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            {/* Alert Messages */}
            {notice && (
              <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${
                notice.type === "success"
                  ? "bg-green-50 border border-green-200"
                  : notice.type === "info"
                  ? "bg-blue-50 border border-blue-200"
                  : "bg-red-50 border border-red-200"
              }`}>
                {notice.type === "success" ? (
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                ) : notice.type === "info" ? (
                  <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
                <p className={`text-sm ${
                  notice.type === "success"
                    ? "text-green-700"
                    : notice.type === "info"
                    ? "text-blue-700"
                    : "text-red-700"
                }`}>
                  {notice.text}
                </p>
              </div>
            )}

            {step === "form" && (
              <>
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    Đăng ký tài khoản
                  </h2>
                  <p className="text-gray-500">
                    Điền thông tin để tạo tài khoản mới
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="fullName"
                        type="text"
                        value={form.fullName}
                        onChange={handleChange}
                        placeholder="Nguyễn Văn A"
                        className={`w-full pl-12 pr-4 py-3.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all ${
                          errors.fullName ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                    </div>
                    {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tên đăng nhập <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="username"
                        type="text"
                        value={form.username}
                        onChange={handleChange}
                        onBlur={handleUsernameBlur}
                        placeholder="username123"
                        className={`w-full pl-12 pr-4 py-3.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all ${
                          errors.username ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                    </div>
                    {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        onBlur={handleEmailBlur}
                        placeholder="example@email.com"
                        className={`w-full pl-12 pr-4 py-3.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all ${
                          errors.email ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                    </div>
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="phone"
                        type="tel"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="0123456789"
                        className={`w-full pl-12 pr-4 py-3.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all ${
                          errors.phone ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                    </div>
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Ngày sinh <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="dob"
                        type="date"
                        value={form.dob}
                        onChange={handleChange}
                        className={`w-full pl-12 pr-4 py-3.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all ${
                          errors.dob ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                    </div>
                    {errors.dob && <p className="text-red-500 text-sm mt-1">{errors.dob}</p>}
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Địa chỉ
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="address"
                        type="text"
                        value={form.address}
                        onChange={handleChange}
                        placeholder="123 Đường ABC, Quận XYZ"
                        className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Mật khẩu <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className={`w-full pl-12 pr-12 py-3.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all ${
                          errors.password ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Xác nhận mật khẩu <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={form.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className={`w-full pl-12 pr-12 py-3.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all ${
                          errors.confirmPassword ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="button"
                    onClick={sendOtp}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-3.5 rounded-xl font-semibold hover:from-green-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Đang gửi OTP...</span>
                      </>
                    ) : (
                      <>
                        <span>Gửi mã OTP</span>
                        <ArrowRight size={20} />
                      </>
                    )}
                  </button>

                  {/* Login Link */}
                  <p className="mt-4 text-center text-gray-600">
                    Đã có tài khoản?{" "}
                    <Link
                      to="/login"
                      className="text-teal-500 hover:text-teal-600 font-semibold transition-colors"
                    >
                      Đăng nhập ngay
                    </Link>
                  </p>
                </div>
              </>
            )}

            {step === "otp" && (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Xác thực OTP
                  </h2>
                  <p className="text-gray-500 text-sm">
                    Nhập mã OTP 6 số đã được gửi đến email <span className="font-semibold text-gray-700">{form.email}</span>
                  </p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Mã OTP
                    </label>
                    <input
                      id="otp"
                      type="text"
                      value={form.otp}
                      onChange={handleChange}
                      placeholder="Nhập 6 chữ số"
                      maxLength="6"
                      className={`w-full px-4 py-3.5 border rounded-xl text-center text-lg font-semibold tracking-widest focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all ${
                        errors.otp ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.otp && <p className="text-red-500 text-sm mt-1">{errors.otp}</p>}
                  </div>

                  <button
                    type="button"
                    onClick={confirmRegister}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-3.5 rounded-xl font-semibold hover:from-green-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Đang xác thực...</span>
                      </>
                    ) : (
                      <>
                        <span>Xác nhận & Đăng ký</span>
                        <CheckCircle size={20} />
                      </>
                    )}
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={sendOtp}
                      disabled={isLoading}
                      className="text-sm text-teal-500 hover:text-teal-600 font-semibold transition-colors disabled:opacity-50"
                    >
                      Gửi lại mã OTP
                    </button>
                  </div>

                  <p className="mt-4 text-center text-gray-600">
                    Đã có tài khoản?{" "}
                    <Link
                      to="/login"
                      className="text-teal-500 hover:text-teal-600 font-semibold transition-colors"
                    >
                      Đăng nhập ngay
                    </Link>
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Footer Text */}
          <p className="mt-6 text-center text-sm text-gray-500">
            Bằng cách đăng ký, bạn đồng ý với{" "}
            <a href="#" className="text-teal-500 hover:underline">
              Điều khoản dịch vụ
            </a>{" "}
            và{" "}
            <a href="#" className="text-teal-500 hover:underline">
              Chính sách bảo mật
            </a>
          </p>
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
        .animation-delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}