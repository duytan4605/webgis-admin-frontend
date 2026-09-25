<template>
  <div class="login-wrapper">
    <div class="login-card">
      <div class="login-header">
        <div class="logo-box">🛰️</div>
        <h2>GIS RESEARCH</h2>
        <p>Hệ thống quản lý dữ liệu nghiên cứu khoa học</p>
      </div>

      <div class="login-form">
        <div class="input-group">
          <label><i class="fas fa-envelope"></i> Email đăng nhập</label>
          <div class="input-wrapper">
            <input 
              v-model="email" 
              type="email"
              placeholder="Email của bạn..." 
              @keyup.enter="handleLogin" 
            />
          </div>
        </div>

        <div class="input-group">
          <label><i class="fas fa-lock"></i> Mật mã</label>
          <div class="input-wrapper">
            <input 
              v-model="password" 
              type="password" 
              placeholder="••••••••" 
              @keyup.enter="handleLogin" 
            />
          </div>
        </div>

        <div class="form-options">
          <label class="remember-me">
            <input type="checkbox"> Ghi nhớ đăng nhập
          </label>
          <span class="forgot-pass" @click="showForgotModal = true">Quên mật khẩu?</span>
        </div>
      <div v-if="showSignupModal" class="modal-overlay" @click.self="showSignupModal = false">
  <div class="modal-content signup-modal fade-in">
    <div class="modal-header">
      <h3>📝 ĐĂNG KÝ THÀNH VIÊN GIS</h3>
      <button class="close-x" @click="showSignupModal = false">&times;</button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label>Họ và Tên</label>
        <input v-model="regUser.name" placeholder="Ví dụ: Nguyễn Văn A..." class="form-input" />
      </div>
      <div class="form-group">
        <label>Email học viện</label>
        <input v-model="regUser.email" type="email" placeholder="email@hcmunre.edu.vn" class="form-input" />
      </div>
      <div class="form-group">
        <label>Mật mã khởi tạo</label>
        <input v-model="regUser.password" type="password" placeholder="••••••••" class="form-input" />
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn-cancel" @click="showSignupModal = false">Hủy bỏ</button>
      <button class="btn-submit btn-reg" @click="handleSignup">HOÀN TẤT ĐĂNG KÝ</button>
    </div>
  </div>
</div>
        <button @click="handleLogin" class="btn-login-submit">
          ĐĂNG NHẬP NGAY <i class="fas fa-arrow-right"></i>
        </button>
      <div class="signup-link">
  Chưa có tài khoản nghiên cứu? <span @click="showSignupModal = true">Đăng ký ngay</span>
</div>
        <p v-if="error" class="error-box">
          <i class="fas fa-exclamation-triangle"></i> {{ error }}
        </p>
      </div>
      
      <div class="login-footer">
        <span @click="$router.push('/')">
          <i class="fas fa-chevron-left"></i> Quay lại trang chủ nghiên cứu
        </span>
      </div>
    </div>

    <div v-if="showForgotModal" class="modal-overlay" @click.self="showForgotModal = false">
      <div class="modal-content forgot-modal fade-in">
        <div class="modal-header">
          <h3>🔑 KHÔI PHỤC MẬT KHẨU</h3>
          <button class="close-x" @click="showForgotModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <p>Vui lòng nhập Email đã đăng ký nghiên cứu để hệ thống gửi mã xác minh khôi phục.</p>
          <div class="input-group">
            <label><i class="fas fa-envelope"></i> Email của bạn</label>
            <input v-model="resetEmail" type="email" placeholder="Ví dụ: 1250080265@sv.hcmunre.edu.vn" class="form-input" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showForgotModal = false">Hủy bỏ</button>
          <button class="btn-submit" @click="handleResetPassword">GỬI YÊU CẦU</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'AppLogin', 
  data() {
    return { 
      email: '', 
      password: '', 
      error: '',
      showForgotModal: false,
      showSignupModal: false, // Quản lý ẩn hiện Modal đăng ký
      resetEmail: '',
      // KHAI BÁO regUser Ở ĐÂY ĐỂ FIX LỖI
      regUser: { 
        name: '', 
        email: '', 
        password: '', 
        role: 'USER' 
      }
    }
  },
  methods: {
    handleLogin() {
      this.error = "";
      if (!this.email || !this.password) {
        this.error = "Vui lòng nhập đầy đủ Email và Mật mã!";
        return;
      }

      axios.post('http://localhost:8085/api/users/login', {
        email: this.email,
        password: this.password
      })
      .then(res => {
        const userData = { 
          name: res.data.name, 
          role: res.data.role, 
          email: res.data.email,
          loginTime: new Date().toISOString()
        };
        localStorage.setItem('user', JSON.stringify(userData));
        const target = res.data.role === 'ADMIN' ? '/admin-db' : '/';
        this.$router.push(target).then(() => {
          window.location.reload(); 
        });
      })
      .catch(err => {
        if (err.response && err.response.status === 401) {
          this.error = "Email hoặc mật mã không đúng, check lại đi ông giáo!";
        } else {
          this.error = "Lỗi kết nối Backend (Check cổng 8085 và CORS nhé!)";
        }
      });
    },
    
    handleResetPassword() {
      if (!this.resetEmail || !this.resetEmail.includes('@')) {
        alert("Ông giáo nhập đúng Email học viện giúp tui nhé!");
        return;
      }
      alert(`Hệ thống đã gửi mã xác minh tới: ${this.resetEmail}. Vui lòng kiểm tra hộp thư!`);
      this.showForgotModal = false;
      this.resetEmail = '';
    },

    // HÀM XỬ LÝ ĐĂNG KÝ THÀNH VIÊN MỚI
    handleSignup() {
      if (!this.regUser.name || !this.regUser.email || !this.regUser.password) {
        alert("Vui lòng điền đầy đủ thông tin để tham gia diễn đàn!");
        return;
      }
      
      // Gọi API add user của Spring Boot
      axios.post('http://localhost:8085/api/users/add', this.regUser)
        .then(() => {
          alert("Đăng ký thành công! Chào mừng ông giáo gia nhập cộng đồng GIS.");
          this.showSignupModal = false;
          this.email = this.regUser.email; // Tự động điền email vào ô đăng nhập
          this.regUser = { name: '', email: '', password: '', role: 'USER' };
        })
        .catch(() => alert("Email này đã tồn tại hoặc lỗi hệ thống!"));
    }
  }
}
</script>

<style scoped>
/* Ép phông chữ Inter cho toàn bộ các thành phần */
* {
  font-family: 'Inter', sans-serif !important;
}
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.login-wrapper {
  font-family: 'Inter', sans-serif !important;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f0f2f5;
  padding: 20px;
}

.login-card {
  background: #ffffff;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.05);
  width: 100%;
  max-width: 420px;
  border: 1px solid #e2e8f0;
}

.login-header { text-align: center; margin-bottom: 35px; }
.logo-box { font-size: 50px; margin-bottom: 10px; }
.login-header h2 { color: #1a365d; font-weight: 800; font-size: 24px; margin: 0; letter-spacing: -0.5px; }
.login-header p { color: #64748b; font-size: 14px; margin-top: 8px; font-weight: 500; }

.input-group { margin-bottom: 20px; text-align: left; }
.input-group label { display: block; color: #1a365d; font-size: 13px; font-weight: 700; margin-bottom: 8px; }
.input-group label i { margin-right: 5px; color: #3182ce; }

.input-wrapper input {
  width: 100%; padding: 12px 16px; background: #f8fafc;
  border: 1.5px solid #e2e8f0; border-radius: 10px;
  color: #1e293b; font-size: 15px; box-sizing: border-box;
  transition: 0.3s; outline: none;
}
.input-wrapper input:focus {
  border-color: #3182ce; background: #fff;
  box-shadow: 0 0 0 4px rgba(49, 130, 206, 0.1);
}

.form-options {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 25px; font-size: 13px; color: #64748b; font-weight: 500;
}
.forgot-pass { color: #3182ce; cursor: pointer; font-weight: 600; }

.btn-login-submit {
  width: 100%; background: #1a365d; color: white; border: none;
  padding: 14px; border-radius: 10px; cursor: pointer;
  font-weight: 800; font-size: 14px; transition: 0.3s;
  display: flex; align-items: center; justify-content: center; gap: 10px;
}
.btn-login-submit:hover {
  background: #3182ce; transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(49, 130, 206, 0.2);
}

.error-box {
  color: #b91c1c; font-size: 13px; font-weight: 600; margin-top: 20px;
  background: #fef2f2; padding: 12px; border-radius: 8px;
  border: 1px solid #fee2e2; display: flex; align-items: center; gap: 8px;
}

.login-footer { margin-top: 30px; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 20px; }
.login-footer span { color: #94a3b8; font-size: 13px; cursor: pointer; font-weight: 600; transition: 0.2s; }
.login-footer span:hover { color: #1a365d; }
.login-footer i { margin-right: 5px; font-size: 11px; }

/* CSS MODAL */
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(15, 23, 42, 0.8); display: flex;
  align-items: center; justify-content: center; z-index: 9999;
}
.modal-content {
  background: white; border-radius: 16px; width: 400px; overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}
.modal-header {
  background: #1e293b; color: white; padding: 20px;
  display: flex; justify-content: space-between; align-items: center;
}
.modal-header h3 { font-size: 16px; margin: 0; font-weight: 700; }
.close-x { background: none; border: none; color: white; font-size: 24px; cursor: pointer; }
.modal-body { padding: 25px; }
.modal-body p { font-size: 14px; color: #64748b; line-height: 1.6; margin-bottom: 20px; text-align: left; }
.form-input {
  width: 100%; padding: 12px; border: 1.5px solid #e2e8f0;
  border-radius: 8px; outline: none; margin-top: 5px; box-sizing: border-box;
}
.modal-footer { padding: 15px 25px; background: #f8fafc; display: flex; justify-content: flex-end; gap: 10px; }
.btn-submit { background: #3182ce; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 700; cursor: pointer; }
.btn-cancel { background: #e2e8f0; color: #475569; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; }

.fade-in { animation: fadeIn 0.3s ease; }
@keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
.fas { font-family: "Font Awesome 6 Free" !important; font-weight: 900; }
.signup-link { margin-top: 20px; font-size: 13px; color: #64748b; text-align: center; }
.signup-link span { color: #3b82f6; font-weight: 700; cursor: pointer; text-decoration: underline; }

.signup-modal { width: 450px !important; }
.form-group { margin-bottom: 15px; text-align: left; }
.form-group label { display: block; font-size: 13px; font-weight: 700; color: #1e293b; margin-bottom: 5px; }
.btn-reg { background: #10b981 !important; } /* Nút đăng ký màu xanh lá cho tươi mới */
</style>