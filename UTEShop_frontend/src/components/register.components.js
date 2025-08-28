import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { validateRegisterForm } from "../utils/validate";
import { registerRequestOtp, registerConfirm } from "../services/user.services";

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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const sendOtp = async () => {
    const errs = validateRegisterForm(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      const { fullName, username, email, phone, dob, address, password } = form;
      const payload = { fullName, username, email, phone, dob, address, password };
      await registerRequestOtp(payload);
      setStep("otp");
      setNotice({ type: "info", text: "OTP đã được gửi, vui lòng kiểm tra." });
    } catch (err) {
      setNotice({
        type: "error",
        text: err?.response?.data?.message || "Gửi OTP thất bại.",
      });
    }
  };

  const confirmRegister = async () => {
    if (!/^[0-9]{6}$/.test(form.otp)) {
      setErrors({ otp: "OTP phải gồm 6 chữ số" });
      return;
    }

    try {
      await registerConfirm({ otp: form.otp });
      setNotice({
        type: "success",
        text: "Đăng ký thành công! Bạn có thể đăng nhập.",
      });
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
    } catch (err) {
      setNotice({
        type: "error",
        text: err?.response?.data?.message || "Xác minh OTP thất bại.",
      });
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="rounded-2xl shadow-2xl p-8 bg-white/95">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">
          Đăng ký
        </h2>

        {step === "form" && (
          <>
            <input id="fullName" value={form.fullName} onChange={handleChange} placeholder="Họ và tên" className="w-full mb-1 px-4 py-3 border rounded-lg" />
            {errors.fullName && <p className="text-red-500">{errors.fullName}</p>}
            <input id="username" value={form.username} onChange={handleChange} placeholder="Tên đăng nhập" className="w-full mb-1 px-4 py-3 border rounded-lg" />
            {errors.username && <p className="text-red-500">{errors.username}</p>}
            <input id="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" className="w-full mb-1 px-4 py-3 border rounded-lg" />
            {errors.email && <p className="text-red-500">{errors.email}</p>}
            <input id="phone" value={form.phone} onChange={handleChange} placeholder="Số điện thoại" className="w-full mb-1 px-4 py-3 border rounded-lg" />
            {errors.phone && <p className="text-red-500">{errors.phone}</p>}
            <input id="dob" type="date" value={form.dob} onChange={handleChange} className="w-full mb-1 px-4 py-3 border rounded-lg" />
            {errors.dob && <p className="text-red-500">{errors.dob}</p>}
            <input id="address" value={form.address} onChange={handleChange} placeholder="Địa chỉ" className="w-full mb-3 px-4 py-3 border rounded-lg" />
            <div className="w-full mb-1 relative">
              <input id="password" type={showPassword ? "text" : "password"} value={form.password} onChange={handleChange} placeholder="Mật khẩu" className="w-full px-4 py-3 border rounded-lg pr-10" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-3 flex items-center text-gray-500">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500">{errors.password}</p>}
            <div className="w-full mb-1 relative">
              <input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={form.confirmPassword} onChange={handleChange} placeholder="Xác nhận mật khẩu" className="w-full px-4 py-3 border rounded-lg pr-10" />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-3 flex items-center text-gray-500">
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-red-500">{errors.confirmPassword}</p>}
            <button type="button" onClick={sendOtp} className="w-full py-3 text-white font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 mt-3">Gửi OTP</button>
          </>
        )}

        {step === "otp" && (
          <>
            <input id="otp" value={form.otp} onChange={handleChange} placeholder="Nhập OTP" className="w-full mb-1 px-4 py-3 border rounded-lg" />
            {errors.otp && <p className="text-red-500">{errors.otp}</p>}
            <button type="button" onClick={confirmRegister} className="w-full py-3 text-white font-semibold rounded-lg bg-green-600 hover:bg-green-700 mt-3">Xác minh OTP & Đăng ký</button>
          </>
        )}

        {notice && (
          <div className={`mt-4 p-3 rounded-lg ${
            notice.type === "success"
              ? "bg-green-50 text-green-700"
              : notice.type === "info"
              ? "bg-blue-50 text-blue-700"
              : "bg-red-50 text-red-700"
          }`}>
            {notice.text}
          </div>
        )}
      </div>
    </div>
  );
}

