export const validateRegisterForm = (form) => {
  const errors = {};
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const dobRegex = /^\d{4}-\d{2}-\d{2}$/; // yyyy-mm-dd

  // fullName
  if (!form.fullName || !form.fullName.trim()) {
    errors.fullName = "Vui lòng nhập họ và tên";
  }

  // username
  if (!form.username || !form.username.trim()) {
    errors.username = "Vui lòng nhập tên đăng nhập";
  }

  // email
  if (!form.email) {
    errors.email = "Vui lòng nhập email";
  } else if (!emailRegex.test(form.email)) {
    errors.email = "Email không hợp lệ";
  }

  // phone
  if (!form.phone) {
    errors.phone = "Vui lòng nhập số điện thoại";
  } else if (!/^[0-9]{10,11}$/.test(form.phone)) {
    errors.phone = "Số điện thoại không hợp lệ";
  }

  // dob (yyyy-mm-dd, required by backend as DATEONLY)
  if (!form.dob) {
    errors.dob = "Vui lòng nhập ngày sinh (yyyy-mm-dd)";
  } else if (!dobRegex.test(form.dob)) {
    errors.dob = "Ngày sinh phải theo định dạng yyyy-mm-dd";
  }

  // password
  if (!form.password) {
    errors.password = "Vui lòng nhập mật khẩu";
  } else if (form.password.length < 8) {
    errors.password = "Mật khẩu phải ít nhất 8 ký tự";
  }

  // confirmPassword
  if (!form.confirmPassword) {
    errors.confirmPassword = "Vui lòng nhập lại mật khẩu";
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = "Mật khẩu không khớp";
  }

  return errors;
};
