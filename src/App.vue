<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
  created() {
    // 确保路由在应用启动时正确初始化
    this.$store.dispatch('router/initializeRoutes')
  }
}
</script>
