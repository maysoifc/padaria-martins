<script setup>
import { RouterLink, RouterView } from 'vue-router'
import HomeView from './views/HomeView.vue';
import MenuView from './views/MenuView.vue';
import ProductDetail from './views/ProductDetail.vue';
import ProfileView from './views/ProfileView.vue';
import AppHeader from './components/AppHeader.vue';
import BottomNav from './components/BottomNav.vue';
import CategoryBar from './components/CategoryBar.vue';
import ProductCard from './components/ProductCard.vue';
</script>
<template>
  <div id="app">
    <BottomNav v-if="!$route.meta.hideNav" />

    <main class="content" :class="{ 'no-padding': $route.meta.hideNav }">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.content {
  padding-bottom: 70px;
}
.content.no-padding {
  padding-bottom: 0;
}
</style>
