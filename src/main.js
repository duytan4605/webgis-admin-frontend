import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // Tự động tìm đến folder router/index.js

createApp(App).use(router).mount('#app')