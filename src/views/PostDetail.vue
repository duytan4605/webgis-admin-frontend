<template>
  <div class="post-detail-wrapper" v-if="post">
    <nav class="breadcrumb">
      <span @click="$router.push('/')">🏠 Dashboard</span> / 
      <span>Bản tin nghiên cứu</span> / 
      <span class="active">{{ post.title }}</span>
    </nav>

    <div class="container">
      <article class="main-article">
        <div class="article-hero-image" :style="{ backgroundImage: `url(${post.imageUrl || '/img/Thumbnail.jpg'})` }">
          <div class="hero-overlay">
            <div class="badge">GIS ANALYSIS REPORT</div>
            <h1>{{ post.title }}</h1>
            <div class="article-meta">
              <span class="author">👤 Tác giả: <strong>{{ post.author || 'Tan Nguyen (Admin)' }}</strong></span>
              <span class="date">📅 Cập nhật: {{ currentDate }}</span>
            </div>
          </div>
        </div>

        <section class="article-content">
          <p class="lead">{{ post.content }}</p>
          
          <div class="gis-data-box">
            <h4>📍 THÔNG SỐ VỊ TRÍ NGHIÊN CỨU & DỮ LIỆU KHÔNG GIAN</h4>
            <ul>
              <li><strong>Vĩ độ (Lat):</strong> <span class="highlight-coord">{{ post.lat }}</span></li>
              <li><strong>Kinh độ (Lng):</strong> <span class="highlight-coord">{{ post.lng }}</span></li>
              <li><strong>Chuyên mục:</strong> {{ post.category?.name || 'Nghiên cứu chung' }}</li>
            </ul>
          </div>

          <div class="map-container" v-if="post.lat && post.lng">
            <h4>🗺️ BẢN ĐỒ THỰC ĐỊA</h4>
            <iframe 
              width="100%" 
              height="300" 
              frameborder="0" 
              scrolling="no" 
              marginheight="0" 
              marginwidth="0" 
              :src="mapUrl" 
              style="border: 1px solid #e2e8f0; border-radius: 8px;">
            </iframe>
            <small class="map-caption">Dữ liệu bản đồ được cung cấp bởi OpenStreetMap</small>
          </div>
        </section>

        <hr class="divider" />

        <section class="comments-section">
          <h3><i class="fas fa-comments"></i> THẢO LUẬN & PHẢN BIỆN ({{ comments ? comments.length : 0 }})</h3>

          <div v-if="!comments || comments.length === 0" class="empty-comments">
            <i class="fas fa-comment-dots"></i>
            <p>Chưa có bình luận nào. Hãy là người đầu tiên đưa ra phản biện khoa học!</p>
          </div>

          <div v-for="c in comments" :key="c.id" class="comment-card">
            <div class="comment-avatar">{{ c.author.charAt(0).toUpperCase() }}</div>
            <div class="comment-body">
              <div class="comment-user">
                <strong>{{ c.author }}</strong> 
                
                <div class="comment-actions" v-if="currentUser && (currentUser.name === c.author || currentUser.role === 'ADMIN')">
                   <button @click="startEditComment(c)" title="Sửa bình luận" class="action-btn edit-btn"><i class="fas fa-pen"></i></button>
                   <button @click="deleteComment(c.id)" title="Xóa bình luận" class="action-btn delete-btn"><i class="fas fa-trash"></i></button>
                </div>
              </div>

              <div v-if="editingCommentId === c.id" class="edit-comment-box">
                <textarea v-model="editCommentText" class="edit-textarea"></textarea>
                <div class="edit-actions">
                  <button @click="saveEditComment" class="btn-save-edit">Lưu</button>
                  <button @click="editingCommentId = null" class="btn-cancel-edit">Hủy</button>
                </div>
              </div>

              <p v-else class="comment-text">{{ c.content }}</p>
            </div>
          </div>

          <div v-if="currentUser" class="comment-form-box">
            <div class="user-avatar">{{ currentUser.name.charAt(0).toUpperCase() }}</div>
            
            <div class="comment-input-area">
              <p class="comment-as">
                Đang bình luận dưới tên: <strong>{{ currentUser.name }}</strong> 
                <span class="badge" :class="currentUser.role === 'ADMIN' ? 'badge-admin' : 'badge-user'">{{ currentUser.role }}</span>
              </p>
              
              <textarea 
                v-model="newComment" 
                placeholder="Nhập ý kiến đóng góp hoặc đánh giá thuật toán của bạn..."
              ></textarea>
              
              <button class="btn-submit-comment" :disabled="!newComment || !newComment.trim()" @click="submitComment">
                <i class="fas fa-paper-plane"></i> GỬI PHẢN HỒI
              </button>
            </div>
          </div>
          
          <div v-else class="empty-comments" style="margin-top: 20px;">
             <p class="text-red"><i class="fas fa-lock"></i> Vui lòng đăng nhập để tham gia thảo luận!</p>
          </div>
        </section>
      </article>

      <aside class="article-sidebar">
        <div class="sidebar-card action-card">
          <h4>🛰️ CÔNG CỤ GIS</h4>
          <p>Tương tác với lớp dữ liệu không gian của bài nghiên cứu này.</p>
          <button class="btn-sidebar btn-map" @click="goToMap">
            <i class="fas fa-map-marked-alt"></i> MỞ BẢN ĐỒ TOÀN MÀN HÌNH
          </button>
          <button class="btn-download" @click="handleDownloadGeoJSON">
          <i class="fas fa-file-download"></i> TẢI DỮ LIỆU GEOJSON<i class="fas fa-crown" style="color: #f59e0b; font-size: 10px; margin-left: 5px;"></i>
          </button>
        </div>

        <div class="sidebar-card info-card">
          <h4>VỀ TÁC GIẢ</h4>
          <div class="author-profile">
            <div class="author-avatar-large">TN</div>
            <div class="author-info">
              <h5>Tan Nguyen</h5>
              <span>Quản trị viên Hệ thống</span>
              <span>HCMUNRE</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
  
  <div v-else class="loading-screen">
    <i class="fas fa-spinner fa-spin"></i> Đang tải dữ liệu nghiên cứu...
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'PostDetail',
  data() {
    return {
      post: null,
      comments: [],
      newComment: '',
      currentUser: null,
      editingCommentId: null,
      editCommentText: ''
    }
  },
  computed: {
    // Tự động sinh URL bản đồ OpenStreetMap dựa vào tọa độ bài viết
    mapUrl() {
      if (!this.post) return '';
      const lat = this.post.lat;
      const lng = this.post.lng;
      const offset = 0.05; // Độ zoom
      return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - offset},${lat - offset},${lng + offset},${lat + offset}&layer=mapnik&marker=${lat},${lng}`;
    },
    // Lấy ngày hiện tại format đẹp
    currentDate() {
      const today = new Date();
      return today.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
  },
  mounted() {
    this.currentUser = JSON.parse(localStorage.getItem('user'));
    this.loadData();
  },
  methods: {
    // 1. Hàm bật chế độ sửa
    startEditComment(comment) {
      this.editingCommentId = comment.id;
      this.editCommentText = comment.content;
    },

    // 2. Hàm lưu bình luận sau khi sửa
    saveEditComment() {
      if (!this.editCommentText.trim()) {
        alert("Bình luận không được để trống!");
        return;
      }
      
      axios.put(`http://localhost:8085/api/comments/${this.editingCommentId}`, {
        content: this.editCommentText,
        author: this.currentUser.name,
        post: { id: this.post.id }
      }).then(() => {
        this.editingCommentId = null; // Tắt chế độ sửa
        this.loadData(); // Load lại danh sách
      }).catch(() => alert("Lỗi khi cập nhật bình luận! Backend đã có hàm PUT chưa?"));
    },

    // 3. Hàm xóa bình luận
    deleteComment(id) {
      if (confirm("Bạn có chắc chắn muốn xóa bình luận này? Hành động này không thể hoàn tác!")) {
        axios.delete(`http://localhost:8085/api/comments/${id}`)
          .then(() => {
            this.loadData(); // Load lại danh sách
          })
          .catch(() => alert("Lỗi khi xóa bình luận! Backend đã có hàm DELETE chưa?"));
      }
    },
    handleDownloadGeoJSON() {
    // 1. Ép hệ thống lấy lại dữ liệu User mới nhất từ bộ nhớ
    const currentUser = JSON.parse(localStorage.getItem('user'));

    if (!currentUser) {
      alert("⚠️ Hệ thống chưa nhận diện được tài khoản. Vui lòng đăng nhập lại!");
      this.$router.push('/login');
      return;
    }

    // 2. Kiểm tra quyền: ADMIN hoặc VIP
    if (currentUser.role === 'ADMIN' || currentUser.tier === 'VIP') {
      this.downloadFile(); 
    } else {
      alert("💎 Tính năng này chỉ dành cho đại gia VIP! Hãy nâng cấp để tải dữ liệu GeoJSON gốc.");
      this.$router.push('/'); // Dẫn về trang chủ để thấy nút nạp tiền
    }
  },

 downloadFile() {
    // 1. Chuẩn bị dữ liệu GeoJSON mẫu từ tọa độ bài viết
    const geoData = {
      type: "FeatureCollection",
      features: [{
        type: "Feature",
        properties: { name: this.post.title, author: "GIS Research Forum" },
        geometry: {
          type: "Point",
          coordinates: [this.post.lng, this.post.lat]
        }
      }]
    };

    // 2. Tạo file và tải về (Logic thực tế)
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(geoData));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", this.post.title + ".geojson");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();

    alert("✅ Đã trích xuất dữ liệu thành công! File " + this.post.title + ".geojson đang được tải về.");
  },
    loadData() {
      const id = this.$route.params.id;
      // Gọi API lấy bài viết
      axios.get(`http://localhost:8085/api/posts/${id}`)
        .then(res => { this.post = res.data; })
        .catch(err => {
          console.error(err);
          alert("Không tìm thấy bài viết!");
          this.$router.push('/');
        });
      
      // Gọi API lấy bình luận
      axios.get(`http://localhost:8085/api/comments/post/${id}`)
        .then(res => { 
          // Check nếu Spring Boot trả về kiểu phân trang (res.data.content) hay mảng thuần (res.data)
          this.comments = res.data.content ? res.data.content : res.data; 
        })
        .catch(err => {
          console.error("Lỗi tải bình luận:", err);
          this.comments = []; // Lỗi thì gán mảng rỗng để không bị sập web
        });
    },
    submitComment() {
      
      const authorName = this.currentUser ? this.currentUser.name : 'Khách';

      axios.post('http://localhost:8085/api/comments', {
        content: this.newComment,
        author: authorName,
        post: { id: this.post.id }
      }).then(() => {
        this.newComment = '';
        this.loadData(); // Load lại để cập nhật
      }).catch(err => {
        console.error(err);
        alert("Có lỗi khi gửi bình luận! Kiểm tra lại Backend xem đã có CommentController chưa nhé.");
      });
    },
    goToMap() {
      this.$router.push({ path: '/map', query: { lat: this.post.lat, lng: this.post.lng } });
    },
   downloadGeoJSON() {
      if (!this.post || !this.post.lat || !this.post.lng) {
        alert("Không tìm thấy tọa độ hợp lệ để xuất file!");
        return;
      }

      // 1. Tạo cấu trúc GeoJSON chuẩn (Lưu ý: Array phải là [Kinh độ, Vĩ độ])
      const geojsonFeature = {
        "type": "FeatureCollection",
        "features": [
          {
            "type": "Feature",
            "properties": {
              "id": this.post.id,
              "title": this.post.title,
              "category": this.post.category ? this.post.category.name : "Nghiên cứu GIS",
              "author": this.post.author || "Tan Nguyen",
              "description": this.post.content ? this.post.content.substring(0, 150) + "..." : ""
            },
            "geometry": {
              "type": "Point",
              "coordinates": [this.post.lng, this.post.lat] 
            }
          }
        ]
      };

      // 2. Đóng gói Object thành chuỗi JSON để tải về
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(geojsonFeature, null, 2));

      // 3. Tạo 1 thẻ <a> ẩn để ép trình duyệt tải file xuống
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `Dữ_liệu_GIS_NinhThuan_Bai_${this.post.id}.geojson`);
      
      // Kích hoạt click để tải
      document.body.appendChild(downloadAnchorNode); 
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    }
  }
}
</script>

<style scoped>
.post-detail-wrapper { background: #f0f2f5; min-height: 100vh; padding: 30px 20px; font-family: 'Inter', sans-serif; }
.breadcrumb { max-width: 1200px; margin: 0 auto 20px; color: #64748b; font-size: 14px; font-weight: 500;}
.breadcrumb span { cursor: pointer; transition: 0.2s; }
.breadcrumb span:hover { color: #3182ce; }
.breadcrumb .active { color: #1a365d; font-weight: 700; pointer-events: none; }

.container { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 320px; gap: 30px; }
.main-article { background: white; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); overflow: hidden; }

/* HERO IMAGE ĐỈNH CAO */
.article-hero-image {
  width: 100%;
  height: 350px;
  background-size: cover;
  background-position: center;
  position: relative;
}
.hero-overlay {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  background: linear-gradient(to top, rgba(15, 23, 42, 0.95), transparent);
  padding: 40px;
  color: white;
}

.badge { background: #3182ce; color: white; display: inline-block; padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 800; letter-spacing: 1px; margin-bottom: 15px; }
.hero-overlay h1 { font-size: 34px; margin: 0 0 15px 0; line-height: 1.3; font-weight: 800; text-shadow: 0 2px 4px rgba(0,0,0,0.5); }
.article-meta { display: flex; gap: 20px; font-size: 14px; opacity: 0.9; }

/* NỘI DUNG CHÍNH */
.article-content { padding: 40px; }
.lead { font-size: 17px; color: #334155; line-height: 1.8; margin-bottom: 30px; text-align: justify; }

.gis-data-box { background: #f8fafc; padding: 25px; border-radius: 12px; margin-bottom: 30px; border-left: 5px solid #3182ce; }
.gis-data-box h4 { margin: 0 0 15px 0; color: #1e293b; font-size: 15px; font-weight: 800; }
.gis-data-box ul { list-style: none; padding: 0; margin: 0; display: flex; gap: 30px; font-size: 15px; color: #475569; }
.highlight-coord { background: #e2e8f0; padding: 4px 8px; border-radius: 6px; font-weight: 700; color: #1a365d; font-family: monospace; }

/* MAP CONTAINER */
.map-container { margin-top: 30px; }
.map-container h4 { color: #1e293b; margin-bottom: 15px; font-weight: 800; }
.map-caption { display: block; text-align: center; color: #94a3b8; margin-top: 10px; font-style: italic; }

.divider { border: 0; border-top: 1px solid #e2e8f0; margin: 40px 40px 0 40px; }

/* BÌNH LUẬN XỊN XÒ */
.comment-section { padding: 40px; }
.comment-section h3 { margin-top: 0; color: #1e293b; font-weight: 800; margin-bottom: 25px; }

.comment-card { display: flex; gap: 15px; margin-bottom: 25px; }
.comment-avatar { width: 45px; height: 45px; background: #e2e8f0; color: #475569; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 18px; flex-shrink: 0; }
.comment-body { background: #f8fafc; padding: 15px 20px; border-radius: 0 12px 12px 12px; border: 1px solid #f1f5f9; flex-grow: 1; }
.comment-user { font-size: 14px; color: #1e293b; margin-bottom: 8px; display: flex; justify-content: space-between; }
.comment-time { font-size: 12px; color: #94a3b8; font-weight: normal; }
.comment-text { color: #475569; font-size: 14.5px; margin: 0; line-height: 1.5; }

.replying-as { font-size: 13px; color: #64748b; margin-bottom: 10px; }
.text-red { color: #e11d48; font-weight: 600; }
.comment-form textarea { width: 100%; height: 120px; padding: 15px; border-radius: 10px; border: 2px solid #e2e8f0; box-sizing: border-box; font-family: inherit; font-size: 14px; transition: 0.3s; outline: none; resize: vertical; }
.comment-form textarea:focus { border-color: #3182ce; }
.btn-send { background: #1a365d; color: white; border: none; padding: 12px 30px; border-radius: 8px; margin-top: 15px; cursor: pointer; font-weight: 700; display: flex; align-items: center; gap: 8px; transition: 0.3s; }
.btn-send:hover:not(:disabled) { background: #3182ce; transform: translateY(-2px); }
.btn-send:disabled { background: #cbd5e1; cursor: not-allowed; }

/* SIDEBAR MỚI */
.sidebar-card { background: white; padding: 25px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); margin-bottom: 25px; }
.sidebar-card h4 { margin: 0 0 15px 0; color: #1e293b; font-weight: 800; font-size: 15px; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; }
.action-card p { font-size: 13px; color: #64748b; margin-bottom: 20px; line-height: 1.5; }

.btn-sidebar { width: 100%; border: none; padding: 14px; border-radius: 10px; margin-bottom: 12px; cursor: pointer; font-weight: 700; font-size: 13px; display: flex; align-items: center; justify-content: center; gap: 8px; transition: 0.3s; }
.btn-map { background: #3182ce; color: white; }
.btn-map:hover { background: #2b6cb0; transform: translateY(-2px); }
.btn-download { background: #f8fafc; color: #475569; border: 1px solid #e2e8f0; }
.btn-download:hover { background: #f1f5f9; }

.author-profile { display: flex; gap: 15px; align-items: center; }
.author-avatar-large { width: 60px; height: 60px; background: #1a365d; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold; }
.author-info h5 { margin: 0 0 5px 0; color: #1e293b; font-size: 16px; font-weight: 800; }
.author-info span { display: block; font-size: 12px; color: #64748b; margin-bottom: 3px; }

.loading-screen { display: flex; align-items: center; justify-content: center; height: 100vh; font-size: 18px; color: #1a365d; font-weight: 600; gap: 10px; }

/* THIẾT KẾ NÚT TẢI DỮ LIỆU CHUẨN VIP */
.btn-download {
  width: 100%;
  padding: 12px 20px;
  margin-top: 10px;
  background: #ffffff;
  color: #b45309; /* Màu nâu vàng */
  border: 2px solid #fcd34d; /* Viền vàng sáng */
  border-radius: 10px;
  font-weight: 800;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

/* Hiệu ứng khi di chuột vào (Dành cho đại gia) */
.btn-download:hover {
  background: linear-gradient(135deg, #fef3c7 0%, #fff 100%);
  border-color: #f59e0b;
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(245, 158, 11, 0.2);
}

/* Hiệu ứng icon vương miện lấp lánh */
.fa-crown {
  animation: shine 2s infinite;
}

@keyframes shine {
  0% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
  100% { opacity: 0.5; transform: scale(1); }
}
/* NÚT TẢI GEOJSON PHONG CÁCH HOÀNG GIA */
.btn-download {
  width: 100%;
  padding: 14px 20px;
  margin-top: 15px;
  background: #fff;
  /* Màu vàng nâu hổ phách để tiệp màu với icon vương miện */
  color: #92400e !important; 
  border: 2px solid #fbbf24;
  border-radius: 12px;
  /* Ép phông chữ Inter chuyên nghiệp */
  font-family: 'Inter', sans-serif !important;
  font-weight: 800;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 4px 0px #f59e0b; /* Tạo hiệu ứng nút 3D */
}

/* Hiệu ứng khi đại gia đưa chuột vào */
.btn-download:hover {
  background: #fffbeb;
  transform: translateY(2px); /* Nhấn nút xuống */
  box-shadow: 0 2px 0px #f59e0b;
  border-color: #f59e0b;
}

/* Làm cho icon vương miện lấp lánh sang trọng */
.fa-crown {
  color: #f59e0b;
  filter: drop-shadow(0 0 5px rgba(245, 158, 11, 0.5));
  animation: vip-shine 1.5s infinite alternate;
}

@keyframes vip-shine {
  from { transform: scale(1) rotate(-5deg); opacity: 0.8; }
  to { transform: scale(1.2) rotate(5deg); opacity: 1; }
}

/* --- KHU VỰC BÌNH LUẬN MỚI --- */
.comments-section { padding: 40px; }
.comments-section h3 { margin-top: 0; font-size: 18px; color: #1e293b; font-weight: 800; margin-bottom: 25px; }

/* Khung thông báo trống */
.empty-comments { text-align: center; padding: 30px 20px; background: #f8fafc; border-radius: 12px; border: 1px dashed #cbd5e1; color: #94a3b8; margin-bottom: 20px; }
.empty-comments i { font-size: 28px; margin-bottom: 10px; color: #cbd5e1; }
.empty-comments p { margin: 0; font-size: 14px; font-weight: 500; }

/* Danh sách comment */
.comment-card { display: flex; gap: 15px; margin-bottom: 25px; }
.comment-avatar { width: 45px; height: 45px; background: #e2e8f0; color: #475569; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 18px; flex-shrink: 0; }
.comment-body { background: #f8fafc; padding: 15px 20px; border-radius: 0 12px 12px 12px; border: 1px solid #f1f5f9; flex-grow: 1; }
.comment-user { font-size: 14px; color: #1e293b; margin-bottom: 8px; display: flex; justify-content: space-between; }
.comment-time { font-size: 12px; color: #94a3b8; font-weight: normal; }
.comment-text { color: #475569; font-size: 14.5px; margin: 0; line-height: 1.5; }

/* Khung nhập liệu (Chat box style) */
.comment-form-box { display: flex; gap: 15px; background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; }

/* Avatar hình tròn chuyển màu */
.user-avatar { 
  width: 42px; height: 42px; 
  background: linear-gradient(135deg, #1e40af, #3b82f6); 
  color: white; border-radius: 50%; 
  display: flex; align-items: center; justify-content: center; 
  font-weight: 800; font-size: 18px; flex-shrink: 0; 
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3);
}

.comment-input-area { flex-grow: 1; }
.comment-as { font-size: 12px; color: #64748b; margin: 0 0 10px 0; }
.comment-as strong { color: #1e293b; }
.text-red { color: #e11d48; font-weight: 600; }

.badge { font-size: 9px; padding: 3px 6px; border-radius: 4px; margin-left: 5px; font-weight: 800; }
.badge-admin { background: #fee2e2; color: #b91c1c; }
.badge-user { background: #e0f2fe; color: #0369a1; }

.comment-input-area textarea { 
  width: 100%; height: 90px; padding: 15px; 
  border: 1px solid #cbd5e1; border-radius: 8px; 
  outline: none; font-family: inherit; font-size: 14px; 
  resize: none; transition: 0.2s; box-sizing: border-box; 
}
.comment-input-area textarea:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15); background: #fff; }

/* Nút Gửi Động */
/* Nút Gửi Động (Đã fix lỗi phông chữ) */
.btn-submit-comment { 
  margin-top: 12px; 
  background: #3b82f6; 
  color: white; 
  border: none; 
  padding: 10px 20px; 
  border-radius: 8px; 
  
  /* 👉 ÉP BUỘC PHẢI DÙNG PHÔNG CHỮ INTER CHUYÊN NGHIỆP */
  font-family: 'Inter', sans-serif !important; 
  font-weight: 700; /* Giảm độ béo từ 800 xuống 700 cho thanh thoát */
  
  cursor: pointer; 
  transition: 0.3s; 
  display: flex; 
  align-items: center; 
  gap: 8px; 
  float: right; 
}
.btn-submit-comment:hover:not(:disabled) { 
  background: #2563eb; 
  transform: translateY(-2px); 
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3); 
}
.btn-submit-comment:disabled { 
  background: #cbd5e1; 
  cursor: not-allowed; 
  opacity: 0.7; 
}
/* --- CSS CHO PHẦN SỬA/XÓA BÌNH LUẬN --- */
.comment-actions { display: flex; gap: 8px; }
.action-btn { 
  background: transparent; border: none; cursor: pointer; 
  font-size: 13px; color: #94a3b8; transition: 0.2s; padding: 0;
}
.edit-btn:hover { color: #3b82f6; }
.delete-btn:hover { color: #ef4444; }

/* Khung chỉnh sửa (Edit mode) */
.edit-comment-box { margin-top: 10px; }
.edit-textarea { 
  width: 100%; height: 60px; padding: 10px; 
  border: 1px solid #3b82f6; border-radius: 6px; 
  font-family: inherit; font-size: 14px; 
  resize: none; outline: none; margin-bottom: 8px;
}
.edit-actions { display: flex; gap: 10px; justify-content: flex-end; }
.btn-save-edit { background: #3b82f6; color: white; border: none; padding: 6px 15px; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 12px; }
.btn-save-edit:hover { background: #2563eb; }
.btn-cancel-edit { background: #e2e8f0; color: #475569; border: none; padding: 6px 15px; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 12px; }
.btn-cancel-edit:hover { background: #cbd5e1; }
</style>