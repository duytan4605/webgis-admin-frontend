import { createRouter, createWebHistory } from 'vue-router'
import AppHome from '../views/AppHome.vue'
import MapViewer from '../views/MapViewer.vue'
import AppLogin from '../views/Login.vue'
import PostDetail from '../views/PostDetail.vue'
// BƯỚC 1: Import file AdminPanel mới tạo vào đây
import AdminPanel from '../views/AdminPanel.vue' 

const routes = [
  { 
    path: '/', 
    name: 'Home',
    component: AppHome 
  },
  { 
    path: '/map', 
    name: 'Map',
    component: MapViewer 
  },
  { 
    path: '/login', 
    name: 'Login',
    component: AppLogin 
  },
  { 
    path: '/post/:id', 
    name: 'PostDetail',
    component: PostDetail 
  },
  // BƯỚC 2: Thêm đường dẫn cho trang Quản lý CSDL
  { 
    path: '/admin-db', 
    name: 'AdminPanel',
    component: AdminPanel 
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router