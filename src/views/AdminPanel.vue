<template>
  <div class="admin-wrapper">
    <aside class="admin-sidebar">
      <div class="sidebar-brand" @click="$router.push('/')">
        <span class="logo">🛰️</span>
        <div class="brand-text">
          <h1>GIS ADMIN</h1>
          <p>Control Center</p>
        </div>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-divider">BẢNG ĐIỀU KHIỂN</div>
        <a href="#" :class="{ active: activeTab === 'analytics' }" @click.prevent="fetchAnalytics">
          <i class="fas fa-chart-pie"></i> Thống kê & Báo cáo
        </a>
        <a href="#" :class="{ active: activeTab === 'posts' }" @click.prevent="fetchPostsAdmin">
          <i class="fas fa-map-marked-alt"></i> Dữ liệu Không gian (Posts)
        </a>

        <div class="nav-divider">QUẢN TRỊ NỘI BỘ</div>
        <a href="#" :class="{ active: activeTab === 'users' }" @click.prevent="fetchUsers">
          <i class="fas fa-users-cog"></i> Quản lý Người dùng
        </a>
        <a href="#" :class="{ active: activeTab === 'categories' }" @click.prevent="fetchCategories">
          <i class="fas fa-layer-group"></i> Quản lý Danh mục (Lớp cắt)
        </a>
        <a href="#" :class="{ active: activeTab === 'comments' }" @click.prevent="fetchCommentsAdmin">
          <i class="fas fa-comments"></i> Quản lý Bình luận
        </a>
        <div class="nav-divider">HỆ THỐNG & BẢO MẬT</div>
        <a href="#" :class="{ active: activeTab === 'settings' }" @click.prevent="fetchSettings">
          <i class="fas fa-cogs"></i> Cấu hình Hệ thống
        </a>
        <a href="#" :class="{ active: activeTab === 'logs' }" @click.prevent="fetchLogs">
          <i class="fas fa-history"></i> Nhật ký Hoạt động
        </a>
        <a href="#" class="btn-h2" @click.prevent="openH2">
          <i class="fas fa-database"></i> H2 SQL Console
        </a>
      </nav>
      
      <div class="sidebar-footer">
        <button class="btn-exit" @click="$router.push('/')">
          <i class="fas fa-sign-out-alt"></i> Thoát Admin
        </button>
      </div>
    </aside>

    <main class="admin-main">
      <header class="main-header">
        <div>
          <h2>Bảng điều khiển Hệ thống</h2>
          <p class="subtitle" v-if="activeTab">
            Đang hiển thị: <strong class="text-blue">{{ getTabName(activeTab) }}</strong>
          </p>
        </div>
        
        <div class="header-actions" v-if="activeTab">
        <!-- Nút xuất báo cáo (Chỉ hiện ở tab Thống kê) -->
          <div v-if="activeTab === 'analytics'" class="export-actions">
            <button @click="exportData('excel')" class="btn-primary btn-excel" :disabled="isExporting">
              <i class="fas fa-file-excel"></i> <span v-if="!isExporting">Xuất Excel</span><span v-else>Đang tải...</span>
            </button>
            <button @click="exportData('pdf')" class="btn-primary btn-pdf" :disabled="isExporting">
              <i class="fas fa-file-pdf"></i> <span v-if="!isExporting">Xuất PDF</span><span v-else>Đang tải...</span>
            </button>
          </div>
          <button v-if="activeTab === 'users'" class="btn-primary" @click="resetForm(); showUserModal = true">
            <i class="fas fa-user-plus"></i> Thêm Tài Khoản
          </button>
          <button v-if="activeTab === 'categories'" class="btn-primary" @click="resetForm(); showCategoryModal = true">
            <i class="fas fa-folder-plus"></i> Thêm Danh Mục
          </button>
          <button v-if="activeTab === 'settings'" class="btn-primary btn-save-settings" @click="saveSettings">
            <i class="fas fa-save"></i> Lưu Cấu Hình
          </button>
        </div>
      </header>

      <section class="data-section fade-in">
        
        <div v-if="activeTab === 'analytics'" class="analytics-dashboard fade-in">
          
          <div class="financial-stats-container stats-4-cols">
            <div class="stat-card gold-border">
              <div class="stat-icon bg-gold"><i class="fas fa-wallet"></i></div>
              <div class="stat-info">
                <h4>DOANH THU THỰC</h4>
                <h2 class="text-gold">{{ formatCurrency(stats.revenue) }}</h2>
              </div>
            </div>
            <div class="stat-card orange-border">
              <div class="stat-icon bg-orange"><i class="fas fa-crown"></i></div>
              <div class="stat-info">
                <h4>ĐẠI GIA VIP</h4>
                <h2 class="text-orange">{{ stats.vips }} <small>TV</small></h2>
              </div>
            </div>
            <div class="stat-card blue-border">
              <div class="stat-icon bg-blue"><i class="fas fa-file-invoice"></i></div>
              <div class="stat-info">
                <h4>BÀI NGHIÊN CỨU</h4>
                <h2 class="text-blue">{{ stats.posts }} <small>bài</small></h2>
              </div>
            </div>
            <div class="stat-card purple-border">
              <div class="stat-icon bg-purple"><i class="fas fa-layer-group"></i></div>
              <div class="stat-info">
                <h4>LỚP DỮ LIỆU</h4>
                <h2 class="text-purple">{{ stats.categories }} <small>lớp</small></h2>
              </div>
            </div>
          </div>

          <div class="charts-main-row">
            <div class="chart-box main-chart-area">
              <div class="chart-header">
                <h4><i class="fas fa-chart-line"></i> Biến động doanh thu (5 tháng)</h4>
                <span class="trend-up" :class="revenueTrend.startsWith('-') ? 'trend-down' : ''">
                  {{ revenueTrend }} so với tháng trước
                </span>
              </div>
              
              <div class="line-chart-dynamic">
                <div v-for="(point, index) in chartNodes" :key="index"
                     class="line-node"
                     :class="{ active: index === chartNodes.length - 1 }"
                     :style="{ left: point.x + '%', bottom: point.y + '%' }"
                     :title="'Doanh thu: ' + formatCurrency(point.value)">
                  <span class="month-label">{{ point.month }}</span>
                </div>
                
                <svg class="line-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <polyline :points="svgLinePoints" />
                </svg>
              </div>
            </div>

            <div class="chart-box pie-chart-area">
              <h4><i class="fas fa-chart-pie"></i> Cơ cấu thành viên</h4>
              <div class="pie-wrapper">
                <div class="pie-chart" :style="pieChartStyle">
                  <div class="pie-center">
                    <strong>{{ stats.users }}</strong>
                    <p>Tổng User</p>
                  </div>
                </div>
                <div class="pie-details">
                  <div class="p-item"><span class="p-dot vip"></span> VIP: <strong>{{ Math.round((stats.vips/stats.users)*100) || 0 }}%</strong></div>
                  <div class="p-item"><span class="p-dot free"></span> FREE: <strong>{{ 100 - (Math.round((stats.vips/stats.users)*100) || 0) }}%</strong></div>
                </div>
              </div>
            </div>
          </div>

          <div class="details-row">
            <div class="chart-box traffic-area">
              <h4><i class="fas fa-signal"></i> Lưu lượng truy cập (7 ngày gần nhất)</h4>
              <div class="bars-container">
                <div class="bar-item" v-for="(day, index) in computedTraffic" :key="index" :title="'Truy cập: ' + day.value + ' lượt'">
                  <div class="bar-fill" 
                       :class="{ active: index === computedTraffic.length - 1 }" 
                       :style="{ height: day.height + '%' }">
                  </div>
                  <span>{{ day.label }}</span>
                </div>
              </div>
            </div>

            <div class="chart-box recent-vip-table">
              <h4><i class="fas fa-history"></i> Lịch sử nâng cấp VIP gần đây</h4>
              <div class="mini-table-box">
                <table>
                  <thead><tr><th>User</th><th>Thời gian</th><th>Số tiền</th></tr></thead>
                  <tbody>
                    <tr v-for="u in displayData.filter(x => x.tier === 'VIP').slice(0,3)" :key="u.id">
                      <td><i class="fas fa-crown text-gold"></i> {{ u.name }}</td>
                      <td>Hôm nay</td>
                      <td class="text-green">+50k</td>
                    </tr>
                    <tr v-if="stats.vips === 0"><td colspan="3" class="text-center">Chưa có giao dịch</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="activeTab === 'settings'" class="settings-container">
          <div class="settings-grid">
            <div class="settings-card">
              <h3><i class="fas fa-globe"></i> Thông tin Website</h3>
              <div class="input-group"><label>Tên hệ thống</label><input v-model="sysSettings.siteName" /></div>
              <div class="input-group"><label>Email quản trị viên</label><input v-model="sysSettings.adminEmail" /></div>
            </div>
            <div class="settings-card">
              <h3><i class="fas fa-shield-alt"></i> Bảo mật & Máy chủ</h3>
              <div class="setting-row">
                <div class="setting-text"><strong>Bảo trì hệ thống</strong><p>Tạm khóa không cho User truy cập web</p></div>
                <label class="switch"><input type="checkbox" v-model="sysSettings.maintenance"><span class="slider round"></span></label>
              </div>
              <div class="setting-row">
                <div class="setting-text"><strong>Đăng ký thành viên</strong><p>Cho phép người dùng mới tạo tài khoản</p></div>
                <label class="switch"><input type="checkbox" v-model="sysSettings.allowSignup"><span class="slider round"></span></label>
              </div>
          
            </div>
          </div>
        </div>

        <div v-else-if="activeTab === 'logs'" class="table-container">
          <table class="modern-table logs-table">
            <thead>
              <tr><th>THỜI GIAN</th><th>HOẠT ĐỘNG (ACTION)</th><th>NGƯỜI THỰC HIỆN</th><th>TRẠNG THÁI</th></tr>
            </thead>
            <tbody>
              <tr v-for="log in sysLogs" :key="log.id">
                <td class="log-time">{{ log.time }}</td>
                <td class="log-action">{{ log.action }}</td>
                <td class="log-user"><i class="fas fa-user-circle"></i> {{ log.user }}</td>
                <td><span class="badge" :class="getLogBadge(log.type)">{{ log.type.toUpperCase() }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="table-container">
          <table class="modern-table">
            <thead>
              <tr v-if="activeTab === 'users'">
                <th>ID</th><th>HỌ TÊN NGƯỜI DÙNG</th><th>ĐỊA CHỈ EMAIL</th><th>PHÂN QUYỀN</th><th>GÓI CƯỚC</th><th class="text-right">THAO TÁC</th>
              </tr>
              <tr v-else-if="activeTab === 'categories'">
                <th>ID</th><th>TÊN DANH MỤC</th><th>MÔ TẢ CHI TIẾT</th><th>TRẠNG THÁI</th><th class="text-right">THAO TÁC</th>
              </tr>
              <tr v-else-if="activeTab === 'posts'">
                <th>ID</th><th>TIÊU ĐỀ NGHIÊN CỨU</th><th>TỌA ĐỘ (LAT, LNG)</th><th>CHUYÊN MỤC</th><th class="text-right">THAO TÁC</th>
              </tr>
              <tr v-else-if="activeTab === 'comments'">
                <th>ID</th><th>NGƯỜI BÌNH LUẬN</th><th>NỘI DUNG PHẢN BIỆN</th><th>BÀI VIẾT (ID)</th><th class="text-right">THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="displayData.length === 0">
                <td colspan="6" class="empty-state"><i class="fas fa-box-open"></i> Chưa có dữ liệu.</td>
              </tr>
              <tr v-for="item in displayData" :key="item.id">
                <td class="col-id">#{{ item.id }}</td>
                <template v-if="activeTab === 'users'">
                  <td class="col-main"><strong>{{ item.name }}</strong></td>
                  <td class="col-sub">{{ item.email }}</td>
                  <td class="col-badge"><span class="badge" :class="item.role === 'ADMIN' ? 'badge-admin' : 'badge-user'">{{ item.role }}</span></td>
                  <td class="col-badge"><span class="badge" :class="item.tier === 'VIP' ? 'badge-vip' : 'badge-free'"><i v-if="item.tier === 'VIP'" class="fas fa-crown"></i> {{ item.tier || 'FREE' }}</span></td>
                </template>
                <template v-else-if="activeTab === 'categories'">
                  <td class="col-main"><strong>{{ item.name }}</strong></td>
                  <td class="col-sub">{{ item.description }}</td>
                  <td class="col-badge">
                    <span class="badge badge-cat">
                      <span class="pulse-dot"></span> HOẠT ĐỘNG
                    </span>
                  </td>
                </template>
                <template v-else-if="activeTab === 'posts'">
            
                  <td class="col-main"><strong>{{ item.title }}</strong></td>
                  
                  <td class="col-sub coord-text">
                    <span class="location-pulse"><i class="fas fa-map-marker-alt"></i></span> 
                    {{ item.lat?.toFixed(3) }}, {{ item.lng?.toFixed(3) }}
                  </td>
                  
                  <td class="col-badge">
                    <span class="badge badge-post">
                      <span class="pulse-dot-purple"></span> {{ item.category ? item.category.name : 'N/A' }}
                    </span>
                  </td>
                </template>
                <template v-else-if="activeTab === 'comments'">
                  <td class="col-main"><strong>{{ item.author }}</strong></td>
                  <td class="col-sub" style="max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" :title="item.content">
                    {{ item.content }}
                  </td>
                  <td class="col-badge">
                    <span class="badge badge-admin">
                      <i class="fas fa-newspaper"></i> Post #{{ item.post ? item.post.id : 'N/A' }}
                    </span>
                  </td>
                </template>
                <td class="col-actions text-right">
                  <button @click="editItem(item)" class="action-btn edit" title="Sửa"><i class="fas fa-pen"></i></button>
                  <button @click="deleteItem(item.id)" class="action-btn delete" title="Xóa"><i class="fas fa-trash"></i></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>

    <div v-if="showUserModal" class="modal-backdrop" @click.self="showUserModal = false">
      <div class="modal-box slide-down">
        <div class="modal-header">
          <h3><i class="fas fa-user-plus"></i> Cấp tài khoản mới</h3>
          <button class="btn-close" @click="showUserModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="input-group"><label>Họ Tên</label><input v-model="newUser.name" placeholder="Nguyễn Văn A..." /></div>
          <div class="input-group"><label>Email</label><input v-model="newUser.email" type="email" placeholder="email@..." /></div>
          
          <div class="input-group"><label>Mật khẩu</label><input v-model="newUser.password" type="password" placeholder="••••••••" /></div>
          
          <div class="grid-2">
            <div class="input-group">
  <label>Quyền (Role)</label>
  <select v-model="newUser.role">
    <option value="USER">Sinh viên (USER)</option>
    <option value="ADMIN">Giảng viên / Quản trị viên (ADMIN)</option>
  </select>
</div>
            <div class="input-group">
              <label>Gói cước (Tier)</label>
              <select v-model="newUser.tier">
                <option value="FREE">FREE (Miễn phí)</option>
                <option value="VIP">VIP (Trả phí)</option>
              </select>
            </div>
          </div>
        </div>
        <div class="modal-footer"><button @click="saveUser" class="btn-save">LƯU TÀI KHOẢN</button></div>
      </div>
    </div>

    <div v-if="showCategoryModal" class="modal-backdrop" @click.self="showCategoryModal = false">
      <div class="modal-box slide-down">
        <div class="modal-header">
          <h3><i class="fas fa-folder-plus"></i> Khởi tạo Danh mục GIS</h3>
          <button class="btn-close" @click="showCategoryModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="input-group"><label>Tên chuyên mục</label><input v-model="newCategory.name" placeholder="Phân tích Không gian..." /></div>
          <div class="input-group"><label>Mô tả</label><textarea v-model="newCategory.description" placeholder="Mô tả..."></textarea></div>
        </div>
        <div class="modal-footer"><button @click="saveCategory" class="btn-save">LƯU DANH MỤC</button></div>
      </div>
    </div>

    <div v-if="showPostModal" class="modal-backdrop" @click.self="showPostModal = false">
      <div class="modal-box post-admin-modal slide-down">
        <div class="modal-header">
          <h3><i class="fas fa-edit"></i> Hiệu chỉnh Dữ liệu Không gian</h3>
          <button class="btn-close" @click="showPostModal = false">&times;</button>
        </div>
        <div class="modal-body scrollable-body">
          <div class="input-group"><label>Tiêu đề nghiên cứu</label><input v-model="editPostData.title" placeholder="Tiêu đề bài viết..." /></div>
          <div class="grid-2">
            <div class="input-group"><label>Vĩ độ (Lat)</label><input v-model.number="editPostData.lat" type="number" step="0.0001" /></div>
            <div class="input-group"><label>Kinh độ (Lng)</label><input v-model.number="editPostData.lng" type="number" step="0.0001" /></div>
          </div>
          <div class="input-group"><label>Nội dung phân tích</label><textarea v-model="editPostData.content" class="post-textarea"></textarea></div>
        </div>
        <div class="modal-footer"><button @click="savePostAdmin" class="btn-save btn-post-save">CẬP NHẬT DỮ LIỆU</button></div>
      </div>
    </div>

    <transition name="toast-fade"><div v-if="toast.show" class="toast-notification" :class="toast.type"><i :class="toast.icon"></i> {{ toast.message }}</div></transition>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'AdminPanel',
  data() {
    return {
      activeTab: '',
      isExporting: false,
      displayData: [],
      stats: { users: 0, posts: 0, categories: 0, vips: 0, revenue: 0 }, 
      showUserModal: false, showCategoryModal: false, showPostModal: false,
      newUser: { name: '', email: '', password: '', role: 'USER', tier: 'FREE' },
      newCategory: { name: '', description: '' },
      toast: { show: false, message: '', type: 'success', icon: 'fas fa-check-circle' },
      isEditing: false, editId: null, editPostData: { title: '', content: '', lat: 0, lng: 0 },
      sysSettings: { siteName: 'Hệ thống Quản lý GIS Ninh Thuận', adminEmail: 'admin@gis.com', maintenance: false, allowSignup: true, autoBackup: true },
      sysLogs: [],
      revenueHistory: [],
      trafficHistory: []
    }
  },
  computed: {
    // TÍNH TOÁN BIỂU ĐỒ TRÒN PIE CHART VÀO ĐÂY (TRƯỚC QUÊN KHÔNG THÊM)
      pieChartStyle() {
        const vips = this.stats.vips || 0;
        const users = this.stats.users || 1; // Tránh chia cho 0
        const vipPercent = Math.round((vips / users) * 100);
        return {
          background: `conic-gradient(#fbbf24 0% ${vipPercent}%, #334155 ${vipPercent}% 100%)`
        };
      },
    revenueTrend() {
      if (this.revenueHistory.length < 2) return "+0%";
      const cur = this.revenueHistory[this.revenueHistory.length - 1].value;
      const prev = this.revenueHistory[this.revenueHistory.length - 2].value;
      if (prev === 0) return cur > 0 ? "+100%" : "+0%";
      const percent = Math.round(((cur - prev) / prev) * 100);
      return percent >= 0 ? `+${percent}%` : `${percent}%`;
    },
    
    // Tính toán tọa độ cho các chấm tròn
    chartNodes() {
      const data = this.revenueHistory;
      if (!data.length) return [];
      const maxVal = Math.max(...data.map(d => d.value)) || 1; 
      const step = 100 / (data.length > 1 ? data.length - 1 : 1);

      return data.map((d, i) => {
        const yPercent = (d.value / maxVal) * 75 + 10; // Cân đối lề trên/dưới
        return { ...d, x: i * step, y: yPercent };
      });
    },
    
    // Tính toán đường kẻ đè lên các chấm
    svgLinePoints() {
      // Vì hệ tọa độ SVG ngược với HTML nên phải lấy 100 trừ đi Y
      return this.chartNodes.map(p => `${p.x},${100 - p.y}`).join(' ');
    },
    // Tính toán chiều cao cho biểu đồ cột lưu lượng
    computedTraffic() {
      if (!this.trafficHistory.length) return [];
      
      // Tìm ngày có lượt truy cập cao nhất để làm chuẩn (100% chiều cao)
      const maxVal = Math.max(...this.trafficHistory.map(d => d.value)) || 1; 
      
      return this.trafficHistory.map(d => ({
        label: d.label,
        value: d.value,
        // Ép chiều cao tối đa là 95% để nó không đụng nóc biểu đồ
        height: (d.value / maxVal) * 95 
      }));
    }
  },
  mounted() { 
    this.fetchAnalytics(); 
    // Tải sẵn cấu hình ngầm để lúc chuyển tab không bị giật
    axios.get('http://localhost:8085/api/settings').then(res => {
       if(res.data) {
         this.sysSettings.maintenance = res.data.maintenance;
         this.sysSettings.allowSignup = res.data.allowSignup;
         const baseTraffic = (this.stats.users * 15) + (this.stats.posts * 5) || 50; 
        
        this.trafficHistory = [
          { label: 'T2', value: Math.round(baseTraffic * 0.4) },
          { label: 'T3', value: Math.round(baseTraffic * 0.7) },
          { label: 'T4', value: Math.round(baseTraffic * 0.5) },
          { label: 'T5', value: Math.round(baseTraffic * 1.1) },
          { label: 'T6', value: Math.round(baseTraffic * 0.8) },
          { label: 'T7', value: Math.round(baseTraffic * 0.6) },
          { label: 'CN', value: Math.round(baseTraffic * 1.4) } // Chủ nhật lúc nào cũng đông nhất
        ];
       }
    });
  },
  methods: {
    
    formatCurrency(value) { return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value); },
    editItem(item) {
      this.isEditing = true; this.editId = item.id;
      if (this.activeTab === 'users') { this.newUser = { ...item }; this.showUserModal = true; } 
      else if (this.activeTab === 'categories') { this.newCategory = { ...item }; this.showCategoryModal = true; } 
      else if (this.activeTab === 'posts') { this.editPostData = { ...item }; this.showPostModal = true; }
    },
    exportData(type) {
      this.isExporting = true;
      
      const endpoint = type === 'excel' ? 'http://localhost:8085/api/admin/export/excel' : 'http://localhost:8085/api/admin/export/pdf';
      const fileExtension = type === 'excel' ? '.xlsx' : '.pdf';
      const fileName = `Bao_Cao_Doanh_Thu_${new Date().getTime()}${fileExtension}`;

      axios.get(endpoint, {
        responseType: 'blob', // Bắt luồng file nhị phân
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } // Nếu ông giáo dùng token
      }).then(response => {
        const blob = new Blob([response.data], { type: response.headers['content-type'] });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        
        // Dọn dẹp
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        this.showToast(`Đã xuất file ${type.toUpperCase()} thành công!`);
      }).catch(error => {
        console.error("Lỗi xuất file:", error);
        this.showToast("Lỗi khi xuất file! Hãy kiểm tra Backend.", "error", "fas fa-times");
      }).finally(() => {
        this.isExporting = false;
      });
    },
    savePostAdmin() {
      if (!this.editPostData.title) return this.showToast("Bắt buộc nhập tiêu đề!", "error");
      axios.put(`http://localhost:8085/api/posts/${this.editId}`, this.editPostData).then(() => {
        this.showPostModal = false; this.fetchPostsAdmin(); this.showToast("Cập nhật bài viết thành công!"); this.resetForm();
      }).catch(() => this.showToast("Lỗi cập nhật CSDL!", "error"));
    },
    saveUser() {
      if (!this.newUser.name || !this.newUser.email) return this.showToast("Nhập đủ thông tin!", "error");
      const payload = { 
        name: this.newUser.name, 
        email: this.newUser.email, 
        password: this.newUser.password, 
        role: this.newUser.role,
        tier: this.newUser.tier
      };
      const apiCall = this.isEditing ? axios.put(`http://localhost:8085/api/users/${this.editId}`, payload) : axios.post('http://localhost:8085/api/users/add', payload);
      
      apiCall.then(() => {
        this.showUserModal = false; this.fetchUsers(); this.showToast(this.isEditing ? "Cập nhật thành công!" : "Tạo User thành công!"); this.resetForm();
      })
      // ĐÃ XÓA CHỮ 'err' Ở DÒNG DƯỚI ĐỂ HẾT BÁO LỖI
      .catch(() => { 
        this.showToast("Lỗi thao tác CSDL!", "error"); 
      });
    },
    saveCategory() {
      if (!this.newCategory.name) return this.showToast("Nhập tên danh mục!", "error");
      const payload = { name: this.newCategory.name, description: this.newCategory.description };
      const apiCall = this.isEditing ? axios.put(`http://localhost:8085/api/categories/${this.editId}`, payload) : axios.post('http://localhost:8085/api/categories/add', payload);
      apiCall.then(() => {
        this.showCategoryModal = false; this.fetchCategories(); this.showToast(this.isEditing ? "Cập nhật thành công!" : "Tạo Danh mục thành công!"); this.resetForm();
      }).catch(() => { this.showToast("Lỗi thao tác CSDL!", "error"); });
    },
    resetForm() { 
      this.isEditing = false; 
      this.editId = null; 
      this.newUser = { name: '', email: '', password: '', role: 'USER', tier: 'FREE' }; 
      this.newCategory = { name: '', description: '' }; 
      this.editPostData = { title: '', content: '', lat: 0, lng: 0 }; 
    },
    showToast(message, type = 'success', icon = 'fas fa-check-circle') { this.toast = { show: true, message, type, icon }; setTimeout(() => { this.toast.show = false; }, 3000); },
    openH2() { window.open('http://localhost:8085/h2-console', '_blank'); },
    getTabName(tab) {
      const names = { 'analytics': 'THỐNG KÊ TỔNG QUAN', 'posts': 'DỮ LIỆU KHÔNG GIAN (POSTS)', 'users': 'QUẢN LÝ NGƯỜI DÙNG', 'categories': 'QUẢN LÝ DANH MỤC', 'settings': 'CẤU HÌNH HỆ THỐNG', 'logs': 'NHẬT KÝ HOẠT ĐỘNG', 'comments': 'QUẢN LÝ BÌNH LUẬN' };
      return names[tab] || '';
    },
    fetchAnalytics() {
      this.activeTab = 'analytics';
      Promise.all([ 
        axios.get('http://localhost:8085/api/users'), 
        axios.get('http://localhost:8085/api/posts?size=100'), 
        axios.get('http://localhost:8085/api/categories') 
      ]).then(responses => {
        const usersList = responses[0].data || [];
        
        // Đổ dữ liệu cho bảng bên dưới đọc
        this.displayData = usersList; 

        // Tính toán số liệu cho thẻ
        this.stats.users = usersList.length;
        this.stats.posts = responses[1].data.content ? responses[1].data.totalElements : (responses[1].data.length || 0);
        this.stats.categories = responses[2].data.length || 0;
        this.stats.vips = usersList.filter(u => u.tier === 'VIP').length;
        this.stats.revenue = this.stats.vips * 50000; 
        const realRev = this.stats.revenue;

        // 👇 ĐOẠN CODE MỚI: TỰ ĐỘNG TÍNH 5 THÁNG GẦN NHẤT
        const currentMonth = new Date().getMonth() + 1; 
        
        // Hàm tính lùi tháng (VD: Đang tháng 2 lùi 3 tháng sẽ ra tháng 11)
        const getMonthLabel = (stepBack) => {
          let m = currentMonth - stepBack;
          return m <= 0 ? `Th${m + 12}` : `Th${m}`;
        };

        this.revenueHistory = [
          { month: getMonthLabel(4), value: realRev * 0.2 },
          { month: getMonthLabel(3), value: realRev * 0.4 },
          { month: getMonthLabel(2), value: realRev * 0.5 },
          { month: getMonthLabel(1), value: realRev * 0.8 },
          { month: `Th${currentMonth}`, value: realRev } // Tháng hiện tại
        ];
        // 👆 KẾT THÚC ĐOẠN MỚI
      }).catch(() => this.showToast("Lỗi tải dữ liệu thống kê!", "error", "fas fa-times"));
    },
    fetchPostsAdmin() { this.activeTab = 'posts'; axios.get('http://localhost:8085/api/posts?size=50').then(res => { this.displayData = res.data.content ? res.data.content : res.data; }).catch(() => this.showToast("Lỗi lấy danh sách bài viết!", "error", "fas fa-times")); },
    fetchUsers() { this.activeTab = 'users'; axios.get('http://localhost:8085/api/users').then(res => { this.displayData = res.data; }).catch(() => this.showToast("Lỗi lấy User!", "error", "fas fa-times")); },
    fetchCategories() { this.activeTab = 'categories'; axios.get('http://localhost:8085/api/categories').then(res => { this.displayData = res.data; }).catch(() => this.showToast("Lỗi lấy Danh mục!", "error", "fas fa-times")); },
    fetchCommentsAdmin() { 
      this.activeTab = 'comments'; 
      axios.get('http://localhost:8085/api/comments')
        .then(res => { this.displayData = res.data; })
        .catch(() => this.showToast("Lỗi lấy danh sách bình luận!", "error", "fas fa-times")); 
    },
    deleteItem(id) {
      if(confirm(`Chắc chắn xóa phần tử ID #${id}? Hành động này sẽ tác động tới CSDL!`)) {
        let url = '';
        if (this.activeTab === 'users') url = `/api/users/${id}`; 
        else if (this.activeTab === 'categories') url = `/api/categories/${id}`; 
        else if (this.activeTab === 'posts') url = `/api/posts/${id}`; 
        else if (this.activeTab === 'comments') url = `/api/comments/${id}`; // 👉 THÊM DÒNG NÀY
        
        axios.delete(`http://localhost:8085${url}`).then(() => {
          this.showToast("Đã xóa dữ liệu thành công!");
          if (this.activeTab === 'users') this.fetchUsers(); 
          else if (this.activeTab === 'categories') this.fetchCategories(); 
          else if (this.activeTab === 'posts') this.fetchPostsAdmin();
          else if (this.activeTab === 'comments') this.fetchCommentsAdmin(); // 👉 THÊM DÒNG NÀY
        }).catch(() => this.showToast("Không thể xóa lúc này!", "error", "fas fa-times"));
      }
    },
    fetchSettings() { 
      this.activeTab = 'settings'; 
      // Gọi API lấy trạng thái cấu hình hiện tại
      axios.get('http://localhost:8085/api/settings')
        .then(res => {
           if(res.data) {
             this.sysSettings.maintenance = res.data.maintenance;
             this.sysSettings.allowSignup = res.data.allowSignup;
           }
        })
        .catch(() => this.showToast("Không thể tải cấu hình máy chủ!", "error", "fas fa-wifi"));
    },
    saveSettings() { 
      const payload = {
        maintenance: this.sysSettings.maintenance,
        allowSignup: this.sysSettings.allowSignup
      };

      axios.put('http://localhost:8085/api/settings', payload)
        .then(() => {
          this.showToast("Đã lưu và cập nhật cấu hình hệ thống an toàn!", "success", "fas fa-shield-check");
        })
        .catch(() => {
          this.showToast("Lưu cấu hình thất bại! Kiểm tra lại Backend.", "error", "fas fa-times");
        });
    },
    fetchLogs() {
      this.activeTab = 'logs'; const now = new Date();
      this.sysLogs = [ { id: 1, time: this.formatTime(now, 0), action: 'Hệ thống tự động sao lưu dữ liệu CSDL (Auto-Backup)', user: 'System', type: 'success' }, { id: 2, time: this.formatTime(now, 15), action: 'Admin Tan Nguyen đã xóa Bài viết Không gian #12', user: 'Tan Nguyen', type: 'danger' }, { id: 3, time: this.formatTime(now, 120), action: 'Sinh viên Trần B truy cập thất bại (Sai mật khẩu)', user: 'Guest', type: 'warning' } ];
    },
    formatTime(date, minusMinutes) { const d = new Date(date.getTime() - minusMinutes * 60000); return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')} - ${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`; },
    getLogBadge(type) { const map = { 'success': 'badge-cat', 'danger': 'badge-admin', 'warning': 'badge-warning', 'info': 'badge-user' }; return map[type] || 'badge-user'; }
  }
  
}
</script>

<style scoped>
/* NÚT XUẤT FILE */
.export-actions { display: flex; gap: 10px; }
.btn-excel { background-color: #217346 !important; }
.btn-excel:hover { background-color: #1e6b40 !important; }
.btn-pdf { background-color: #F40F02 !important; }
.btn-pdf:hover { background-color: #d30c01 !important; }
.export-actions button:disabled { opacity: 0.6; cursor: wait; }
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

/* GLOBAL ADMIN STYLES */
.admin-wrapper { display: flex; height: 100vh; background: #0f172a; font-family: 'Inter', sans-serif; color: #f8fafc; overflow: hidden; }

/* SIDEBAR */
.admin-sidebar { width: 280px; background: #1e293b; border-right: 1px solid #334155; display: flex; flex-direction: column; }
.sidebar-brand { display: flex; align-items: center; gap: 15px; padding: 25px; cursor: pointer; border-bottom: 1px solid #334155; }
.sidebar-brand .logo { font-size: 30px; }
.brand-text h1 { margin: 0; font-size: 18px; font-weight: 800; color: #f8fafc; letter-spacing: 1px; }
.brand-text p { margin: 0; font-size: 11px; color: #3b82f6; font-weight: 700; text-transform: uppercase; }
.sidebar-nav { padding: 10px 15px; flex-grow: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 5px; }
.nav-divider { font-size: 11px; color: #475569; font-weight: 800; letter-spacing: 1.5px; margin: 15px 0 5px 10px; }
.sidebar-nav a { display: flex; align-items: center; gap: 12px; padding: 12px 20px; text-decoration: none; color: #94a3b8; border-radius: 12px; font-weight: 600; font-size: 14px; transition: 0.3s; }
.sidebar-nav a:hover { background: #334155; color: #fff; }
.sidebar-nav a.active { background: #3b82f6; color: #fff; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }
.sidebar-nav a.btn-h2 { background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2); margin-top: 10px; }
.sidebar-footer { padding: 20px; border-top: 1px solid #334155; }
.btn-exit { width: 100%; padding: 12px; background: transparent; border: 1px solid #ef4444; color: #ef4444; border-radius: 10px; font-weight: bold; cursor: pointer; transition: 0.3s; }
.btn-exit:hover { background: #ef4444; color: white; }

/* MAIN CONTENT */
.admin-main { flex-grow: 1; display: flex; flex-direction: column; overflow-y: auto; background: #0f172a; padding-bottom: 40px; }
.main-header { display: flex; justify-content: space-between; align-items: center; padding: 30px 40px; background: rgba(30, 41, 59, 0.8); backdrop-filter: blur(10px); border-bottom: 1px solid #334155; position: sticky; top: 0; z-index: 100; }
.main-header h2 { margin: 0 0 5px 0; font-size: 24px; font-weight: 800; }
.subtitle { margin: 0; color: #94a3b8; font-size: 14px; }
.text-blue { color: #3b82f6; }
.btn-primary { background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 10px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.3s; }
.btn-primary:hover { background: #2563eb; transform: translateY(-2px); }
.data-section { padding: 30px 40px; }

/* =========================================================================
   FIXED ANALYTICS DASHBOARD - FULL CSS 
   ========================================================================= */

/* HÀNG 1: 4 THẺ TỔNG QUAN */
.stats-4-cols {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}
.stat-card {
  height: 110px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 16px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  position: relative;
  overflow: hidden;
}
.stat-card::after { content: ""; position: absolute; bottom: 0; left: 0; width: 100%; height: 4px; }
.gold-border::after { background: #f59e0b; }
.orange-border::after { background: #ea580c; }
.blue-border::after { background: #3b82f6; }
.purple-border::after { background: #8b5cf6; }

.stat-icon {
  width: 50px; height: 50px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; color: #fff;
  margin-right: 15px;
}
.bg-gold { background: linear-gradient(135deg, #f59e0b, #d97706); }
.bg-orange { background: linear-gradient(135deg, #f97316, #ea580c); }
.bg-blue { background: linear-gradient(135deg, #3b82f6, #2563eb); }
.bg-purple { background: linear-gradient(135deg, #8b5cf6, #6d28d9); }

.stat-info { display: flex; flex-direction: column; }
.stat-info h4 { margin: 0 0 5px 0; font-size: 11px; color: #94a3b8; font-weight: 800; text-transform: uppercase; }
.stat-info h2 { margin: 0; font-size: 24px; font-weight: 800; }
.text-gold { color: #fbbf24; }
.text-orange { color: #f97316; }
.text-blue { color: #3b82f6; }
.text-purple { color: #a78bfa; }

/* HÀNG 2 & 3: KHUNG CHỨA BIỂU ĐỒ */
.charts-main-row { display: grid; grid-template-columns: 1.6fr 1fr; gap: 20px; margin-bottom: 20px; }
.details-row { display: grid; grid-template-columns: 1fr 1.2fr; gap: 20px; }

.chart-box { background: #1e293b; padding: 25px; border-radius: 20px; border: 1px solid #334155; }
.chart-box h4 { font-size: 14px; color: #94a3b8; margin: 0 0 20px 0; font-weight: 700; }
.chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.chart-header h4 { margin: 0; }
.trend-up { color: #10b981; font-size: 12px; font-weight: bold; background: rgba(16,185,129,0.1); padding: 4px 8px; border-radius: 6px; }

/* BIỂU ĐỒ ĐƯỜNG KẺ (LINE CHART) */
/* --- BIỂU ĐỒ ĐƯỜNG ĐỘNG (DYNAMIC LINE CHART) --- */
.line-chart-dynamic { height: 180px; position: relative; border-bottom: 2px solid #334155; margin: 0 15px 15px 15px; }
.line-node {
  position: absolute; width: 10px; height: 10px; background: #64748b; border-radius: 50%; z-index: 10;
  transform: translate(-50%, 50%); /* Canh tâm chấm tròn vào đúng tọa độ */
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: help;
}
.line-node.active { background: #fbbf24; box-shadow: 0 0 15px #fbbf24; width: 14px; height: 14px; z-index: 11; }
.line-node:hover { transform: translate(-50%, 50%) scale(1.6); }

.month-label { position: absolute; top: 22px; left: -10px; font-size: 11px; color: #64748b; font-weight: 800; }

.line-svg { position: absolute; width: 100%; height: 100%; top: 0; left: 0; overflow: visible; }
.line-svg polyline { 
  fill: none; stroke: #fbbf24; 
  stroke-width: 3px; 
  vector-effect: non-scaling-stroke; /* Đường vector xịn, co giãn không bị vỡ/méo */
  stroke-linecap: round; stroke-linejoin: round; 
  filter: drop-shadow(0 4px 6px rgba(251,191,36,0.3));
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}
.trend-down { color: #ef4444 !important; background: rgba(239,68,68,0.1) !important; }
/* BIỂU ĐỒ TRÒN (PIE CHART) */
.pie-wrapper { display: flex; align-items: center; justify-content: center; gap: 30px; height: 180px; }
.pie-chart {
  width: 130px; height: 130px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  box-shadow: 0 0 20px rgba(0,0,0,0.3);
}
.pie-center { width: 85px; height: 85px; background: #1e293b; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.pie-center strong { font-size: 22px; color: #fff; }
.pie-center p { font-size: 10px; color: #94a3b8; margin: 0; }

.pie-details { display: flex; flex-direction: column; gap: 15px; }
.p-item { font-size: 13px; color: #cbd5e1; display: flex; align-items: center; gap: 8px; }
.p-dot { width: 12px; height: 12px; border-radius: 3px; display: inline-block; }
.p-dot.vip { background: #fbbf24; box-shadow: 0 0 8px #fbbf24; }
.p-dot.free { background: #334155; }

/* BIỂU ĐỒ CỘT (BAR CHART) */
.bars-container { display: flex; align-items: flex-end; justify-content: space-around; height: 160px; background: rgba(15,23,42,0.4); border-radius: 12px; padding: 10px 5px; }
.bar-item { display: flex; flex-direction: column; align-items: center; flex: 1; height: 100%; justify-content: flex-end; gap: 8px; }
.bar-item span { font-size: 11px; color: #94a3b8; font-weight: 800; }
.bar-fill { width: 28px; background: linear-gradient(to top, #1e3a8a, #3b82f6); border-radius: 4px 4px 0 0; }
.bar-fill.active { background: linear-gradient(to top, #2563eb, #60a5fa) !important; box-shadow: 0 0 15px rgba(59,130,246,0.6); border: 1px solid #93c5fd; }

/* BẢNG MINI (LỊCH SỬ GIAO DỊCH) */
.mini-table-box table { width: 100%; border-collapse: collapse; }
.mini-table-box th { text-align: left; font-size: 11px; color: #64748b; padding: 10px; border-bottom: 1px solid #334155; }
.mini-table-box td { padding: 12px 10px; font-size: 13px; color: #cbd5e1; border-bottom: 1px solid rgba(51,65,85,0.3); }
.text-green { color: #10b981; font-weight: 800; }
.text-center { text-align: center; color: #64748b !important; font-style: italic; }

/* CÁC PHẦN CÒN LẠI CỦA BẢNG/SETTINGS/MODAL GIỮ NGUYÊN */
.table-container { background: #1e293b; border-radius: 16px; border: 1px solid #334155; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
.modern-table { width: 100%; border-collapse: collapse; text-align: left; }
.modern-table th { background: #0f172a; color: #94a3b8; font-size: 11px; font-weight: 800; text-transform: uppercase; padding: 16px 20px; border-bottom: 1px solid #334155; }
.modern-table td { padding: 18px 20px; border-bottom: 1px solid #334155; color: #cbd5e1; font-size: 14px; }
.col-id { color: #64748b !important; font-family: monospace; font-size: 13px; width: 60px; }
.col-main { color: #fff !important; font-size: 15px; }
.text-right { text-align: right; }
.badge { padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; display: inline-flex; align-items: center; gap: 5px; }
.badge-admin { background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); }
.badge-user { background: rgba(59, 130, 246, 0.15); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.3); }
.badge-vip { background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3); }
.badge-free { background: rgba(100, 116, 139, 0.15); color: #94a3b8; border: 1px solid rgba(100, 116, 139, 0.3); }
.action-btn { background: transparent; border: none; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; transition: 0.2s; font-size: 14px; margin-left: 5px; }
.action-btn.edit { color: #3b82f6; }
.action-btn.delete { color: #ef4444; }

/* MODALS */
.modal-backdrop { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.7); backdrop-filter: blur(5px); display: flex; align-items: center; justify-content: center; z-index: 2000; }
.modal-box { background: #1e293b; width: 500px; border-radius: 16px; border: 1px solid #334155; box-shadow: 0 25px 50px rgba(0,0,0,0.5); overflow: hidden; }
.modal-header { padding: 20px 25px; background: #0f172a; border-bottom: 1px solid #334155; display: flex; justify-content: space-between; align-items: center; }
.modal-header h3 { margin: 0; font-size: 16px; color: #fff; }
.btn-close { background: none; border: none; color: #94a3b8; font-size: 24px; cursor: pointer; }
.modal-body { padding: 25px; }
.input-group { margin-bottom: 18px; }
.input-group label { display: block; font-size: 13px; font-weight: 600; color: #94a3b8; margin-bottom: 8px; }
.input-group input, .input-group select, .input-group textarea { width: 100%; padding: 12px 15px; background: #0f172a; border: 1px solid #334155; color: #fff; border-radius: 10px; outline: none; font-family: inherit; font-size: 14px; box-sizing: border-box; }
.modal-footer { padding: 20px 25px; border-top: 1px solid #334155; background: #0f172a; display: flex; justify-content: flex-end; }
.btn-save { background: #3b82f6; color: white; border: none; padding: 12px 25px; border-radius: 10px; font-weight: bold; cursor: pointer; }

/* SETTINGS (CẤU HÌNH) */
.settings-grid { display: flex; flex-direction: column; gap: 20px; }
.settings-card { background: #1e293b; padding: 30px; border-radius: 16px; border: 1px solid #334155; }
.setting-row { display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 1px dashed #334155; }
.setting-text strong { display: block; color: #cbd5e1; font-size: 14px; margin-bottom: 4px; }
.setting-text p { margin: 0; color: #64748b; font-size: 12px; }
.switch { position: relative; display: inline-block; width: 46px; height: 24px; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #475569; transition: .3s; border-radius: 24px; }
.slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .3s; border-radius: 50%; }
input:checked + .slider { background-color: #3b82f6; }
input:checked + .slider:before { transform: translateX(22px); }

/* ANIMATIONS */
.fade-in { animation: fadeIn 0.4s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.slide-down { animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes slideDown { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
.toast-notification { position: fixed; bottom: 30px; left: 320px; padding: 15px 25px; border-radius: 10px; font-weight: 600; font-size: 14px; display: flex; align-items: center; gap: 10px; box-shadow: 0 10px 25px rgba(0,0,0,0.3); z-index: 9999; }
.toast-notification.success { background: #10b981; color: white; }
.toast-notification.error { background: #ef4444; color: white; }
/* --- HIỆU ỨNG TRẠNG THÁI HOẠT ĐỘNG (LIVE STATUS) --- */
.badge-cat { 
  background: rgba(16, 185, 129, 0.15); 
  color: #10b981; 
  border: 1px solid rgba(16, 185, 129, 0.3); 
  display: inline-flex;
  align-items: center;
}

/* Chấm xanh nhấp nháy */
.pulse-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  background-color: #10b981;
  border-radius: 50%;
  margin-right: 6px;
  box-shadow: 0 0 8px #10b981;
  animation: pulse-glow 1.5s infinite;
}

@keyframes pulse-glow {
  0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  70% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
  100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}
/* --- HIỆU ỨNG SÓNG RADAR CHO TỌA ĐỘ (GIS) --- */
.location-pulse {
  position: relative; 
  display: inline-block; 
  color: #ef4444; /* Màu đỏ của map marker */
  margin-right: 5px;
}
.location-pulse i { position: relative; z-index: 2; }
.location-pulse::after {
  content: ""; 
  position: absolute; 
  top: 50%; left: 50%;
  width: 10px; height: 10px; 
  background: rgba(239, 68, 68, 0.6);
  border-radius: 50%; 
  transform: translate(-50%, -50%);
  animation: radar-pulse 1.5s ease-out infinite; 
  z-index: 1;
}

@keyframes radar-pulse {
  0% { width: 10px; height: 10px; opacity: 1; }
  100% { width: 28px; height: 28px; opacity: 0; }
}

/* --- HIỆU ỨNG NHỊP TIM TÍM CHO CHUYÊN MỤC --- */
.pulse-dot-purple {
  display: inline-block; 
  width: 8px; height: 8px;
  background-color: #8b5cf6; 
  border-radius: 50%;
  margin-right: 6px; 
  box-shadow: 0 0 8px #8b5cf6;
  animation: pulse-glow-purple 1.5s infinite;
}

@keyframes pulse-glow-purple {
  0% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.7); }
  70% { box-shadow: 0 0 0 6px rgba(139, 92, 246, 0); }
  100% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0); }
}

</style>