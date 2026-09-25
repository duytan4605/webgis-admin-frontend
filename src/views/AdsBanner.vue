<template>
  <div class="ads-container" v-if="isVisible">
    <div class="ads-banner">
      <span class="ads-badge">GIS - QUẢNG CÁO</span>
      
      <button class="ads-close" @click="isVisible = false" title="Đóng quảng cáo">&times;</button>
      
      <a href="https://www.google.com/business/" target="_blank" rel="noopener noreferrer">
        <img 
          src="/img/quang-cao-google-maps.png" 
          alt="Quảng cáo Google Maps" 
          class="ads-image"
          @error="handleImageError" 
        />
        
        <div class="ads-text-fallback">
          <h3>GOOGLE MAPS ADS</h3>
          <h2>HỆ THỐNG GIS</h2>
          <p>Tối ưu hóa vị trí hiển thị</p>
        </div>
      </a>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdsBanner',
  data() {
    return {
      isVisible: true
    }
  },
  methods: {
    handleImageError(e) {
      e.target.style.display = 'none';
      const fallback = e.target.closest('a').querySelector('.ads-text-fallback');
      if (fallback) fallback.style.display = 'flex';
    }
  }
}
</script>

<style scoped>
.ads-container {
  margin-bottom: 25px; /* Giữ khoảng cách với các nút bên dưới */
  width: 100%; /* Ép nó vừa khít 100% với cái cột 300px của sidebar */
}

.ads-banner {
  position: relative;
  display: block;
  background: #ffffff; 
  border-radius: 12px; 
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); /* Đồng bộ shadow với widget thống kê */
  transition: all 0.3s ease;
}

.ads-banner:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
}

.ads-badge {
  position: absolute;
  top: 0;
  left: 0;
  background: #ef4444; 
  color: white;
  padding: 4px 10px;
  font-size: 10px;
  font-weight: 800;
  border-bottom-right-radius: 8px;
  z-index: 10;
}

.ads-close {
  position: absolute;
  top: 6px;
  right: 6px;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  font-size: 14px;
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ads-close:hover {
  background: #ef4444;
}

.ads-image {
  width: 100%;
  height: auto;
  display: block;
}

.ads-text-fallback {
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 30px 20px;
  color: #f8fafc;
  background: linear-gradient(135deg, #1e293b, #0f172a);
}

.ads-text-fallback h3 { margin: 0; font-size: 12px; color: #3b82f6; }
.ads-text-fallback h2 { margin: 5px 0; font-size: 18px; font-weight: 800; }
.ads-text-fallback p { margin: 0; font-size: 11px; color: #94a3b8; }
</style>