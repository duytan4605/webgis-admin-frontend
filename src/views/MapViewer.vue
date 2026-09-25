<template>
  <div class="map-container">
    <transition name="toast-fade">
      <div v-if="toast.show" class="toast-notification" :class="toast.type">
        <i :class="toast.icon"></i> {{ toast.message }}
      </div>
    </transition>

    <button class="btn-float btn-open-sidebar" :class="{ 'show': !isSidebarOpen }" @click="isSidebarOpen = true" title="Mở bảng điều khiển">
      <i class="fas fa-bars"></i>
    </button>

    <div class="sidebar glass-panel" :class="{ 'sidebar-hidden': !isSidebarOpen }">
      <div class="header">
        <div class="brand-logo">🛰️</div>
        <div>
          <h2>GIS WEB VIEWER</h2>
          <p>Map Spatial Data</p>
        </div>
        <button class="btn-toggle-sidebar" @click="isSidebarOpen = false" title="Thu gọn bảng điều khiển">
          <i class="fas fa-chevron-left"></i>
        </button>
      </div>

      <div class="toolkit-section">
        <h4><i class="fas fa-toolbox"></i> CÔNG CỤ PHÂN TÍCH</h4>
        <div class="toolkit-grid">
          <button class="tool-btn" @click="toggleMeasure" :class="{ 'active-tool': isMeasuring }">
            <i class="fas fa-ruler-combined"></i> {{ isMeasuring ? 'Đang đo...' : 'Thước đo' }}
          </button>
          <button class="tool-btn" @click="exportMap">
            <i class="fas fa-camera"></i> Xuất ảnh
          </button>
          <button class="tool-btn danger" @click="clearMarkers">
            <i class="fas fa-trash-alt"></i> Dọn bản đồ
          </button>
          <button class="tool-btn" @click="$router.push('/')">
            <i class="fas fa-home"></i> Về Home
          </button>
        </div>
        
        <div class="layer-toggle">
          <label class="switch-wrap">
            <input type="checkbox" v-model="showHeatmap"> 
            <span class="slider"></span>
            <span class="label-text">Bật Lớp cảnh báo nhiệt (LST)</span>
          </label>
        </div>
      </div>

      <hr class="divider">

      <div class="post-form">
        <h4><i class="fas fa-map-pin"></i> GHIM TỌA ĐỘ MỚI</h4>
        <input v-model="newPost.title" placeholder="Tên điểm nghiên cứu..." />
        <textarea v-model="newPost.content" placeholder="Mô tả hiện trạng thực địa..."></textarea>
        <div class="coords-editable">
          <div class="coord-box-input">
            <label>Lat:</label>
            <input v-model.number="myLat" type="number" step="0.0001" />
          </div>
          <div class="coord-box-input">
            <label>Lng:</label>
            <input v-model.number="myLng" type="number" step="0.0001" />
          </div>
        </div>
        <button class="btn-post" @click="savePost"><i class="fas fa-cloud-upload-alt"></i> LƯU VÀO CSDL</button>
      </div>

      <div class="forum-feed">
        <h4><i class="fas fa-list-ul"></i> DANH SÁCH ĐIỂM TIN</h4>
        <div v-if="posts.length === 0" class="empty">Đang đồng bộ dữ liệu...</div>
        <div v-for="p in posts" :key="p.id" class="post-card" @click="focusPost(p)">
          <div class="post-tag" :class="p.title?.includes('cháy') ? 'urgent' : ''">
            {{ p.title?.includes('cháy') ? '🔥 RỦI RO CAO' : '📂 KẾT QUẢ' }}
          </div>
          <h5>{{ p.title }}</h5>
          <p>{{ p.content?.substring(0, 50) }}...</p>
        </div>
      </div>
    </div> 
    <div id="map"></div>
    
    <button class="btn-float btn-my-location" @click="getLocation" title="Định vị GPS của tôi">
      <i class="fas fa-crosshairs"></i>
    </button>
  </div>
</template>
<script>
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
// Dòng import html2canvas phải nằm ở đây (top level)
import html2canvas from 'html2canvas';

// FIX LỖI ICON LEAFLET
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

export default {
  name: 'MapViewer',
  data() {
    return {
      posts: [],
      myLat: 11.562,
      myLng: 108.990,
      newPost: { title: '', content: '' },
      showHeatmap: false,
      isMeasuring: false,
      measurePoints: [],
      toast: { show: false, message: '', type: 'success', icon: 'fas fa-check-circle' },
      isSidebarOpen: true, 
    }
  },
  watch: {
    showHeatmap(val) {
      if (val) {
        this.heatLayer = L.layerGroup().addTo(this.map);
        this.posts.forEach(p => {
          L.circle([p.lat, p.lng], {
            color: 'red', fillColor: '#f03', fillOpacity: 0.15, radius: 2500, weight: 1
          }).addTo(this.heatLayer);
        });
        this.showToast("Đã phủ lớp phân tích nhiệt (LST) lên bản đồ.", "success", "fas fa-layer-group");
      } else {
        if (this.heatLayer) this.map.removeLayer(this.heatLayer);
        this.showToast("Đã tắt lớp phân tích nhiệt.", "success", "fas fa-layer-group");
      }
    }
  },
  mounted() {
    this.initMap();
    this.fetchPosts();
    const queryLat = this.$route.query.lat;
    const queryLng = this.$route.query.lng;
    if (queryLat && queryLng) {
      setTimeout(() => {
        this.map.flyTo([queryLat, queryLng], 14, { animate: true, duration: 2 });
        L.popup({ className: 'custom-popup' }).setLatLng([queryLat, queryLng]).setContent("<b style='color:#1a365d'>📍 Vùng nghiên cứu tiêu điểm</b>").openOn(this.map);
      }, 1000);
    }
  },
 beforeUnmount() {
    if (this.map) {
      this.map.off();    // Ngắt toàn bộ sự kiện đang chạy ngầm
      this.map.remove(); // Giải phóng bộ nhớ Leaflet
      this.map = null;
    }
  },
  methods: {
    showToast(message, type = 'success', icon = 'fas fa-check-circle') {
      this.toast = { show: true, message, type, icon };
      setTimeout(() => { this.toast.show = false; }, 3500);
    },
    initMap() {
      const satellite = L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
        subdomains:['mt0','mt1','mt2','mt3'], maxZoom: 20
      });
      const terrain = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', { maxZoom: 17 });
      
      // 👉 TẮT ZOOM MẶC ĐỊNH BỊ CHE Ở GÓC TRÁI
      this.map = L.map('map', { 
        center: [this.myLat, this.myLng], 
        zoom: 10, 
        layers: [satellite],
        zoomControl: false // Lệnh tắt
      });
      
      // 👉 BẬT LẠI ZOOM Ở GÓC DƯỚI BÊN PHẢI (An toàn tuyệt đối)
      L.control.zoom({ position: 'bottomright' }).addTo(this.map);
      this.markerLayer = L.layerGroup().addTo(this.map);
      L.control.layers({ "Vệ tinh (Google)": satellite, "Địa hình (Topo)": terrain }).addTo(this.map);
      
      // 👉 ĐOẠN CODE MỚI XỬ LÝ CLICK:
      this.map.on('click', (e) => {
        if (this.isMeasuring) { 
          this.handleMeasureClick(e); 
        } else { 
          this.myLat = e.latlng.lat; 
          this.myLng = e.latlng.lng; 

          // 1. CẮM CỌC MARKER "NHÁP" (ĐỂ HẾT BỊ TÀNG HÌNH)
          if (this.draftMarker) {
            this.draftMarker.setLatLng(e.latlng);
          } else {
            // Biến draftMarker này không cần khai báo trong data() để tránh lỗi Proxy
            this.draftMarker = L.marker(e.latlng).addTo(this.map).bindPopup("<b>📍 Vị trí đang ghim</b>").openPopup();
          }

          // 2. TỰ ĐỘNG ĐIỀN TÊN TẠM THỜI
          this.newPost.title = `Khảo sát tại ${this.myLat.toFixed(3)}, ${this.myLng.toFixed(3)}`;

          // 3. DÙNG VỆ TINH QUÉT TÊN ĐỊA PHƯƠNG TỰ ĐỘNG
          this.showToast("Đang quét tên địa phương...", "success", "fas fa-satellite-dish");
          axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${this.myLat}&lon=${this.myLng}`)
            .then(res => {
              if (res.data && res.data.display_name) {
                // Cắt lấy 2 thành phần đầu của địa chỉ cho gọn (VD: Xã Nho Lâm, Huyện Ninh Sơn)
                const shortAddress = res.data.display_name.split(',').slice(0, 2).join(',');
                this.newPost.title = `Điểm khảo sát: ${shortAddress}`;
              }
            }).catch(() => {});
        }
      });
    },
    fetchPosts() {
      axios.get('http://localhost:8085/api/posts')
        .then(res => {
          this.posts = res.data.content ? res.data.content : res.data;
          this.renderMarkers();
        })
        .catch(() => this.showToast("Mất kết nối CSDL Không gian!", "error", "fas fa-wifi"));
    },
    renderMarkers() {
      this.markerLayer.clearLayers(); 
      this.posts.forEach(p => {
        const marker = L.marker([p.lat, p.lng]).addTo(this.markerLayer);
        const popupContent = `<div style="font-family:Inter,sans-serif;"><h4 style="margin:0 0 5px 0;color:#1a365d;font-size:14px;">${p.title}</h4><p style="margin:0;font-size:12px;color:#64748b;">${p.content?.substring(0, 80)}...</p><hr style="border:0;border-top:1px solid #eee;margin:8px 0;"/><small style="color:#3b82f6;">Lat: ${p.lat.toFixed(3)} | Lng: ${p.lng.toFixed(3)}</small></div>`;
        marker.bindPopup(popupContent);
      });
    },
    savePost() {
      if (!this.newPost.title) return this.showToast("Bắt buộc nhập Tên điểm!", "error", "fas fa-exclamation");
      const payload = { ...this.newPost, lat: this.myLat, lng: this.myLng };
      axios.post('http://localhost:8085/api/posts', payload).then(() => {
        this.newPost = { title: '', content: '' };
        if (this.draftMarker) {
          this.map.removeLayer(this.draftMarker);
          this.draftMarker = null;
        }
        this.fetchPosts();
        this.showToast("Đã đồng bộ điểm đánh dấu vào CSDL!", "success", "fas fa-cloud-upload-alt");
      }).catch(() => this.showToast("Lỗi lưu điểm!", "error"));
    },
    focusPost(p) {
      // Đã thay flyTo bằng setView
      this.map.setView([p.lat, p.lng], 15);
      L.popup().setLatLng([p.lat, p.lng]).setContent(`<b>${p.title}</b>`).openOn(this.map);
    },
   clearMarkers() {
      this.markerLayer.clearLayers();
      if(this.measureLine) this.map.removeLayer(this.measureLine);
      this.measurePoints = [];
      
      // 👉 DỌN SẠCH CỌC GHIM
      if (this.measureNodes) {
        this.measureNodes.forEach(node => this.map.removeLayer(node));
        this.measureNodes = [];
      }
      
      this.showToast("Đã dọn dẹp bộ nhớ bản đồ tạm thời.", "success", "fas fa-broom");
    },
    
    getLocation() {
      if (navigator.geolocation) {
        this.showToast("Đang thu thập tín hiệu GPS...", "success", "fas fa-satellite");
        navigator.geolocation.getCurrentPosition(pos => {
          this.myLat = pos.coords.latitude; 
          this.myLng = pos.coords.longitude;
          // Đã thay flyTo bằng setView
          this.map.setView([this.myLat, this.myLng], 16);
          L.marker([this.myLat, this.myLng]).addTo(this.map).bindPopup("<b>Vị trí thiết bị của bạn</b>").openPopup();
        });
      }
    },
    toggleMeasure() {
      this.isMeasuring = !this.isMeasuring;
      if (this.isMeasuring) {
        this.showToast("Chế độ đo: Click các điểm trên bản đồ để tính khoảng cách.", "success", "fas fa-ruler");
        document.getElementById('map').style.cursor = 'crosshair';
      } else {
        document.getElementById('map').style.cursor = '';
        if(this.measureLine) this.map.removeLayer(this.measureLine);
        this.measurePoints = [];
        
        if (this.measureNodes) {
          this.measureNodes.forEach(node => this.map.removeLayer(node));
          this.measureNodes = [];
        }
      }
    },
    handleMeasureClick(e) {
      this.measurePoints.push(e.latlng);
      
      // 👉 VẼ CỤC TRÒN ĐÁNH DẤU TẠI ĐIỂM CLICK
      const node = L.circleMarker(e.latlng, {
        radius: 6,
        color: '#ffffff',     // Viền trắng
        weight: 2,
        fillColor: '#ef4444', // Ruột đỏ rực
        fillOpacity: 1
      }).addTo(this.map);

      // Lưu lại các cục tròn này để lát còn dọn dẹp
      if (!this.measureNodes) this.measureNodes = [];
      this.measureNodes.push(node);

      // Vẽ đường nối
      if(this.measureLine) this.map.removeLayer(this.measureLine);
      this.measureLine = L.polyline(this.measurePoints, { color: '#fbbf24', weight: 4, dashArray: '10, 10' }).addTo(this.map);
      
      // Tính toán khoảng cách
      if (this.measurePoints.length > 1) {
        let dist = 0;
        for (let i = 0; i < this.measurePoints.length - 1; i++) { dist += this.measurePoints[i].distanceTo(this.measurePoints[i+1]); }
        this.showToast(`Tổng chiều dài đoạn đường: ${(dist / 1000).toFixed(2)} km`, "success", "fas fa-flag-checkered");
      }
    },
    async exportMap() {
      this.showToast("Đang kết xuất bản đồ (Render)...", "success", "fas fa-spinner fa-spin");
      try {
        const mapElement = document.getElementById('map');
        const canvas = await html2canvas(mapElement, {
          useCORS: true,
          allowTaint: true,
          ignoreElements: (el) => el.classList.contains('leaflet-control-container')
        });
        const link = document.createElement('a');
        link.download = `GIS_Map_Export_${new Date().getTime()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        this.showToast("Đã lưu ảnh bản đồ thành công vào máy!", "success", "fas fa-image");
      } catch (error) {
        console.error("Lỗi xuất ảnh:", error);
        this.showToast("Không thể xuất ảnh do lỗi bảo vệ lớp nền (CORS)!", "error", "fas fa-exclamation-triangle");
      }
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
.map-container { position: relative; width: 100%; height: 100vh; font-family: 'Inter', sans-serif; overflow: hidden; }
#map { height: 100%; width: 100%; position: absolute; z-index: 1; }
.sidebar { position: absolute; top: 20px; left: 20px; bottom: 20px; width: 340px; background: rgba(255, 255, 255, 0.85); z-index: 1000; box-shadow: 0 10px 30px rgba(0,0,0,0.15); backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px); border: 1px solid rgba(255,255,255,0.5); border-radius: 20px; padding: 25px; display: flex; flex-direction: column; overflow-y: auto; }
.sidebar::-webkit-scrollbar { width: 5px; }
.sidebar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
.header { display: flex; align-items: center; gap: 15px; margin-bottom: 25px; }
.brand-logo { width: 45px; height: 45px; background: #1a365d; color: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; box-shadow: 0 4px 10px rgba(26,54,93,0.3); }
.header h2 { font-size: 18px; color: #1e293b; margin: 0; font-weight: 800; letter-spacing: -0.5px; }
.header p { margin: 0; font-size: 11px; font-weight: 700; color: #3b82f6; text-transform: uppercase; letter-spacing: 1px; }
.toolkit-section h4, .post-form h4, .forum-feed h4 { margin: 0 0 15px 0; font-size: 13px; color: #64748b; font-weight: 800; display: flex; align-items: center; gap: 8px; }
.toolkit-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
.tool-btn { padding: 12px 10px; border: 1px solid #e2e8f0; background: white; border-radius: 10px; cursor: pointer; font-size: 13px; font-weight: 600; color: #475569; transition: 0.2s; display: flex; flex-direction: column; align-items: center; gap: 8px; }
.tool-btn i { font-size: 18px; color: #3b82f6; }
.tool-btn:hover { background: #f8fafc; transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
.tool-btn.active-tool { background: #eff6ff; border-color: #3b82f6; color: #1d4ed8; }
.tool-btn.danger i { color: #ef4444; }
.switch-wrap { display: flex; align-items: center; cursor: pointer; gap: 12px; background: white; padding: 10px 15px; border-radius: 10px; border: 1px solid #e2e8f0; }
.switch-wrap input { display: none; }
.slider { width: 40px; height: 22px; background: #cbd5e1; border-radius: 20px; position: relative; transition: 0.3s; }
.slider::before { content: ''; position: absolute; width: 16px; height: 16px; background: white; border-radius: 50%; top: 3px; left: 3px; transition: 0.3s; }
input:checked + .slider { background: #ef4444; }
input:checked + .slider::before { transform: translateX(18px); }
.label-text { font-size: 13px; font-weight: 600; color: #475569; }
.divider { border: 0; border-top: 1px dashed #cbd5e1; margin: 25px 0; }
.post-form { background: #f8fafc; padding: 18px; border-radius: 14px; border: 1px solid #e2e8f0; margin-bottom: 25px; }
.post-form input, .post-form textarea { width: 100%; margin-bottom: 12px; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-family: inherit; font-size: 13px; box-sizing: border-box; outline: none; transition: 0.2s; }
.post-form input:focus, .post-form textarea:focus { border-color: #3b82f6; background: white; }
.post-form textarea { height: 70px; resize: none; }
.btn-post { width: 100%; background: #1a365d; color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 13px; transition: 0.2s; }
.btn-post:hover { background: #3b82f6; }
.post-card { background: white; padding: 15px; border-radius: 12px; margin-bottom: 12px; cursor: pointer; border: 1px solid #e2e8f0; border-left: 4px solid #3b82f6; box-shadow: 0 2px 8px rgba(0,0,0,0.02); transition: 0.2s; }
.post-card:hover { transform: translateX(5px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
.post-tag { font-size: 10px; color: #3b82f6; background: #eff6ff; padding: 4px 8px; border-radius: 4px; font-weight: 800; display: inline-block; margin-bottom: 8px; }
.post-tag.urgent { color: #ef4444; background: #fef2f2; }
.post-card h5 { margin: 0 0 5px 0; font-size: 14px; color: #1e293b; line-height: 1.4; }
.post-card p { margin: 0; font-size: 12px; color: #64748b; }
.empty { text-align: center; font-size: 13px; color: #94a3b8; font-style: italic; margin-top: 20px; }
.btn-float { position: absolute; z-index: 1000; width: 50px; height: 50px; border-radius: 50%; border: none; background: white; color: #1a365d; font-size: 20px; cursor: pointer; box-shadow: 0 4px 15px rgba(0,0,0,0.2); transition: 0.3s; display: flex; align-items: center; justify-content: center; }
.btn-float:hover { background: #1a365d; color: white; transform: scale(1.1); }
.btn-my-location { 
  bottom: 110px; /* Đẩy hẳn lên trên cách nút Zoom một khoảng an toàn */
  right: 15px;   /* Ép sát lề phải cho thẳng hàng với bộ nút Zoom của Leaflet */
}
.toast-notification { position: fixed; bottom: 30px; left: 390px; padding: 15px 25px; border-radius: 10px; font-weight: 600; font-size: 14px; display: flex; align-items: center; gap: 10px; box-shadow: 0 10px 25px rgba(0,0,0,0.3); z-index: 9999; }
.toast-notification.success { background: #10b981; color: white; }
.toast-notification.error { background: #ef4444; color: white; }
.toast-fade-enter-active, .toast-fade-leave-active { transition: all 0.4s ease; }
.toast-fade-enter-from, .toast-fade-leave-to { opacity: 0; transform: translateY(20px) scale(0.9); }
/* KHUNG NHẬP TỌA ĐỘ TÙY CHỈNH */
.coords-editable { 
  display: flex; 
  gap: 10px; 
  margin-bottom: 15px; 
}
.coord-box-input { 
  flex: 1; 
  display: flex; 
  align-items: center; 
  background: #e2e8f0; 
  padding: 8px 12px; 
  border-radius: 8px; 
  border: 1px solid transparent; 
  transition: 0.2s; 
}
.coord-box-input:focus-within { 
  border-color: #3b82f6; 
  background: #fff; 
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}
.coord-box-input label { 
  font-size: 12px; 
  color: #64748b; 
  font-weight: 800; 
  margin-right: 8px; 
}
.coord-box-input input { 
  width: 100%; 
  border: none; 
  background: transparent; 
  font-size: 14px; 
  font-weight: 700; 
  color: #1e293b; 
  outline: none; 
  padding: 0;
  margin: 0;
}
/* Ẩn cái nút tăng giảm số mặc định của trình duyệt cho đẹp */
.coord-box-input input::-webkit-outer-spin-button,
.coord-box-input input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
/* --- HIỆU ỨNG ẨN/HIỆN SIDEBAR --- */
.sidebar {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s;
}

/* Khi bị cất đi: Trượt sang trái 150% và mờ dần */
.sidebar-hidden {
  transform: translateX(-150%);
  opacity: 0;
  pointer-events: none; /* Không cho click trúng khi đang ẩn */
}

/* --- NÚT CẤT SIDEBAR (TRONG HEADER) --- */
.header { position: relative; }
.btn-toggle-sidebar {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  background: #eff6ff;
  border: none;
  color: #3b82f6;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.2s;
}
.btn-toggle-sidebar:hover { background: #dbeafe; }

/* --- NÚT MỞ LẠI SIDEBAR (LƠ LỬNG) --- */
.btn-open-sidebar {
  top: 20px;
  left: -100px; /* Giấu ra ngoài rìa trái màn hình */
  transition: left 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Lệnh gọi nó thò mặt vào trong khi Sidebar đóng */
.btn-open-sidebar.show {
  left: 20px; 
}
</style>