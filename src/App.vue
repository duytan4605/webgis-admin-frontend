<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
/* ĐÂY LÀ STYLE TỔNG (Global) - Áp dụng cho toàn bộ web */
body {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  background: #0f172a; /* Màu nền tối để không bị lộ dải trắng khi load */
  font-family: 'Inter', 'Segoe UI', sans-serif;
  overflow-x: hidden;
}

/* Tùy chỉnh thanh cuộn cho "ngầu" kiểu GIS */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: #0f172a;
}
::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: #3b82f6;
}
</style>