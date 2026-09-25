<template>
  <div class="gis-blog-wrapper">
    <header class="main-header">
      <div class="container nav-box">
        <div class="brand" @click="refreshPage">
          <span class="logo">🛰️</span>
          <div class="brand-name">
            <h1>GIS RESEARCH</h1>
            <p>FORUM MANAGEMENT SYSTEM</p>
          </div>
        </div>

        <div class="search-wrapper">
          <input 
            v-model="searchQuery" 
            @keyup.enter="fetchData(0)" 
            placeholder="Tìm kiếm bài viết, tọa độ, bản đồ..." 
          />
          <button @click="fetchData(0)">🔍</button>
        </div>

        <div class="auth-box">
         <div v-if="user" class="profile">
            <div class="info" @click="openProfileModal" style="cursor: pointer; padding: 5px 10px; border-radius: 8px; transition: 0.2s;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='transparent'">
              <span class="name">{{ user.name }} <i class="fas fa-user-cog" style="color: #64748b; margin-left: 5px;"></i></span>
              
              <span class="role">
                {{ user.role }} 
                <span v-if="user.tier === 'VIP'" style="color: #f59e0b;">| VIP 👑</span>
              </span>
            </div>
            <button class="btn-logout" @click="logout">Logout</button>
          </div>
<button v-else class="btn-login" @click="$router.push('/login')">
  <i class="fas fa-sign-in-alt"></i> Đăng nhập
</button>        </div>
      </div>
    </header>

    <section class="container top-banner-section">
      <div class="hero-slideshow">
        <transition name="fade" mode="out-in">
          <img 
            :key="currentSlide" 
            :src="sidebarImages[currentSlide]" 
            class="hero-slide" 
            alt="GIS Highlight"
          />
        </transition>
        
        <div class="hero-overlay">
          <div class="hero-text">
            <span class="badge">NỔI BẬT 2026</span>
            <h2>Hệ thống quản lý dữ liệu nghiên cứu GIS </h2>
            <p>Khám phá kho bản đồ chuyên đề và các phân tích viễn thám mới nhất phục vụ quản lý tài nguyên.</p>
          </div>
        </div>

        <div class="slide-dots">
          <span 
            v-for="(img, idx) in sidebarImages" :key="idx" 
            :class="['dot', { active: currentSlide === idx }]"
            @click="currentSlide = idx"
          ></span>
        </div>
      </div>
    </section>

    <div class="container main-layout">
      
      <main class="feed-section">
        <div class="feed-title">
          <h2>📰 Bảng tin nghiên cứu mới nhất</h2>
        </div>

        <div v-if="posts.length === 0" class="empty-state">
          Đang tải dữ liệu nghiên cứu...
        </div>

        <div v-else class="post-list">
          <div v-for="p in posts" :key="p.id" class="post-item" @click="viewDetail(p.id)">
            <div class="post-image">
              <img :src="p.imageUrl || '/img/Thumbnail.jpg'" alt="GIS Product" />
            </div>
            <div class="post-body">
              <div class="post-meta-top">
                <span class="cat-tag"># {{ p.category?.name || 'GIS chuyên đề' }}</span>
                <span class="post-id">ID: {{ p.id }}</span>
              </div>
              <h3 class="post-title">{{ p.title }}</h3>
              <p class="post-desc">{{ p.content?.substring(0, 180) }}...</p>
              
              <div class="post-meta-bottom">
                <span class="coord">📍 Tọa độ: {{ p.lat?.toFixed(3) }}, {{ p.lng?.toFixed(3) }}</span>
                <div v-if="user" class="post-actions">
    <button @click.stop="openEditModal(p)" class="btn-mini btn-edit" title="Chỉnh sửa">
      <i class="fas fa-pen-to-square"></i> Sửa
    </button>
    <button @click.stop="deletePost(p.id)" class="btn-mini btn-delete" title="Xóa bài">
      <i class="fas fa-trash-can"></i> Xóa
    </button>
  </div>
</div>
            </div>
          </div>
        </div>

        <div class="pagination-bar" v-if="totalPages > 1">
          <button :disabled="currentPage === 0" @click="fetchData(currentPage - 1)">« Trước</button>
          <button 
            v-for="i in totalPages" :key="i" 
            :class="{ active: currentPage === i - 1 }"
            @click="fetchData(i - 1)"
          >
            {{ i }}
          </button>
          <button :disabled="currentPage === totalPages - 1" @click="fetchData(currentPage + 1)">Sau »</button>
        </div>
      </main>

      <aside class="sidebar-section">
        <div class="widget">
          <h3 class="widget-title">CHUYÊN MỤC NGHIÊN CỨU</h3>
          <ul class="cat-nav">
            <li v-for="cat in categories" :key="cat.id">
              <a href="#" @click.prevent="filterByCategory(cat.id)">📂 {{ cat.name }}</a>
            </li>
            <li class="all-posts active">
              <a href="#" @click.prevent="fetchData(0)">📦 Tất cả bài viết</a>
            </li>
          </ul>
        </div>

       <div class="widget stats-widget">
  <h3 class="widget-title">THỐNG KÊ HỆ THỐNG</h3>
  <div class="stat-content">
    <div class="stat-item">
      <div class="stat-icon posts"><i class="fas fa-copy"></i></div>
      <div class="stat-info">
        <span class="label">Tổng bài viết</span>
        <span class="value">{{ totalPosts }}</span>
      </div>
    </div>
    
    <div class="stat-item">
      <div class="stat-icon status"><i class="fas fa-signal"></i></div>
      <div class="stat-info">
        <span class="label">Trạng thái</span>
        <span class="status-badge">
          <span class="pulse-dot"></span> HĐ BÌNH THƯỜNG
        </span>
      </div>
    </div>
  </div>
</div>
<AdsBanner />
<div v-if="user" class="admin-action-panel">
          <button v-if="user.tier !== 'VIP'" class="btn-action btn-vip" @click="showVipModal = true">
            <i class="fas fa-crown"></i> NÂNG CẤP VIP (50K/THÁNG)
          </button>
  <button class="btn-action btn-write" @click="openCreateModal">
    <i class="fas fa-plus-circle"></i> VIẾT BÀI MỚI
  </button>
  <button v-if="user.role === 'ADMIN'" class="btn-action btn-db" @click="$router.push('/admin-db')">
    <i class="fas fa-database"></i> QUẢN TRỊ CSDL
  </button>
</div>
      </aside>
    </div>
   
      <footer class="site-footer">
      <div class="container footer-grid">
        <div class="footer-info">
          <h3>GIS RESEARCH</h3>
          <p>Hệ thống chia sẻ và quản lý sản phẩm bản đồ chuyên đề nghiên cứu khoa học.</p>
        </div>
        
        <div class="footer-links">
          <h4>TÀI NGUYÊN HỆ THỐNG</h4>
          <a href="#" @click.prevent="goToTopAndFetch">
  <i class="fas fa-newspaper"></i> Bảng tin nghiên cứu
</a>
          <a href="#" @click.prevent="$router.push('/map')">
            <i class="fas fa-map-marked-alt"></i> Bản đồ WebGIS
          </a> 
          <a href="https://hcmunre.edu.vn" target="_blank">
            <i class="fas fa-university"></i> Cổng thông tin HCMUNRE
          </a>
        </div>
        
        <div class="footer-links">
          <h4>CÔNG CỤ & DỮ LIỆU</h4>
          <a href="https://earthengine.google.com/" target="_blank">
            <i class="fas fa-globe-americas"></i> Google Earth Engine
          </a> 
          <a href="https://qgis.org/en/site/forusers/download.html" target="_blank">
            <i class="fas fa-download"></i> Tải phần mềm QGIS
          </a>
          <a href="https://data.gov.vn/" target="_blank">
            <i class="fas fa-database"></i> Cổng Dữ liệu Quốc gia
          </a>
        </div>
        
       <div class="footer-social">
          <h4>LIÊN KẾT CỘNG ĐỒNG</h4>
          <div class="social-wrapper">
            <a href="https://www.facebook.com/groups/vngis" target="_blank" class="social-btn fb" title="Facebook Cộng đồng GIS">
              <i class="fab fa-facebook-f"></i>
            </a>
            <a href="https://www.youtube.com/@hocgiscungmee" target="_blank" class="social-btn yt" title="Youtube Học GIS">
              <i class="fab fa-youtube"></i>
            </a>
          </div>
          <p class="copyright-text">© 2026 GIS Forum Management System.</p>
        </div>
      </div>
    </footer>

   <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
  <div class="modal-content admin-modal">
    <div class="modal-header">
      <h3><i class="fas fa-edit"></i> {{ isEditing ? 'Cập nhật nghiên cứu' : 'Soạn thảo nghiên cứu mới' }}</h3>
      <button class="close-x" @click="showModal = false">&times;</button>
    </div>
    
    <div class="modal-body">
      <div class="form-section">
        <label><i class="fas fa-heading"></i> Tiêu đề bài phân tích</label>
        <input v-model="newPost.title" placeholder="Nhập tiêu đề (Ví dụ: Phân tích cháy rừng Ninh Sơn 2025)..." />
      </div>

      <div class="form-grid">
        <div class="form-section">
          <label><i class="fas fa-image"></i> Đường dẫn ảnh bản đồ</label>
          <input v-model="newPost.imageUrl" placeholder="/img/ten-anh.jpg" />
        </div>
        <div class="form-section">
          <label><i class="fas fa-layer-group"></i> Chuyên mục</label>
          <select v-model="newPost.categoryId">
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
        </div>
      </div>

      <div class="form-section">
        <label><i class="fas fa-file-alt"></i> Nội dung phân tích chuyên sâu (Markdown supported)</label>
        <textarea v-model="newPost.content" placeholder="Nhập nội dung báo cáo khoa học ..."></textarea>
      </div>

      <div class="spatial-group">
  <p class="group-label"><i class="fas fa-search-location"></i> Tìm & Xác định vị trí</p>
  
  <div class="location-search-box">
    <input v-model="locationSearch" @keyup.enter="searchLocation" placeholder="Gõ địa danh (VD: Ninh Thuận)..." />
    <button @click="searchLocation">Tìm</button>
  </div>

  <div id="modal-map" style="width: 100%; height: 250px; border-radius: 8px; margin-top: 10px;"></div>

  <div class="coords-modern-wrapper">
  <div class="coord-field">
    <div class="field-icon"><i class="fas fa-arrows-alt-v"></i></div>
    <div class="field-content">
      <span>Vĩ độ (Latitude)</span>
      <input :value="newPost.lat?.toFixed(6)" readonly />
    </div>
  </div>
  
  <div class="coord-field">
    <div class="field-icon"><i class="fas fa-arrows-alt-h"></i></div>
    <div class="field-content">
      <span>Kinh độ (Longitude)</span>
      <input :value="newPost.lng?.toFixed(6)" readonly />
    </div>
  </div>
</div>
    </div>
    </div>

    <div class="modal-footer">
      <button class="btn-cancel" @click="showModal = false">Hủy thao tác</button>
      <button class="btn-submit" @click="savePost">
        <i class="fas fa-save"></i> XUẤT BẢN BÀI VIẾT
      </button>
    </div>
  </div>
</div>
  </div>
  <div v-if="showVipModal" class="modal-overlay" @click.self="showVipModal = false">
      <div class="modal-content payment-modal">
        <div class="payment-header">
          <h3><i class="fas fa-qrcode"></i> Thanh toán Momo / VNPay</h3>
          <button class="close-x" @click="showVipModal = false">&times;</button>
        </div>
        
        <div v-if="isProcessingPayment" class="processing-box">
          <i class="fas fa-spinner fa-spin spinner-icon"></i>
          <h3>Đang xác nhận giao dịch...</h3>
          <p>Vui lòng không đóng cửa sổ này</p>
        </div>

        <div v-else class="payment-body">
          <div class="qr-box">
            <img src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg" alt="QR Code" class="qr-image" />
          </div>
          <div class="payment-info">
            <p>Số tiền: <strong>50.000 VNĐ</strong></p>
            <p>Nội dung CK: <strong class="transfer-code">UPVIP {{ user.id }}</strong></p>
            <p class="note-text">Hệ thống sẽ tự động nâng cấp tài khoản sau khi nhận được tiền (Test demo thì cứ bấm nút bên dưới).</p>
          </div>
          <button class="btn-confirm-pay" @click="simulatePayment">
            TÔI ĐÃ CHUYỂN KHOẢN XONG
          </button>
        </div>
      </div>
    </div>
    <div v-if="showProfileModal" class="modal-overlay" @click.self="showProfileModal = false">
      <div class="modal-content" style="width: 450px;">
        <div class="modal-header">
          <h3><i class="fas fa-user-shield"></i> Quản lý Tài khoản</h3>
          <button class="close-x" @click="showProfileModal = false">&times;</button>
        </div>
        
        <div class="modal-body">
          <div class="form-section">
            <label>Họ và Tên hiển thị</label>
            <input v-model="profileData.name" placeholder="Nhập tên mới..." />
          </div>
          
          <div class="form-section">
            <label>Mật khẩu mới (Bỏ trống nếu không đổi)</label>
            <input v-model="profileData.password" type="password" placeholder="••••••••" />
          </div>

          <div v-if="user.tier === 'VIP'" class="spatial-group" style="background: #fffbeb; border-color: #fde68a;">
            <p class="group-label" style="color: #b45309;"><i class="fas fa-crown"></i> GÓI CƯỚC HIỆN TẠI</p>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: 700; color: #d97706;">Gói VIP (Premium)</span>
              <button @click="cancelVip" style="background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 12px; transition: 0.2s;">Hủy gói VIP</button>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" @click="showProfileModal = false">Đóng</button>
          <button class="btn-submit" @click="updateProfile"><i class="fas fa-save"></i> LƯU THAY ĐỔI</button>
        </div>
      </div>
    </div>
</template>

<script>
import AdsBanner from './AdsBanner.vue';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Sửa lỗi tàng hình Icon của Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});
export default {
  components: {
    AdsBanner
  },
  data() {
    return {
      posts: [],
      categories: [],
      showModal: false,
      isEditing: false,
      searchQuery: '',
      user: JSON.parse(localStorage.getItem('user')),
      newPost: { title: '', content: '', imageUrl: '', lat: 11.5, lng: 108.9, categoryId: null },
      showVipModal: false,
      isProcessingPayment: false,
      showProfileModal: false,
      profileData: { id: null, name: '', password: '', email: '', role: '', tier: '' },
      currentPage: 0,
      totalPages: 0,
      pageSize: 3,
      totalPosts: 0,
      currentSlide: 0,
      sidebarImages: ['/img/Thumbnail.jpg', '/img/Thumbnail2.jpg', '/img/Thumbnail3.jpg'],
      slideInterval: null
    }
  },
  mounted() {
    this.fetchData(0);
    this.fetchCategories();
    this.startSlideshow();
  if (this.user) {
      axios.get('http://localhost:8085/api/users').then(res => {
        const freshUser = res.data.find(u => u.email === this.user.email);
        if (freshUser) {
          this.user.tier = freshUser.tier || 'FREE';
          this.user.role = freshUser.role;
          this.user.name = freshUser.name;
          // Cập nhật lại bộ nhớ trình duyệt cho khớp với Admin
          localStorage.setItem('user', JSON.stringify(this.user));
        }
      });
    }
  },
  
  beforeUnmount() {
    if (this.slideInterval) clearInterval(this.slideInterval);
  },
  methods: {
    openProfileModal() {
      // 1. Gọi API mò ID chuẩn từ CSDL dựa theo Email đang đăng nhập
      axios.get('http://localhost:8085/api/users')
        .then(res => {
          const realUser = res.data.find(u => u.email === this.user.email);
          
          if (realUser) {
            // 2. Có ID rồi thì mới đổ dữ liệu vào Form
            this.profileData = {
              id: realUser.id,           // Đã fix: Lấy ID chuẩn 100% từ Database
              name: realUser.name,
              email: realUser.email, 
              role: realUser.role,   
              tier: realUser.tier || 'FREE',
              password: '' // Cố tình để rỗng không lộ pass cũ
            };
            this.showProfileModal = true;
          } else {
            alert("⚠️ Dữ liệu trình duyệt bị cũ. Vui lòng Đăng xuất và Đăng nhập lại!");
          }
        })
        .catch(() => alert("❌ Không thể kết nối với máy chủ!"));
    },

    cancelVip() {
      if(confirm("Bạn có chắc chắn muốn hủy gói VIP và trở về thành viên miễn phí?")) {
        this.profileData.tier = 'FREE';
        this.updateProfile();
      }
    },

    updateProfile() {
      // Gọi API cập nhật xuống Spring Boot
      axios.put(`http://localhost:8085/api/users/${this.profileData.id}`, this.profileData)
        .then(res => {
          alert("🎉 Đã cập nhật thông tin tài khoản thành công!");
          
          // Cập nhật lại giao diện và LocalStorage
          this.user.name = res.data.name;
          this.user.tier = res.data.tier;
          localStorage.setItem('user', JSON.stringify(this.user));
          
          this.showProfileModal = false;
        })
        .catch(() => alert("❌ Có lỗi xảy ra khi cập nhật tài khoản!"));
    },
   simulatePayment() {
      this.isProcessingPayment = true;
      
      // Giả bộ chờ 2 giây cho giống thật
      setTimeout(() => {
        // BƯỚC 1: Gọi API lấy danh sách user về để mò ra cái ID chuẩn xác bằng email
        axios.get('http://localhost:8085/api/users')
          .then(res => {
            // Tìm user trong CSDL có email trùng với email đang đăng nhập
            const realUser = res.data.find(u => u.email === this.user.email);
            
            if (!realUser || !realUser.id) {
               alert("Không tìm thấy thông tin tài khoản hợp lệ trong CSDL!");
               this.isProcessingPayment = false;
               return;
            }

            // BƯỚC 2: Gọi API nâng cấp VIP với ID CHUẨN XÁC vừa tìm được
            axios.put(`http://localhost:8085/api/users/${realUser.id}/upgrade-vip`)
              .then(() => {
                // Cập nhật lại giao diện và vá luôn cái lỗi mất ID
                this.user.tier = 'VIP';
                this.user.id = realUser.id; 
                localStorage.setItem('user', JSON.stringify(this.user)); 
                
                this.isProcessingPayment = false;
                this.showVipModal = false;
                alert("🎉 THANH TOÁN THÀNH CÔNG! Chào mừng đại gia đến với GIS VIP!");
              })
              .catch(() => {
                this.isProcessingPayment = false;
                alert("Lỗi kết nối máy chủ thanh toán!");
              });
          })
          .catch(() => {
             this.isProcessingPayment = false;
             alert("Lỗi truy xuất dữ liệu từ Database!");
          });
      }, 2000);
    },
    // THÊM HÀM NÀY VÀO TRONG METHODS
    goToTopAndFetch() {
      this.fetchData(0);
      // Đưa window xuống dưới script thì Vue nó mới hiểu được
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    startSlideshow() {
      this.slideInterval = setInterval(() => {
        this.currentSlide = (this.currentSlide + 1) % this.sidebarImages.length;
      }, 4000);
    },
    fetchData(page = 0) {
      axios.get(`http://localhost:8085/api/posts?page=${page}&size=${this.pageSize}&search=${this.searchQuery}`)
        .then(res => {
          if (res.data.content) {
            this.posts = res.data.content;
            this.totalPages = res.data.totalPages;
            this.currentPage = res.data.number;
            this.totalPosts = res.data.totalElements;
          } else {
            this.posts = res.data;
            this.totalPosts = res.data.length;
          }
        });
    },
    fetchCategories() {
      axios.get(`http://localhost:8085/api/categories`).then(res => { this.categories = res.data; });
    },
    filterByCategory(catId) {
      axios.get(`http://localhost:8085/api/posts/category/${catId}`).then(res => {
        this.posts = res.data;
        this.totalPages = 0;
      });
    },
    openCreateModal() {
      this.isEditing = false;
      this.newPost = { title: '', content: '', imageUrl: '', lat: 11.5, lng: 108.9 };
      this.showModal = true;
      this.$nextTick(() => { this.initModalMap(); });
    },
    openEditModal(p) {
      this.isEditing = true;
      this.newPost = { ...p };
      this.showModal = true;
    },
    initModalMap() {
  // Reset bản đồ cũ nếu có để tránh lỗi "Map already initialized"
  if (this.modalMap) { this.modalMap.remove(); }
  
  this.modalMap = L.map('modal-map').setView([this.newPost.lat, this.newPost.lng], 13);
  L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
    subdomains:['mt0','mt1','mt2','mt3'], maxZoom: 20
  }).addTo(this.modalMap);

  this.modalMarker = L.marker([this.newPost.lat, this.newPost.lng]).addTo(this.modalMap);

  // Bắt sự kiện click để lấy tọa độ
  this.modalMap.on('click', (e) => {
    this.newPost.lat = e.latlng.lat;
    this.newPost.lng = e.latlng.lng;
    this.modalMarker.setLatLng(e.latlng);
  });
  setTimeout(() => { this.modalMap.invalidateSize(); }, 400);
},

searchLocation() {
  if(!this.locationSearch) return;
  axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${this.locationSearch}`)
    .then(res => {
      if(res.data.length > 0) {
        const { lat, lon } = res.data[0];
        this.newPost.lat = parseFloat(lat);
        this.newPost.lng = parseFloat(lon);
        this.modalMap.setView([lat, lon], 15);
        this.modalMarker.setLatLng([lat, lon]);
      }
    });
},
    savePost() {
      const api = this.isEditing ? axios.put : axios.post;
      const url = `http://localhost:8085/api/posts${this.isEditing ? '/' + this.newPost.id : ''}`;
      api(url, this.newPost).then(() => {
        this.showModal = false;
        this.fetchData(this.currentPage);
      });
    },
    deletePost(id) {
      if(confirm("Xóa bài viết này?")) {
        axios.delete(`http://localhost:8085/api/posts/${id}`).then(() => this.fetchData(this.currentPage));
      }
    },
    viewDetail(id) { this.$router.push(`/post/${id}`); },
    refreshPage() { window.location.reload(); },
    logout() { localStorage.removeItem('user'); window.location.reload(); }
  }
}
</script>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.gis-blog-wrapper { background: #f0f2f5; min-height: 100vh; font-family: 'Inter', sans-serif; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }

/* HEADER */
.main-header { background: #ffffff; border-bottom: 1px solid #ddd; padding: 12px 0; position: sticky; top: 0; z-index: 1000; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
.nav-box { display: flex; align-items: center; justify-content: space-between; }
.brand { display: flex; align-items: center; gap: 15px; cursor: pointer; }
.logo { font-size: 35px; }
.brand-name h1 { font-size: 20px; font-weight: 800; color: #1a365d; margin: 0; }
.brand-name p { font-size: 10px; color: #3182ce; font-weight: 700; letter-spacing: 1px; margin: 0; }

.search-wrapper { position: relative; display: flex; align-items: center; }
.search-wrapper input { width: 380px; padding: 10px 20px; border-radius: 25px; border: 1px solid #ddd; background: #f0f2f5; outline: none; }
.search-wrapper button { position: absolute; right: 10px; background: none; border: none; cursor: pointer; }


/* HERO BANNER - ĐÃ CĂN GIỮA VÀ LÀM BỰ */
.top-banner-section { margin-top: 25px; }
.hero-slideshow { position: relative; width: 100%; height: 380px; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); background: #000; }
.hero-slide { width: 100%; height: 100%; object-fit: cover; position: absolute; }
.hero-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(to right, rgba(0,0,0,0.7), transparent); display: flex; align-items: center; padding: 0 60px; }
.hero-text { color: white; max-width: 550px; }
.hero-text h2 { font-size: 34px; font-weight: 800; margin: 15px 0; line-height: 1.2; }
.hero-text p { font-size: 16px; opacity: 0.9; margin-bottom: 25px; }
.badge { background: #3182ce; padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; }
.btn-explore { background: #fff; color: #1a365d; border: none; padding: 12px 25px; border-radius: 8px; font-weight: 700; cursor: pointer; }

/* LAYOUT & FEED */
.main-layout { display: grid; grid-template-columns: 1fr 300px; gap: 30px; margin-top: 30px; }
.post-item { background: #fff; border-radius: 12px; margin-bottom: 20px; display: flex; overflow: hidden; cursor: pointer; transition: 0.3s; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.post-item:hover { transform: translateY(-3px); box-shadow: 0 8px 15px rgba(0,0,0,0.1); }
.post-image { width: 240px; flex-shrink: 0; }
.post-image img { width: 100%; height: 100%; object-fit: cover; }
.post-body { padding: 22px; flex-grow: 1; }
.cat-tag { background: #e1effe; color: #1e429f; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; }
.post-title { font-size: 19px; font-weight: 700; margin: 12px 0; color: #111827; }
.post-desc { font-size: 14.5px; color: #4b5563; line-height: 1.6; text-align: justify; }

/* SIDEBAR & OTHERS */
.widget { background: #fff; border-radius: 12px; padding: 20px; margin-bottom: 25px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.widget-title { font-size: 12px; font-weight: 800; color: #9ca3af; margin-bottom: 15px; border-bottom: 2px solid #f3f4f6; padding-bottom: 8px; }
.cat-nav li { margin-bottom: 10px; border-bottom: 1px dashed #eee; padding-bottom: 8px; list-style: none; }
.cat-nav a { text-decoration: none; color: #4b5563; font-size: 14px; font-weight: 600; }
.stat-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
.on { color: #059669; }

/* SLIDE DOTS */
.slide-dots { position: absolute; bottom: 20px; width: 100%; display: flex; justify-content: center; gap: 8px; }
.dot { width: 8px; height: 8px; background: rgba(255,255,255,0.4); border-radius: 50%; cursor: pointer; }
.dot.active { background: #3182ce; width: 22px; border-radius: 4px; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.8s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* FOOTER */
.site-footer { background: #1a202c; color: #9ca3af; padding: 60px 0 40px 0; margin-top: 60px; }
.footer-grid { display: grid; grid-template-columns: 1.5fr 1fr 1fr 1.5fr; gap: 40px; }
.footer-info h3 { color: #fff; margin-bottom: 20px; }
.footer-links h4 { color: #fff; margin-bottom: 15px; font-size: 14px; }
.footer-links a { display: block; color: #9ca3af; text-decoration: none; margin-bottom: 10px; font-size: 13px; }
.footer-links a:hover { color: #fff; }
.footer-social h4 { color: #fff; margin-bottom: 15px; }

.pagination-bar { display: flex; justify-content: center; gap: 8px; margin: 40px 0; }
.pagination-bar button { padding: 8px 16px; border: 1px solid #ddd; background: #fff; border-radius: 8px; cursor: pointer; font-weight: 600; }
.pagination-bar button.active { background: #3182ce; color: #fff; border-color: #3182ce; }
/* Layout cho các nút mạng xã hội */
.social-wrapper {
  display: flex;
  gap: 15px; /* Khoảng cách giữa 2 nút */
  margin: 15px 0;
}

.social-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%; /* Làm nút hình tròn */
  color: white !important; /* Chữ/Icon luôn trắng */
  text-decoration: none;
  font-size: 20px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0,0,0,0.2);
}

/* Màu Facebook chuẩn */
.social-btn.fb { background-color: #1877f2; }

/* Màu Youtube chuẩn */
.social-btn.yt { background-color: #ff0000; }

/* Hiệu ứng hover cho sang chảnh */
.social-btn:hover {
  transform: translateY(-3px) scale(1.1);
  filter: brightness(1.2);
}

.copyright-text {
  font-size: 12px;
  color: #a0aec0;
  margin-top: 20px;
  border-top: 1px solid #2d3748;
  padding-top: 15px;
}

/* CSS CHO MODAL - ĐẢM BẢO HIỆN KHUNG */
.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  background: rgba(0, 0, 0, 0.7); /* Làm nền tối đi */
  display: flex;
  align-items: center; justify-content: center;
  z-index: 9999; /* Đảm bảo nằm trên cùng */
}

.modal-content {
  background: white;
  width: 600px;
  max-width: 90%;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
  animation: slideUp 0.3s ease; /* Hiệu ứng bay lên cho xịn */
}

@keyframes slideUp {
  from { transform: translateY(50px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.form-body .input-group { margin-bottom: 15px; text-align: left; }
.form-body label { display: block; font-weight: 700; font-size: 13px; margin-bottom: 5px; color: #4a5568; }
.form-body input, .form-body textarea {
  width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; outline: none;
}
.form-body textarea { height: 150px; resize: none; }
.coords-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }

.btn-save { background: #3182ce; color: white; border: none; padding: 12px 25px; border-radius: 8px; font-weight: 700; cursor: pointer; }
.btn-cancel { background: #edf2f7; color: #4a5568; border: none; padding: 12px 25px; border-radius: 8px; margin-right: 10px; cursor: pointer; }

.profile { display: flex; align-items: center; gap: 15px; }
.info { display: flex; flex-direction: column; text-align: right; margin-right: 10px; }
.name { font-weight: 700; color: #2d3748; font-size: 14px; }
.role { 
  font-size: 10px; 
  font-weight: 800; 
  color: #3182ce; 
  text-transform: uppercase; 
  letter-spacing: 1px;
}
.btn-logout {
  background: #fff; border: 1px solid #e2e8f0; padding: 6px 15px; border-radius: 6px; 
  font-size: 12px; font-weight: 600; cursor: pointer; transition: 0.2s;
}
.btn-logout:hover { background: #fee2e2; color: #991b1b; }

/* TỔNG THỂ MODAL */
.admin-modal {
  width: 750px !important; /* Làm bự ra cho dễ viết bài dài */
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.modal-header {
  background: #1a365d; /* Màu xanh Navy đậm chất GIS */
  color: white;
  padding: 20px 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 { font-size: 1.2rem; margin: 0; font-weight: 700; }
.close-x { background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer; }

.modal-body { padding: 25px; max-height: 70vh; overflow-y: auto; }

/* STYLE CHO CÁC Ô NHẬP LIỆU */
.form-section { margin-bottom: 20px; }
.form-section label { display: block; font-weight: 700; font-size: 13px; color: #4a5568; margin-bottom: 8px; }
.form-section input, .form-section select, .form-section textarea {
  width: 100%; padding: 12px; border: 1.5px solid #e2e8f0; border-radius: 8px;
  font-size: 14px; transition: 0.2s; outline: none;
}
.form-section input:focus { border-color: #3182ce; box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1); }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }

/* NHÓM TỌA ĐỘ */
.spatial-group { background: #f7fafc; padding: 15px; border-radius: 10px; border: 1px solid #edf2f7; }
.group-label { font-weight: 800; font-size: 12px; color: #718096; margin-bottom: 12px; text-transform: uppercase; }
.coords-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.input-with-label span { font-size: 11px; color: #a0aec0; display: block; margin-bottom: 4px; }

/* NÚT BẤM */
.modal-footer { padding: 20px 25px; background: #f8fafc; display: flex; justify-content: flex-end; gap: 12px; }
.btn-submit { background: #3182ce; color: white; border: none; padding: 12px 25px; border-radius: 8px; font-weight: 800; cursor: pointer; }
.btn-submit:hover { background: #2b6cb0; }
.btn-cancel { background: #e2e8f0; color: #4a5568; border: none; padding: 12px 25px; border-radius: 8px; font-weight: 600; cursor: pointer; }

/* TỔNG THỂ WIDGET THỐNG KÊ */
.stats-widget {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-top: 15px;
  padding: 10px;
  background: #f8fafc;
  border-radius: 10px;
}

.stat-icon {
  width: 40px; height: 40px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 8px;
  font-size: 18px;
}
.stat-icon.posts { background: #e0f2fe; color: #0369a1; }
.stat-icon.status { background: #f0fdf4; color: #15803d; }

.stat-info .label { display: block; font-size: 12px; color: #64748b; font-weight: 600; }
.stat-info .value { font-size: 16px; font-weight: 800; color: #1e293b; }

/* HIỆU ỨNG NHẤP NHÁY TRẠNG THÁI */
.status-badge {
  display: flex; align-items: center; gap: 6px;
  color: #15803d; font-weight: 700; font-size: 13px;
}
.pulse-dot {
  width: 8px; height: 8px;
  background: #22c55e; border-radius: 50%;
  box-shadow: 0 0 0 rgba(34, 197, 94, 0.4);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
  100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
}

/* THIẾT KẾ LẠI NÚT BẤM */
.admin-action-panel {
  display: flex; flex-direction: column; gap: 12px;
  margin-top: 20px;
}

.btn-action {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 10px;
  font-weight: 800;
  font-size: 14px;
  display: flex; align-items: center; justify-content: center; gap: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.btn-write { background: #3182ce; color: white; }
.btn-write:hover { background: #2b6cb0; transform: translateY(-2px); box-shadow: 0 6px 15px rgba(49, 130, 206, 0.3); }

.btn-db { background: #1e293b; color: white; }
.btn-db:hover { background: #0f172a; transform: translateY(-2px); box-shadow: 0 6px 15px rgba(15, 23, 42, 0.3); }

/* Thiết lập font cho toàn bộ trang web */
.gis-blog-wrapper {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Sửa lại Header cho chuẩn font chuyên nghiệp */
.brand-name h1 {
  font-family: 'Inter', sans-serif !important;
  font-weight: 800; /* Làm đậm tiêu đề */
  letter-spacing: -0.5px; /* Thu hẹp khoảng cách chữ nhìn sẽ sang hơn */
  color: #1a365d;
  margin: 0;
}

.brand-name p {
  font-family: 'Inter', sans-serif !important;
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1.5px; /* Dòng sub-title nên để thưa ra */
  color: #3182ce;
}
/* Sửa lại đoạn này để không đè icon */
* {
  font-family: 'Inter', sans-serif; /* Bỏ cái !important ở đây đi */
}

/* Ép riêng cho các thành phần chữ, nhưng CHỪA các thẻ icon ra */
h1, h2, h3, p, span, a, button, input, textarea {
  font-family: 'Inter', sans-serif !important;
}

/* Đảm bảo icon dùng đúng phông chữ của FontAwesome */
.fas, .fab, .fa-solid, .fa-brands, i {
  font-family: "Font Awesome 6 Free", "Font Awesome 6 Brands" !important;
  font-style: normal;
  font-variant: normal;
  text-rendering: auto;
  -webkit-font-smoothing: antialiased;
  font-weight: 900 !important; /* Rất quan trọng để hiện icon Solid */
}

/* TỌA ĐỘ BOX */
.coord-box {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #64748b;
  font-weight: 600;
}
.coord-box i { color: #ef4444; } /* Màu đỏ cho pin tọa độ */

/* CỤM NÚT MINI TRONG BÀI VIẾT */
.post-actions {
  display: flex;
  gap: 8px;
}

.btn-mini {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Inter', sans-serif !important;
}

/* Nút Sửa: Màu vàng hổ phách dịu mắt */
.btn-edit {
  background: #fffbeb;
  color: #b45309;
  border: 1px solid #fde68a;
}
.btn-edit:hover { background: #fef3c7; transform: translateY(-1px); }

/* Nút Xóa: Màu đỏ nhạt sang trọng */
.btn-delete {
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}
.btn-delete:hover { background: #fee2e2; transform: translateY(-1px); }

/* Đưa cụm meta xuống dưới cùng và giãn ra hai bên */
.post-meta-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto; /* Đẩy xuống đáy card */
  padding-top: 15px;
  border-top: 1px solid #f1f5f9;
}
.btn-login {
  background: #1a365d; /* Màu xanh đậm chuyên nghiệp */
  color: white;
  padding: 8px 22px;
  border: none;
  border-radius: 8px; /* Bo góc hiện đại */
  font-family: 'Inter', sans-serif !important;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px; /* Khoảng cách giữa icon và chữ */
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(26, 54, 93, 0.2);
}

.btn-login i {
  font-size: 16px;
}

/* Hiệu ứng khi di chuột vào */
.btn-login:hover {
  background: #3182ce; /* Chuyển sang xanh sáng hơn */
  transform: translateY(-2px); /* Nhảy nhẹ lên trên */
  box-shadow: 0 6px 12px rgba(49, 130, 206, 0.3);
}

/* Hiệu ứng khi bấm vào */
.btn-login:active {
  transform: translateY(0);
}
/* NÚT MUA VIP */
.btn-vip { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; border: 1px solid #fbbf24; }
.btn-vip:hover { background: linear-gradient(135deg, #fbbf24, #f59e0b); transform: translateY(-2px); box-shadow: 0 6px 15px rgba(245, 158, 11, 0.4); }

/* KHUNG THANH TOÁN QR */
.payment-modal { width: 400px !important; text-align: center; }
.payment-header { background: #1e293b; color: #f8fafc; padding: 15px; }
.qr-box { background: white; padding: 15px; border-radius: 10px; display: inline-block; margin-top: 20px; border: 2px dashed #cbd5e1; }
.qr-image { width: 180px; height: 180px; }
.payment-info { margin: 20px 0; font-size: 14px; color: #475569; }
.transfer-code { background: #fef3c7; color: #b45309; padding: 4px 10px; border-radius: 6px; font-family: monospace; font-size: 16px; }
.note-text { font-size: 11px; color: #94a3b8; font-style: italic; margin-top: 10px; }
.btn-confirm-pay { width: 100%; background: #10b981; color: white; border: none; padding: 15px; border-radius: 8px; font-weight: 800; font-size: 14px; cursor: pointer; transition: 0.3s; }
.btn-confirm-pay:hover { background: #059669; }

/* LOADING GIẢ LẬP */
.processing-box { padding: 50px 20px; color: #1e293b; }
.spinner-icon { font-size: 40px; color: #3b82f6; margin-bottom: 15px; }
.location-search-box { display: flex; gap: 8px; margin-bottom: 5px; }
.location-search-box input { flex: 1; border-radius: 8px; border: 1px solid #cbd5e1; padding: 10px; }
.location-search-box button { background: #3182ce; color: white; border: none; border-radius: 8px; padding: 0 15px; cursor: pointer; }
/* --- TRANG TRÍ RIÊNG CỤM TỌA ĐỘ DƯỚI BẢN ĐỒ --- */
.coords-modern-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-top: 15px;
  background: #f8fafc; /* Nền xám nhẹ cho cả vùng */
  padding: 12px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.coord-field {
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  padding: 10px 15px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  transition: all 0.3s ease;
}

/* Hiệu ứng khi di chuột qua ô tọa độ */
.coord-field:hover {
  border-color: #3182ce;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

/* Icon Lat/Lng */
.field-icon {
  width: 32px;
  height: 32px;
  background: #ebf8ff;
  color: #3182ce;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
}

.field-content {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.field-content span {
  font-size: 10px;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  margin-bottom: 2px;
}

.field-content input {
  border: none !important; /* Xóa viền đen xấu xí */
  padding: 0 !important;
  font-size: 15px !important;
  font-weight: 700 !important;
  color: #1e293b !important;
  background: transparent !important;
  outline: none !important;
  cursor: default;
}

</style>